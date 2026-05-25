import Phaser from 'phaser';
import { SceneKeys, RegistryKeys } from '../keys.js';
import type { ScheduledEncounter } from '@core/domain/EncounterSpecNew.js';
import type { AssessmentResult } from '@core/assessments/types.js';
import type { EventBus } from '@core/events/EventBus.js';
import type { ModuleRegistry } from '@core/assessments/registry.js';
import type { AssessmentSceneData } from '../assessments/AssessmentScene.js';
import type { Line } from '@core/domain/Line.js';
import type { Stage } from '@core/domain/Stage.js';
import type { Significator } from '@core/domain/Significator.js';
import type { Drive } from '@core/domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection } from '@core/domain/enums.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '@core/engines/ConsequenceEngine.js';
import { narrateConsequence } from '../systems/ConsequenceNarrator.js';
import { accumulateTension, type PESTLETension } from '@core/engines/MacroCatalystEngine.js';
import { detectThreshold } from '@core/engines/TransformationDetector.js';
import type { WorldState } from '@core/engines/CandidateGeneration.js';
import type { SaveRepository } from '@infra/persistence/SaveRepository.js';
import type { ConsequenceRecord } from '@core/domain/ConsequenceRecord.js';
import { buildContext } from '@infra/llm/ContextPipeline.js';
import { queryLLM } from '@infra/llm/LLMClient.js';
import { parseConsequence, type ParsedConsequence } from '@infra/llm/ConsequenceParser.js';

export { routeModality } from '../logic/encounterRouting.js';

const PESTLE_DIMS: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];

export class EncounterScene extends Phaser.Scene {
  private encounter!: ScheduledEncounter;

  constructor() {
    super({ key: SceneKeys.Encounter });
  }

  create(data: { encounter: ScheduledEncounter }): void {
    this.encounter = data.encounter;

    if (!this.encounter) {
      this.scene.start(SceneKeys.World);
      return;
    }

    // Parse moduleRef (e.g. 'Cognitive:Red') into Line and Stage
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];

    // Look up the assessment module from registry
    const registry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;
    const module = registry?.get(line, stage);

    if (!module) {
      this.scene.start(SceneKeys.World);
      return;
    }

    // Launch AssessmentScene with the module and execution mode
    const sceneData: AssessmentSceneData = {
      module,
      mode: this.encounter.executionMode,
      modality: this.encounter.modality,
      encounter: this.encounter,
      onComplete: (result: AssessmentResult) => this.onAssessmentComplete(result),
    };

    this.scene.launch(SceneKeys.Assessment, sceneData);
    this.scene.pause();

    // Listen for completion
    const assessmentScene = this.scene.get(SceneKeys.Assessment);
    assessmentScene.events.once('assessment_done', () => {
      this.scene.stop(SceneKeys.Assessment);
      this.scene.resume();
    });
  }

  private async onAssessmentComplete(result: AssessmentResult): Promise<void> {
    const now = Date.now();
    const sig = this.registry.get(RegistryKeys.Significator) as Significator;
    const world = this.registry.get(RegistryKeys.WorldState) as WorldState;
    const eventBus = this.registry.get(RegistryKeys.EventBus) as EventBus | undefined;
    const saveRepo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    const registry = this.registry.get(RegistryKeys.ModuleRegistry) as ModuleRegistry | undefined;

    // Parse moduleRef (e.g. 'Cognitive:Red') into Line and Stage
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];

    // Build ConceptDraftIndex dynamically from the ModuleRegistry
    const conceptModules: Record<string, any> = {};
    if (registry) {
      for (const mod of registry.getAll()) {
        const key = `${mod.line.toLowerCase()}:${mod.stage.toLowerCase()}`;
        conceptModules[key] = {
          line: mod.line,
          stage: mod.stage,
          title: `${mod.line} ${mod.stage} Module`,
          modalities: mod.tasks.map(t => t.type === 'llm_dialogue' ? 'LanguageReflective' as const : 'Deterministic' as const),
        };
      }
    }
    const conceptIndex = { modules: conceptModules };

    // Fetch recent consequences from the registry
    const history = (this.registry.get('recent_consequences') as ConsequenceRecord[] | undefined) ?? [];

    // Build encounter prompt context
    const contextInput = {
      encounter: this.encounter,
      significator: sig,
      holonRegistry: { holons: world.holons },
      conceptIndex,
      recentConsequences: history,
      sessionContext: { energy: 'high' as const },
    };
    const context = buildContext(contextInput);

    const consequenceSystemPrompt = `${context.systemPrompt}
[CONSEQUENCE RULES] You must evaluate the outcome of the player's interaction.
Based on the encounter result (passed: ${result.passed}, score: ${result.dimensions.accuracy ?? 0.5}), determine the consequence of this action.
You must output a single JSON object matching the following structure:
{
  "affectedHolons": [
    { "holonId": string, "field": "relationshipStrength", "delta": number }
  ],
  "polarityDirection": "sto" | "sts" | "neutral",
  "polarityMagnitude": number,
  "shadowSignal": {
    "quadrant": "DarkAddiction" | "DarkAllergy" | "GoldenAddiction" | "GoldenAllergy",
    "line": string,
    "intensity": number
  } | null,
  "narrativeSummary": string
}
Keep "delta" values within [-0.3, 0.3]. Keep "narrativeSummary" short, third-person, immersive, and do not reference any developer terms or scores.
Respond ONLY with this JSON.`;

    // Offline fallback for consequence parsing
    let parsed: ParsedConsequence;
    
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : process.env;
    const baseUrl = env?.VITE_LLM_BASE_URL as string | undefined;
    const apiKey = env?.VITE_LLM_API_KEY as string | undefined;
    const model = env?.VITE_LLM_MODEL as string | undefined;
    const isOnline = baseUrl && apiKey && apiKey !== 'sk-placeholder' && model;

    if (isOnline) {
      const userMessage = `The player has completed the encounter:
Encounter ID: ${this.encounter.id}
Line: ${line}
Stage: ${stage}
Result Passed: ${result.passed}
Accuracy/Performance Score: ${result.dimensions.accuracy ?? 0.5}
`;
      try {
        const llmOutput = await queryLLM(consequenceSystemPrompt, userMessage);
        const parseResult = parseConsequence(llmOutput, this.encounter);
        if (parseResult.success && parseResult.record) {
          parsed = parseResult.record;
        } else {
          parsed = getFallbackConsequence(this.encounter, result);
        }
      } catch {
        parsed = getFallbackConsequence(this.encounter, result);
      }
    } else {
      parsed = getFallbackConsequence(this.encounter, result);
    }

    // Map ParsedConsequence to PlayerResponse
    let energeticDirection: EnergeticDirection = 'Diffuse';
    if (parsed.polarityDirection === 'sto') energeticDirection = 'Radiative';
    else if (parsed.polarityDirection === 'sts') energeticDirection = 'Absorptive';

    const dir: DriveDirectionality = result.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality = { Agency: dir, Communion: dir, Eros: dir, Agape: dir } as Record<Drive, DriveDirectionality>;

    let shadowSurfaced: ShadowQuadrant | null = null;
    if (parsed.shadowSignal) {
      const quad = parsed.shadowSignal.quadrant;
      if (['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'].includes(quad)) {
        shadowSurfaced = quad as ShadowQuadrant;
      }
    }

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality,
      stageOrientation: parsed.polarityDirection === 'sto' ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: parsed.polarityDirection === 'sto' ? 'HigherRealm' : (parsed.polarityDirection === 'sts' ? 'LowerRealm' : 'Ambivalent'),
      shadowSurfaced,
      shadowResolvedId: null,
      narrativeSummary: parsed.narrativeSummary,
    };

    // Process outcome
    const record = processOutcome(this.encounter, response, now);

    // Map affectedHolons to holonDeltas
    const holonDeltas = parsed.affectedHolons.map(h => {
      const existing = world.npcRelationships.find(r => r.holonId === h.holonId);
      const oldValue = existing ? existing.strength : 0.5;
      const newValue = Math.max(0, Math.min(1, oldValue + h.delta));
      return {
        holonId: h.holonId,
        field: h.field,
        oldValue,
        newValue,
      };
    });

    const updatedRecord = {
      ...record,
      holonDeltas,
    };

    // Apply consequences
    const updated = applyConsequences(sig, world, updatedRecord, this.encounter);

    // Accumulate PESTLE tension on a random dimension
    const dim = PESTLE_DIMS[Math.floor(Math.random() * PESTLE_DIMS.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );
    const updatedWorld = { ...updated.world, pestleTension: newTension } as WorldState;

    // Detect transformation threshold
    const transformation = detectThreshold(updated.sig);

    // Update registry
    this.registry.set(RegistryKeys.Significator, updated.sig);
    this.registry.set(RegistryKeys.WorldState, updatedWorld);
    this.registry.set('recent_consequences', [...history, updatedRecord]);

    // Persist
    saveRepo?.saveProfile(updated.sig);

    // Emit events
    if (eventBus) {
      eventBus.emit('module_lifecycle_scored', { module: { line, stage }, result });
      eventBus.emit('encounter_completed', { record: updatedRecord });
      if (transformation) {
        eventBus.emit('transformation_triggered', { signal: transformation });
      }
    }

    const narration = narrateConsequence(this.encounter.modality, result.passed);
    this.scene.start(SceneKeys.World, { consequenceText: parsed.narrativeSummary || narration.text });
  }
}

function getFallbackConsequence(encounter: ScheduledEncounter, result: AssessmentResult): ParsedConsequence {
  const line = encounter.targetLines[0] ?? 'Cognitive';
  const affectedHolons = encounter.holonSource
    ? [{ holonId: encounter.holonSource, field: 'relationshipStrength', delta: result.passed ? 0.05 : -0.05 }]
    : [];
  
  return {
    affectedHolons,
    polarityDirection: result.passed ? 'sto' : 'sts',
    polarityMagnitude: 0.1,
    shadowSignal: result.passed
      ? null
      : {
          quadrant: 'DarkAddiction',
          line,
          intensity: 0.3,
        },
    narrativeSummary: result.passed
      ? `The player successfully navigated the challenge of ${encounter.moduleRef}.`
      : `The player was unable to overcome the obstacle at ${encounter.moduleRef}.`,
  };
}
