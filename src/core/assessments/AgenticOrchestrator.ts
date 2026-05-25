import type { AssessmentResult, ShadowAssessmentResult, MeasureDimension } from './types.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import type { Drive } from '../domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection } from '../domain/enums.js';
import { buildContext } from '../../infra/llm/ContextPipeline.js';
import { queryLLMWithTools } from '../../infra/llm/LLMClient.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '../engines/ConsequenceEngine.js';
import { accumulateTension, type PESTLETension } from '../engines/MacroCatalystEngine.js';
import type { AgentMessage, AskUserQuestionParams, AskUserQuestionResult } from './agentTypes.js';

const PESTLE_DIMS: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];

export interface AgenticUIHandler {
  askUser(params: AskUserQuestionParams): Promise<AskUserQuestionResult>;
}

export interface OrchestratorResult {
  readonly updatedSig: Significator;
  readonly updatedWorld: WorldState;
  readonly finalResult: AssessmentResult | ShadowAssessmentResult;
  readonly consequenceRecord: ConsequenceRecord;
  readonly narrativeSummary: string;
  readonly messages: readonly AgentMessage[];
}

export const ASK_USER_QUESTION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'ask_user_question',
    description: 'Ask the user one or more multiple-choice questions (MCQs), with options, tab headers, and optional write-in options. Renders in the UI, blocks until user responds, and returns their answers.',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string', description: 'The main prompt or dialogue text from the NPC.' },
              header: { type: 'string', description: 'Short label (max 12 chars) shown as the tab title.' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string', description: 'Concise option text (1-5 words).' },
                    description: { type: 'string', description: 'Developmental or choice description.' },
                    preview: { type: 'string', description: 'Optional markdown, code, or ASCII art preview.' }
                  },
                  required: ['label', 'description']
                }
              },
              multiSelect: { type: 'boolean', description: 'True for checkbox toggles, false for single radio button choice.' },
              allowWriteIn: { type: 'boolean', description: 'True to present a text box for the 5th option write-in.' }
            },
            required: ['question', 'header', 'options', 'multiSelect']
          }
        }
      },
      required: ['questions']
    }
  }
};

export const COMPLETE_ENCOUNTER_TOOL = {
  type: 'function' as const,
  function: {
    name: 'complete_encounter',
    description: 'Concludes the encounter. Evaluates the player based on their choices and responses, delivering scores, feedback, polarity direction, and shadow signals.',
    parameters: {
      type: 'object',
      properties: {
        passed: { type: 'boolean', description: 'Whether the player successfully demonstrated or integrated the capacity.' },
        scores: {
          type: 'object',
          description: 'Scores (0.0 to 1.0) on the relevant developmental dimensions measured by the task trials.',
          properties: {
            accuracy: { type: 'number' },
            response_time: { type: 'number' },
            consistency: { type: 'number' },
            depth: { type: 'number' },
            self_correction: { type: 'number' },
            complexity_handled: { type: 'number' },
            transfer: { type: 'number' },
            metacognition: { type: 'number' },
            coherence: { type: 'number' },
            integration: { type: 'number' }
          }
        },
        feedback: { type: 'string', description: 'Supportive developmental feedback explaining what their responses indicate about their drive-health or stage expression.' },
        polarityDirection: { type: 'string', enum: ['sto', 'sts', 'neutral'], description: 'The polarity direction indicated by the player\'s choices.' },
        shadowSignal: {
          type: 'object',
          description: 'Optional shadow signal surfaced during this encounter.',
          properties: {
            quadrant: { type: 'string', enum: ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'] },
            intensity: { type: 'number', description: 'Intensity score (0.0 to 1.0) of the shadow expression.' }
          },
          required: ['quadrant', 'intensity']
        },
        narrativeSummary: { type: 'string', description: 'Immersive, third-person narrative summary of what occurred in the story world, omitting technical developer terms.' }
      },
      required: ['passed', 'feedback', 'polarityDirection', 'narrativeSummary']
    }
  }
};

const TOOLS = [ASK_USER_QUESTION_TOOL, COMPLETE_ENCOUNTER_TOOL];

export class AgenticOrchestrator {
  private encounter: ScheduledEncounter;
  private significator: Significator;
  private world: WorldState;
  private history: ConsequenceRecord[];
  private conceptIndex: any;
  private uiHandler: AgenticUIHandler;
  private messages: AgentMessage[] = [];

  constructor(params: {
    encounter: ScheduledEncounter;
    significator: Significator;
    world: WorldState;
    history: ConsequenceRecord[];
    conceptIndex: any;
    uiHandler: AgenticUIHandler;
    initialMessages?: readonly AgentMessage[];
  }) {
    this.encounter = params.encounter;
    this.significator = params.significator;
    this.world = params.world;
    this.history = params.history;
    this.conceptIndex = params.conceptIndex;
    this.uiHandler = params.uiHandler;
    this.messages = params.initialMessages ? [...params.initialMessages] : [];
  }

  public async run(): Promise<OrchestratorResult> {
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];
    const now = Date.now();

    // 1. Build context system prompt
    const contextInput = {
      encounter: this.encounter,
      significator: this.significator,
      holonRegistry: { holons: this.world.holons },
      conceptIndex: this.conceptIndex,
      recentConsequences: this.history,
      sessionContext: { energy: 'high' as const },
    };
    const context = buildContext(contextInput);

    const systemPrompt = `${context.systemPrompt}
[AGENT RULES]
1. You are the Agentic Game Master driving this developmental encounter.
2. Present the encounter situationally and narratively. If you need to present stimuli, choices, or ask questions, ALWAYS call the 'ask_user_question' tool. Do not ask questions in raw text responses.
3. Keep the flow interactive, building upon prior answers.
4. When you have gathered enough responses (typically 1-3 choice cycles) or completed the encounter, call 'complete_encounter' to finalize scores, write the narrative summary, and close the session.`;

    if (this.messages.length === 0) {
      this.messages.push({
        role: 'user',
        content: `Start the encounter: ${this.encounter.id} (${line} - ${stage}). Introduce the scene and ask the first question.`
      });
    }

    let loopCount = 0;
    const maxLoops = 10; // Safety guard

    while (loopCount < maxLoops) {
      loopCount++;

      // Request next turn from LLM
      const res = await queryLLMWithTools(systemPrompt, this.messages, TOOLS);

      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: res.content,
        toolCalls: res.toolCalls,
      };
      this.messages.push(assistantMsg);

      if (res.toolCalls && res.toolCalls.length > 0) {
        // Execute tool calls
        for (const tc of res.toolCalls) {
          if (tc.function.name === 'ask_user_question') {
            const params = JSON.parse(tc.function.arguments) as AskUserQuestionParams;
            
            // Present to UI (Phaser or CLI)
            const result = await this.uiHandler.askUser(params);

            // Record tool response
            this.messages.push({
              role: 'tool',
              content: JSON.stringify(result),
              toolCallId: tc.id,
              name: 'ask_user_question'
            });
          } else if (tc.function.name === 'complete_encounter') {
            const params = JSON.parse(tc.function.arguments) as {
              passed: boolean;
              scores?: Partial<Record<MeasureDimension, number>>;
              feedback: string;
              polarityDirection: 'sto' | 'sts' | 'neutral';
              shadowSignal?: {
                quadrant: ShadowQuadrant;
                intensity: number;
              };
              narrativeSummary: string;
            };

            // Process completion
            const finalResult = this.createAssessmentResult(params.passed, params.scores || {});
            const outcome = this.finalizeEncounter(params, now);

            return {
              ...outcome,
              finalResult,
              messages: this.messages,
            };
          }
        }
      } else {
        // Fallback: If assistant didn't call any tools, prompt it to proceed
        this.messages.push({
          role: 'user',
          content: 'Continue with the encounter. If the encounter is complete, call complete_encounter. Otherwise, call ask_user_question.'
        });
      }
    }

    // Safety fallback termination if we loop too many times
    const fallbackParams = {
      passed: true,
      feedback: 'Encounter completed via timeout.',
      polarityDirection: 'neutral' as const,
      narrativeSummary: `The player successfully navigated the challenge of ${this.encounter.moduleRef}.`,
    };
    const finalResult = this.createAssessmentResult(true, {});
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
    };
  }

  private createAssessmentResult(passed: boolean, scores: Partial<Record<MeasureDimension, number>>): AssessmentResult {
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];
    const dimensions: Record<MeasureDimension, number> = {
      accuracy: scores.accuracy ?? 0.5,
      response_time: scores.response_time ?? 0.5,
      consistency: scores.consistency ?? 0.5,
      depth: scores.depth ?? 0.5,
      self_correction: scores.self_correction ?? 0.5,
      complexity_handled: scores.complexity_handled ?? 0.5,
      transfer: scores.transfer ?? 0.5,
      metacognition: scores.metacognition ?? 0.5,
      coherence: scores.coherence ?? 0.5,
      integration: scores.integration ?? 0.5,
    };

    return {
      line,
      stage,
      passed,
      confidence: 0.8,
      dimensions,
      rawTrials: [],
    };
  }

  private finalizeEncounter(
    params: {
      passed: boolean;
      feedback: string;
      polarityDirection: 'sto' | 'sts' | 'neutral';
      shadowSignal?: {
        quadrant: ShadowQuadrant;
        intensity: number;
      };
      narrativeSummary: string;
    },
    now: number
  ): Omit<OrchestratorResult, 'finalResult' | 'messages'> {
    let energeticDirection: EnergeticDirection = 'Diffuse';
    if (params.polarityDirection === 'sto') energeticDirection = 'Radiative';
    else if (params.polarityDirection === 'sts') energeticDirection = 'Absorptive';

    const dir: DriveDirectionality = params.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality = { Agency: dir, Communion: dir, Eros: dir, Agape: dir } as Record<Drive, DriveDirectionality>;

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality,
      stageOrientation: params.polarityDirection === 'sto' ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: params.polarityDirection === 'sto' ? 'HigherRealm' : (params.polarityDirection === 'sts' ? 'LowerRealm' : 'Ambivalent'),
      shadowSurfaced: params.shadowSignal?.quadrant || null,
      shadowResolvedId: null,
      narrativeSummary: params.narrativeSummary,
    };

    const record = processOutcome(this.encounter, response, now);

    // Map affectedHolons if any (we can default to modifying the primary sourcing holon)
    let holonDeltas: ConsequenceRecord['holonDeltas'] = [];
    if (this.encounter.holonSource) {
      const existing = this.world.npcRelationships.find(r => r.holonId === this.encounter.holonSource);
      const oldValue = existing ? existing.strength : 0.5;
      const delta = params.passed ? 0.05 : -0.05;
      const newValue = Math.max(0, Math.min(1, oldValue + delta));
      holonDeltas = [{
        holonId: this.encounter.holonSource,
        field: 'relationshipStrength',
        oldValue,
        newValue,
      }];
    }

    const updatedRecord = {
      ...record,
      holonDeltas,
    };

    // Apply consequences
    const updated = applyConsequences(this.significator, this.world, updatedRecord, this.encounter);

    // Accumulate PESTLE tension
    const dim = PESTLE_DIMS[Math.floor(Math.random() * PESTLE_DIMS.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );
    const updatedWorld = { ...updated.world, pestleTension: newTension } as WorldState;

    return {
      updatedSig: updated.sig,
      updatedWorld,
      consequenceRecord: updatedRecord,
      narrativeSummary: params.narrativeSummary,
    };
  }
}
