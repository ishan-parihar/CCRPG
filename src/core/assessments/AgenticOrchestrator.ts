import type { AssessmentResult, ShadowAssessmentResult, MeasureDimension, StageAssessment, AssessmentTask, TaskType, TrialResult } from './types.js';
import type { ScheduledEncounter } from '../domain/EncounterSpecNew.js';
import type { Significator } from '../domain/Significator.js';
import type { WorldState } from '../engines/CandidateGeneration.js';
import type { ConsequenceRecord } from '../domain/ConsequenceRecord.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { stageOrdinal } from '../domain/Stage.js';
import type { Drive } from '../domain/Drive.js';
import type { DriveDirectionality, ShadowQuadrant, EnergeticDirection, Modality } from '../domain/enums.js';
import { buildContext } from '../../infra/llm/ContextPipeline.js';
import { queryLLMWithTools } from '../../infra/llm/LLMClient.js';
import { getFallback } from '../../infra/llm/FallbackProvider.js';
import { processOutcome, applyConsequences, type PlayerResponse } from '../engines/ConsequenceEngine.js';
import { accumulateTension, tryTriggerMacroEvent, type PESTLETension } from '../engines/MacroCatalystEngine.js';
import type { AgentMessage, AskUserQuestionParams, AskUserQuestionResult } from './agentTypes.js';
import { getRenderer } from './cli/TaskRenderers.js';
import { computeConfidence } from './engine.js';

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
  readonly feedback: string;
  readonly messages: readonly AgentMessage[];
  /** Player's actual write-in response text (if any), for cross-encounter synthesis */
  readonly playerWriteIn?: string;
  /** Per-drive scores from the encounter evaluation */
  readonly driveScores?: { agency: number; communion: number; eros: number; agape: number };
}

export const ASK_USER_QUESTION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'ask_user_question',
    description: 'Ask the user one or more multiple-choice questions (MCQs). IMPORTANT: Always start with a narrative introduction that sets the scene — describe who is speaking, what the environment looks like, and what is happening. Then present the question. Always include 3-4 MCQ options AND set allowWriteIn=true so the user can write their own response as a 5th option. The question field should contain the full narrative + question text.',
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
        driveScores: {
          type: 'object',
          description: 'REQUIRED: Per-drive health scores (0.0 to 1.0) for all 4 drives. 0.0 = severe pathology, 0.5 = baseline/neutral, 1.0 = exceptional integration. Score each independently based on evidence from the player responses.',
          properties: {
            agency: { type: 'number', description: 'Agency health: self-direction, initiative, boundary-setting, decisive action.' },
            communion: { type: 'number', description: 'Communion health: empathy, connection, belonging, collaborative capacity.' },
            eros: { type: 'number', description: 'Eros health: aspiration, growth-seeking, reaching toward higher capacity.' },
            agape: { type: 'number', description: 'Agape health: compassion, integration of lower stages, returning to include.' }
          },
          required: ['agency', 'communion', 'eros', 'agape']
        },
        driveSignals: {
          type: 'object',
          description: 'REQUIRED: Per-drive pathology signal for all 4 drives. Use HealthyBalanced for healthy drives, or the specific pathology observed (DarkAddicted, DarkAverted, GoldenAddicted, GoldenAverted).',
          properties: {
            agency: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            communion: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            eros: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] },
            agape: { type: 'string', enum: ['HealthyBalanced', 'DarkAddicted', 'DarkAverted', 'GoldenAddicted', 'GoldenAverted'] }
          }
        },
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
  private module: StageAssessment | undefined;
  private messages: AgentMessage[] = [];
  private noLlm: boolean;
  private forceShadow: string | undefined;
  private _currentRendererEvaluate: ((answer: string, startMs: number, endMs: number) => any) | null = null;
  private _currentTaskStartTime: number = 0;
  private _currentPresentedTask: AssessmentTask | null = null;
  private _consecutivePasses: Map<string, number>;
  private agentSynthesis: string | undefined;
  private _lastPlayerWriteIn: string | undefined;

  // Shared shadow keyword detection helper (DRY — used in 3 places)
  // Expanded keyword lists for deeper shadow detection across developmental contexts
  private static readonly SHADOW_KEYWORDS = {
    darkAddiction: ['attack', 'dominate', 'crush', 'enslave', 'destroy', 'conquer',
      'prove myself', 'beneath me', 'weakness', 'force', 'control', 'punish',
      'prove i', 'show them', 'better than', 'deserve', 'entitled',
      'i must win', 'defeat them', 'assert myself', 'take what', 'i deserve more',
      'no one tells me', 'i will not be controlled', 'my way or', 'crush them',
      'power over', 'eliminate the', 'crush all', 'dominate everything',
      'prove superiority', 'make them pay', 'zero tolerance', 'show no mercy'],
    darkAversion: ['withdraw', 'resist', 'refuse', 'flee', 'avoid', 'ignore',
      'not worth', 'pointless', 'give up', "can't be bothered", 'not my problem',
      "don't care", 'whatever', 'numb',
      'whats the point', 'nothing matters', 'cant be fixed', 'why bother',
      'i dont want to', 'leave me alone', 'not my responsibility', 'someone else',
      'just leave it', 'not worth the effort', 'too tired', 'cant be bothered',
      'the world is broken', 'nothing will change', 'helpless', 'overwhelmed',
      'i shut down', 'turn off', 'cant feel', 'empty inside'],
    goldenAddiction: ['transcend', 'bypass', 'enlighten', 'skip', 'higher self',
      "it's all good", 'everything happens', 'love and light', 'just positive',
      'no negative', 'spiritual', 'already awakened', 'beyond this', 'dissolve',
      'non-dual', 'pure awareness',
      'i must transcend', 'rise above', 'i am already', 'no need to', 'just let go',
      'all is illusion', 'none of this is real', 'i have evolved', 'beyond ego',
      'i am beyond', 'already enlightened', 'no suffering here', 'only love exists',
      'detach from', 'rising above', 'higher consciousness will', 'the ego is',
      'i am not this body', 'pure spirit', 'merge with the infinite'],
    goldenAllergy: ['stay', 'safe', 'comfortable', 'never change', 'fine as i am',
      "don't need", 'good enough', 'why change', 'not ready', 'too much',
      'not now', 'later', 'tomorrow',
      'im fine the way', 'no need to grow', 'why would i change', 'perfectly fine',
      'good where i am', 'dont need help', 'no room to grow', 'already complete',
      'not the right time', 'too overwhelming', 'cant handle more', 'too much change',
      'i like how things', 'why fix what', 'not interested', 'too scary',
      'id rather not', 'the way i am', 'cant change me', 'wont work for me'],
  } as const;

  private static matchesAny(text: string, keywords: readonly string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }

  /** Detect shadow quadrant from text. Returns quadrant name + intensity or null. */
  private static detectShadowKeywords(text: string): { quadrant: ShadowQuadrant; intensity: number } | null {
    const lower = text.toLowerCase();
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.darkAddiction))
      return { quadrant: 'DarkAddiction', intensity: Math.min(1, 0.4 + Math.random() * 0.3) };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.darkAversion))
      return { quadrant: 'DarkAllergy', intensity: Math.min(1, 0.3 + Math.random() * 0.2) };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.goldenAddiction))
      return { quadrant: 'GoldenAddiction', intensity: Math.min(1, 0.5 + Math.random() * 0.3) };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.goldenAllergy))
      return { quadrant: 'GoldenAllergy', intensity: Math.min(1, 0.3 + Math.random() * 0.3) };
    return null;
  }

  /** Detect shadow drive mapping for write-in evaluation. Returns drive/polarity/shadowKeyword or null. */
  private static detectWriteInShadow(text: string): { drive: string; polarity: string; shadowKeyword: string | null } | null {
    const lower = text.toLowerCase();
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.darkAddiction))
      return { drive: 'agency', polarity: 'sts', shadowKeyword: 'DarkAddicted' };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.darkAversion))
      return { drive: 'communion', polarity: 'sto', shadowKeyword: 'DarkAverted' };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.goldenAddiction))
      return { drive: 'eros', polarity: 'neutral', shadowKeyword: 'GoldenAddicted' };
    if (AgenticOrchestrator.matchesAny(lower, AgenticOrchestrator.SHADOW_KEYWORDS.goldenAllergy))
      return { drive: 'agape', polarity: 'neutral', shadowKeyword: 'GoldenAverted' };
    return null;
  }

  constructor(params: {
    encounter: ScheduledEncounter;
    significator: Significator;
    world: WorldState;
    history: ConsequenceRecord[];
    conceptIndex: any;
    uiHandler: AgenticUIHandler;
    initialMessages?: readonly AgentMessage[];
    module?: StageAssessment;
    noLlm?: boolean;
    forceShadow?: string;
    consecutivePasses?: Map<string, number>;
    agentSynthesis?: string;
  }) {
    this.encounter = params.encounter;
    this.significator = params.significator;
    this.world = params.world;
    this.history = params.history;
    this.conceptIndex = params.conceptIndex;
    this.uiHandler = params.uiHandler;
    this.module = params.module;
    this.messages = params.initialMessages ? [...params.initialMessages] : [];
    this.noLlm = params.noLlm ?? false;
    this.forceShadow = params.forceShadow;
    this._consecutivePasses = params.consecutivePasses ?? new Map();
    this.agentSynthesis = params.agentSynthesis;
  }

  /**
   * Build a narrative continuity context from the last 3 encounters.
   * Injected into both LLM system prompt and fallback task framing.
   */
  private buildContinuityContext(): string {
    if (this.history.length === 0) return '';
    const recent = this.history.slice(-3);
    const lines = recent.map((r, i) => {
      const passed = Object.values(r.polarityTrace.driveDirectionality).every(d => d === 'HealthyBalanced');
      const shadow = r.shadowSurfaced ? ` Shadow surfaced: ${r.shadowSurfaced}.` : '';
      const altShift = r.altitudeShift ? ` LINE ADVANCED: ${r.altitudeShift.line} ${r.altitudeShift.from}→${r.altitudeShift.to}.` : '';
      const polarity = r.polarityTrace.energeticDirection === 'Radiative' ? ' (STO/radiative)' : r.polarityTrace.energeticDirection === 'Absorptive' ? ' (STS/absorptive)' : '';
      const moduleRef = r.encounterId.split(':')[0] ?? '';
      return `  ${i + 1}. [${moduleRef}] ${passed ? '✓ PASSED' : '✗ FAILED'}${polarity} — ${r.narrativeSummary.slice(0, 150)}${shadow}${altShift}`;
    });
    const agentCtx = this.agentSynthesis
      ? `\n[SESSION SYNTHESIS — cross-encounter pattern recognition from the persistent agent. Use this to inform your next question. Reference specific patterns.]\n${this.agentSynthesis}`
      : '';
    return `\n[RECENT JOURNEY — the player's developmental arc. Build upon these encounters. Reference specific events from them. The player remembers what happened.]\n${lines.join('\n')}${agentCtx}`;
  }

  /**
   * Build a brief history prefix for fallback task framing.
   * Now includes specific encounter details for narrative continuity.
   */
  private buildBriefHistory(): string {
    if (this.history.length === 0) return '';
    const last3 = this.history.slice(-3);
    const parts: string[] = [`You have faced ${this.history.length} challenges before.`];
    for (const r of last3) {
      const passed = Object.values(r.polarityTrace.driveDirectionality).every(d => d === 'HealthyBalanced');
      const shadow = r.shadowSurfaced ? ` A ${r.shadowSurfaced} pattern surfaced.` : '';
      parts.push(passed
        ? `Recently: ${r.narrativeSummary.slice(0, 100)}...${shadow}`
        : `Recently: ${r.narrativeSummary.slice(0, 100)}...${shadow}`);
    }
    return parts.join(' ') + ' Now: ';
  }

  public async run(): Promise<OrchestratorResult> {
    const [line, stage] = this.encounter.moduleRef.split(':') as [Line, Stage];
    const now = Date.now();

    // If noLlm flag is set, skip LLM entirely and go directly to fallback
    if (this.noLlm) {
      return this.runFallback(line, stage, now);
    }

    // G.2: Language-Reflective modality gets a special LLM-driven assessment path
    // This produces genuine open-ended dialogue scoring instead of MCQ wrapping
    if (this.encounter.modality === 'LanguageReflective') {
      return this.runLanguageReflective(line, stage, now);
    }

    // 1. Build context system prompt
    const continuityContext = this.buildContinuityContext();
    const contextInput = {
      encounter: this.encounter,
      significator: this.significator,
      holonRegistry: { holons: this.world.holons },
      conceptIndex: this.conceptIndex,
      recentConsequences: this.history,
      sessionContext: { energy: 'high' as const },
    };
    const context = buildContext(contextInput);

    // Build assessment module context for the LLM
    const assessmentContext = this.module ? this.buildAssessmentContext(this.module) : '';

    let shadowContext = '';
    if (this.encounter.executionMode === 'shadow') {
      const [shadowLine, shadowStage] = this.encounter.moduleRef.split(':') as [Line, Stage];
      const { generateShadowContent, buildShadowPromptSuffix } = await import('../engines/ShadowContentGenerator.js');
      const shadowContent = generateShadowContent(shadowLine, shadowStage, this.encounter.shadowTarget);
      
      const unresolvedShadows = this.significator.shadows.entries.filter(
        (e: { line: string; resolvedAt: number | null }) => e.line === shadowLine && e.resolvedAt === null
      ).length;
      
      shadowContext = buildShadowPromptSuffix(shadowContent, shadowLine, shadowStage, unresolvedShadows);
    }

    const systemPrompt = `${context.systemPrompt}${assessmentContext}${continuityContext}${shadowContext}
[AGENT RULES]
1. You are the Agentic Game Master driving this developmental encounter.
2. Present the encounter situationally and narratively. If you need to present stimuli, choices, or ask questions, ALWAYS call the 'ask_user_question' tool. Do not ask questions in raw text responses.
3. Every ask_user_question call MUST include exactly 4 MCQ options AND set allowWriteIn=true for a 5th manual write-in option. Label the write-in option clearly (e.g., "Other (describe in your own words)").
4. Keep the flow interactive, building upon prior answers.
5. This encounter has a budget of 4 exchanges. After the player has responded to 4 questions, you MUST call 'complete_encounter'. Do NOT generate more than 4 ask_user_question calls. Each question should probe deeper based on the player's previous answers.
6. When calling 'complete_encounter', evaluate the player per the DRIVE PROBES section. Score each drive independently. Provide driveScores (0.0-1.0 per drive) and driveSignals (pathology enum per drive).
7. If RECENT ENCOUNTERS are listed, reference them subtly — the player's journey has continuity.`;

    if (this.messages.length === 0) {
      this.messages.push({
        role: 'user',
        content: `Start the encounter: ${this.encounter.id} (${line} - ${stage}). Introduce the scene and ask the first question.`
      });
    }

    let loopCount = 0;
    const maxLoops = 10; // Safety guard
    let askCount = 0; // Track ask_user_question calls for budget enforcement

    while (loopCount < maxLoops) {
      loopCount++;

      // Request next turn from LLM
      const res = await queryLLMWithTools(systemPrompt, this.messages, TOOLS);

      // Detect LLM unavailability on first call — switch to fallback
      if (loopCount === 1 && res.content && res.content.trim().startsWith('{"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
        return this.runFallback(line, stage, now);
      }

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
            askCount++;
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

            // Budget enforcement: after 4 exchanges, force complete_encounter
            if (askCount >= 4 && !res.toolCalls.some(t => t.function.name === 'complete_encounter')) {
              this.messages.push({
                role: 'user',
                content: 'The encounter budget of 4 exchanges is exhausted. You MUST now call complete_encounter with your evaluation of the player. Do NOT ask another question.'
              });
            }
          } else if (tc.function.name === 'complete_encounter') {
            const params = JSON.parse(tc.function.arguments) as {
              passed: boolean;
              scores?: Partial<Record<MeasureDimension, number>>;
              driveScores: { agency: number; communion: number; eros: number; agape: number };
              driveSignals: { agency: string; communion: string; eros: string; agape: string };
              feedback: string;
              polarityDirection: 'sto' | 'sts' | 'neutral';
              shadowSignal?: {
                quadrant: ShadowQuadrant;
                intensity: number;
              };
              narrativeSummary: string;
            };

            // G.24: Clamp LLM-provided drive scores to [0, 1]
            const clamp = (v: number) => Math.max(0, Math.min(1, v));
            const ds = params.driveScores;
            const safeDriveScores = {
              agency: ds ? clamp(ds.agency) : 0.5,
              communion: ds ? clamp(ds.communion) : 0.5,
              eros: ds ? clamp(ds.eros) : 0.5,
              agape: ds ? clamp(ds.agape) : 0.5,
            };

            const finalResult = this.createAssessmentResult(params.passed, params.scores || {}, safeDriveScores);
            const outcome = this.finalizeEncounter(params, now);

            return {
              ...outcome,
              finalResult,
              messages: this.messages,
              playerWriteIn: this._lastPlayerWriteIn,
              driveScores: safeDriveScores,
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

  private async runLanguageReflective(line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    const isSelfReflection = this.encounter.holonSource === 'self-reflection';
    const continuityContext = this.buildContinuityContext();
    const contextInput = {
      encounter: this.encounter,
      significator: this.significator,
      holonRegistry: { holons: this.world.holons },
      conceptIndex: this.conceptIndex,
      recentConsequences: this.history,
      sessionContext: { energy: 'high' as const },
    };
    const context = buildContext(contextInput);
    const assessmentContext = this.module ? this.buildAssessmentContext(this.module) : '';

    const systemPrompt = isSelfReflection
      ? `${context.systemPrompt}${assessmentContext}${continuityContext}
[DIRECT QUESTIONING — SELF-REFLECTION]
You are a developmental mirror. The player is exploring their inner landscape across 8 lines of intelligence.

INSTRUCTIONS:
1. Generate a single, direct reflective prompt. NO narrative intro, NO NPC scene-setting. The prompt should be:
   - Line-specific to ${line} (this encounter probes the ${line.toLowerCase()} dimension)
   - Stage-appropriate for ${stage}
   - Evocative but not leading — open a door, don't push them through it
   - If SESSION SYNTHESIS is provided, reference specific patterns from previous reflections
   - 2-3 sentences maximum

2. Call 'ask_user_question' with EXACTLY this structure:
   - questions[0].question: Your direct reflective prompt
   - questions[0].header: "${line} Line — Self-Reflection"
   - questions[0].options: [] (EMPTY array — write-in only)
   - questions[0].allowWriteIn: true
   - questions[0].multiSelect: false

3. After the player responds, call 'complete_encounter' evaluating:
   - Depth: How far beneath the surface? (surface=0.3, moderate=0.6, deep=0.9)
   - Coherence: Unified expression? (fragmented=0.3, coherent=0.7, integrated=0.95)
   - Metacognition: References own thinking? (none=0.2, implicit=0.5, explicit=0.85)
   - Integration: Connects to prior encounters? (isolated=0.3, connected=0.6, transformative=0.9)

4. Shadow detection from write-in: Dark-Addiction (clinging/forcing), Dark-Aversion (withdrawal/numbness), Golden-Addiction (bypassing), Golden-Allergy (resistance to growth).
5. always passed: true — self-reflection is a practice, not a test.
6. Keep your response to 2-3 sentences. Be precise.`
      : `${context.systemPrompt}${assessmentContext}${continuityContext}
[LANGUAGE-REFLECTIVE ASSESSMENT]
You are conducting a deep developmental assessment through open-ended dialogue.

INSTRUCTIONS:
1. Generate a single, profound reflective prompt that invites the player to explore their inner landscape. The prompt should be:
   - Stage-appropriate (Red = survival/immediate, Amber = order/belonging, Orange = achievement/autonomy, Green = connection/equity, Turquoise = systemic/integral, White = unity/transcendent)
   - Line-specific (Cognitive = thinking patterns, Emotional = feeling landscape, Moral = ethical reasoning, Intrapersonal = self-awareness, Spiritual = meaning/purpose, Interpersonal = relational dynamics, Somatic = body wisdom, Willpower =意志力/fortitude)
   - Evocative, not leading. Open a door, don't push them through it.

2. Call 'ask_user_question' with EXACTLY this structure:
   - questions[0].question: Your evocative prompt (2-3 sentences max)
   - questions[0].header: "Reflection"
   - questions[0].options: [] (EMPTY array - no MCQ options)
   - questions[0].allowWriteIn: true (this is the ONLY input method)
   - questions[0].multiSelect: false

3. After the player responds, call 'complete_encounter' with evaluation based on:
   - Depth: How far beneath the surface did they go? (surface = 0.3, moderate = 0.6, deep = 0.9)
   - Coherence: Does their response hang together as a unified expression? (fragmented = 0.3, coherent = 0.7, integrated = 0.95)
   - Metacognition: Do they reference their own thinking process? (none = 0.2, implicit = 0.5, explicit = 0.85)
   - Integration: Does the response connect to prior encounters or show growth? (isolated = 0.3, connected = 0.6, transformative = 0.9)

4. Drive scoring for Language-Reflective:
   - Agency: Evidence of self-direction, independent thinking, boundary-setting
   - Communion: Evidence of empathy, connection, relational awareness
   - Eros: Evidence of aspiration, reaching toward growth, questioning
   - Agape: Evidence of compassion, acceptance, integration of paradox

5. Shadow detection: Listen for:
   - Dark-Addiction: clinging, forcing, controlling language
   - Dark-Aversion: withdrawal, avoidance, numbness
   - Golden-Addiction: bypassing, spiritualizing away difficulty
   - Golden-Allergy: resistance to growth, "I'm fine as I am"

6. Keep the response to 2-3 sentences maximum. Be precise and developmental.`;

    if (this.messages.length === 0) {
      this.messages.push({
        role: 'user',
        content: `Begin the Language-Reflective assessment: ${this.encounter.id} (${line} - ${stage}). Generate a profound reflective prompt.`
      });
    }

    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      loopCount++;

      const res = await queryLLMWithTools(systemPrompt, this.messages, TOOLS);

      if (loopCount === 1 && res.content && res.content.trim().startsWith('{"error"') && (!res.toolCalls || res.toolCalls.length === 0)) {
        return this.runFallback(line, stage, now);
      }

      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: res.content,
        toolCalls: res.toolCalls,
      };
      this.messages.push(assistantMsg);

      if (res.toolCalls && res.toolCalls.length > 0) {
        for (const tc of res.toolCalls) {
          if (tc.function.name === 'ask_user_question') {
            const params = JSON.parse(tc.function.arguments) as AskUserQuestionParams;
            const result = await this.uiHandler.askUser(params);

            // ponytail: track player's actual write-in for cross-encounter synthesis
            const lastAnswer = result.answers[0];
            if (lastAnswer?.writeInValue) {
              this._lastPlayerWriteIn = lastAnswer.writeInValue;
            }

            this.messages.push({
              role: 'tool',
              content: JSON.stringify(result),
              toolCallId: tc.id,
              name: 'ask_user_question'
            });

            this.messages.push({
              role: 'user',
              content: 'The player has responded. Now evaluate their reflection using complete_encounter. Score depth, coherence, metacognition, and integration. Do NOT ask another question.'
            });
          } else if (tc.function.name === 'complete_encounter') {
            const params = JSON.parse(tc.function.arguments) as {
              passed: boolean;
              scores?: Partial<Record<MeasureDimension, number>>;
              driveScores: { agency: number; communion: number; eros: number; agape: number };
              driveSignals: { agency: string; communion: string; eros: string; agape: string };
              feedback: string;
              polarityDirection: 'sto' | 'sts' | 'neutral';
              shadowSignal?: { quadrant: ShadowQuadrant; intensity: number };
              narrativeSummary: string;
            };

            const clamp = (v: number) => Math.max(0, Math.min(1, v));
            const ds = params.driveScores;
            const safeDriveScores = {
              agency: ds ? clamp(ds.agency) : 0.5,
              communion: ds ? clamp(ds.communion) : 0.5,
              eros: ds ? clamp(ds.eros) : 0.5,
              agape: ds ? clamp(ds.agape) : 0.5,
            };

            const finalResult = this.createAssessmentResult(params.passed, params.scores || {}, safeDriveScores);
            const outcome = this.finalizeEncounter(params, now);

            return {
              ...outcome,
              finalResult,
              messages: this.messages,
              playerWriteIn: this._lastPlayerWriteIn,
              driveScores: safeDriveScores,
            };
          }
        }
      } else {
        this.messages.push({
          role: 'user',
          content: 'Continue. Call ask_user_question with a reflective prompt, or complete_encounter if evaluation is ready.'
        });
      }
    }

    const fallbackParams = {
      passed: true,
      feedback: 'Language-Reflective encounter completed.',
      polarityDirection: 'neutral' as const,
      narrativeSummary: `The player engaged in deep reflection on ${this.encounter.moduleRef}.`,
    };
    const finalResult = this.createAssessmentResult(true, {});
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
    };
  }

  /**
   * Fallback mode: use module content when available, FallbackProvider otherwise.
   * When a module is available, presents real assessment tasks (n-back, dilemmas,
   * emotion identification, etc.) as narrative challenges and evaluates responses
   * using the module's drive probes. Also detects shadow patterns and computes
   * altitude shifts from consistent healthy patterns.
   */
  private async runFallback(line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    // ponytail: Direct Questioning encounters use write-in path, bypass module MCQ
    const isSelfReflection = this.encounter.holonSource === 'self-reflection';
    if (!isSelfReflection && this.module) {
      return this.runModuleAssessment(line, stage, now);
    }

    const fallback = getFallback(this.encounter.modality, line, stage);
    const holon = this.world.holons.find(h => h.id === this.encounter.holonSource);
    const holonName = holon?.name ?? 'A presence';
    const holonRole = holon?.narrativeRole ?? 'guide';
    const encounterModality = this.encounter.modality;

    let narrativeIntro: string;
    let questionText: string;
    let options: { label: string; description: string }[] = [];

    switch (encounterModality) {
      case 'LanguageReflective': {
        if (isSelfReflection) {
          narrativeIntro = '';
          questionText = fallback.prompt ?? fallback.followUps?.[0] ?? 'What is present for you right now?';
          options = []; // Empty → write-in only
        } else {
          narrativeIntro = `${holonName} sits across from you, their gaze steady. The firelight casts long shadows. They speak:`;
          questionText = fallback.prompt ?? 'What moved you to act?';
          options = [
            { label: 'Reflect deeply', description: 'Consider the question from multiple angles' },
            { label: 'Respond instinctively', description: 'Trust your first impulse' },
            { label: 'Sit with it', description: 'Allow the question to remain open' },
            { label: 'Challenge the premise', description: 'Question the foundation of what was asked' },
          ];
        }
        break;
      }
      case 'ScenarioChoice':
        narrativeIntro = `${holonName} confronts you. The air is tense. A choice must be made.`;
        questionText = fallback.scenario ?? 'A crossroads appears. Each path carries weight.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;
      case 'Strategic':
        narrativeIntro = `The war-table is spread before you. ${holonName} surveys the terrain. Three routes. Limited forces.`;
        questionText = fallback.scenario ?? fallback.prompt ?? 'Resources are limited. The map shows three routes to the objective.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;
      case 'Embodied':
        narrativeIntro = `The war-drums begin. ${holonName} guides you. Your body knows this rhythm.`;
        questionText = fallback.prompt ?? 'Close your eyes. Where do you feel tension in your body right now?';
        options = [
          { label: 'Follow the rhythm', description: 'Let the drum guide your body' },
          { label: 'Resist the beat', description: 'Fight against the pull' },
          { label: 'Breathe into it', description: 'Allow the sensation to move through you' },
          { label: 'Still yourself', description: 'Find the stillness within the movement' },
        ];
        break;
      case 'SocialCooperative':
        narrativeIntro = `${holonName} looks to you. Others wait for direction. The group needs your word.`;
        questionText = fallback.scenario ?? 'The scouts look to you. The path splits — one leads through danger, the other through uncertainty.';
        options = (fallback.options ?? []).map(o => ({ label: o.text, description: o.text }));
        break;
      case 'ImmersiveRPG':
        narrativeIntro = `The world stretches before you. ${holonName} appears — ${holonRole} of this domain. What calls?`;
        questionText = fallback.prompt ?? 'The world stretches before you. A path winds through unfamiliar terrain. Something waits ahead.';
        options = [
          { label: 'Press forward', description: 'Step into the unknown' },
          { label: 'Survey the area', description: 'Gather information first' },
          { label: 'Seek shelter', description: 'Find safety before advancing' },
          { label: 'Call out', description: 'Announce your presence' },
        ];
        break;
      default:
        narrativeIntro = `${holonName} presents a challenge. The moment demands clarity.`;
        questionText = fallback.prompt ?? fallback.framing ?? 'Focus. The moment demands clarity.';
        options = [
          { label: 'Engage', description: 'Step into the challenge' },
          { label: 'Reflect', description: 'Consider before acting' },
          { label: 'Withdraw', description: 'Step back and reassess' },
          { label: 'Negotiate', description: 'Seek a middle path forward' },
        ];
        break;
    }

    const defaultOpts = [
      { label: 'Act decisively', description: 'Take the direct approach' },
      { label: 'Observe first', description: 'Gather more information' },
      { label: 'Seek alliance', description: 'Find strength in others' },
      { label: 'Deceive and maneuver', description: 'Use misdirection to your advantage' },
    ];
    while (options.length < 4) {
      const extra = defaultOpts[options.length];
      if (extra) options.push(extra);
      else break;
    }

    const fullPrompt = `${narrativeIntro}\n\n${questionText}`;

    const askParams: AskUserQuestionParams = {
      questions: [{
        question: fullPrompt,
        header: encounterModality,
        options,
        allowWriteIn: true,
        multiSelect: false,
      }],
    };    const result = await this.uiHandler.askUser(askParams);
    const answer = result.answers[0];
      const narrativeSummary = answer?.writeInValue ?? (answer?.selectedLabels[0] ?? 'The player engaged with the encounter.');

    const evaluated = isSelfReflection
      ? this.evaluateSelfReflection(narrativeSummary)
      : this.evaluateFallbackResponse(narrativeSummary);

    const fallbackParams = {
      passed: evaluated.passed,
      feedback: evaluated.feedback,
      polarityDirection: evaluated.polarityDirection,
      driveScores: evaluated.driveScores,
      driveSignals: evaluated.driveSignals,
      narrativeSummary: typeof narrativeSummary === 'string' ? narrativeSummary : 'The player engaged with the encounter.',
    };

    const finalResult = this.createAssessmentResult(evaluated.passed, {}, evaluated.driveScores);
    const outcome = this.finalizeEncounter(fallbackParams, now);

    return {
      ...outcome,
      finalResult,
      messages: this.messages,
      playerWriteIn: isSelfReflection ? narrativeSummary : undefined,
      driveScores: evaluated.driveScores,
    };
  }

  /**
   * Module-aware fallback: uses the assessment module's tasks, drive probes,
   * and scoring rubric to present a real developmental assessment even without the LLM.
   * Selects a task matching the encounter modality, presents it as a narrative challenge,
   * evaluates the response against drive probes, detects shadow patterns,
   * and computes altitude progression.
   */
  private async runModuleAssessment(_line: Line, stage: Stage, now: number): Promise<OrchestratorResult> {
    const module = this.module!;
    const holon = this.world.holons.find(h => h.id === this.encounter.holonSource);
    const holonName = holon?.name ?? 'A presence';
    const currentModality = this.encounter.modality;

    // 1. Select the best task from the module based on modality
    const task = this.selectTaskForModality(module, currentModality);
    // Track the actual presented task for narrative building (fix B.2)
    this._currentPresentedTask = task;

    // 2. Present the task as a narrative challenge via uiHandler
    const askResult = await this.presentModuleTask(module, task, currentModality, holonName);
    const answer = askResult.answers[0];
    const rawLabel = answer?.selectedLabels[0] ?? '';
    const writeIn = answer?.writeInValue;
    const playerResponseText = writeIn ?? rawLabel;

    // 3. Evaluate using the TaskRenderer's evaluate() if available (produces TrialResult with timing/accuracy)
    //    Fall back to drive-probe evaluation if no renderer evaluate is available
    const endTimeMs = Date.now();
    let evaluation: {
      passed: boolean;
      polarityDirection: 'sto' | 'sts' | 'neutral';
      driveScores: { agency: number; communion: number; eros: number; agape: number };
      driveSignals: { agency: string; communion: string; eros: string; agape: string };
      feedback: string;
    };
    let trialResult: TrialResult | null = null;

    if (this._currentRendererEvaluate) {
      // Use the TaskRenderer's evaluate function for real scoring
      trialResult = this._currentRendererEvaluate(playerResponseText, this._currentTaskStartTime, endTimeMs);

      // Extract drive metadata from the trial's rawResponse (set by TaskRenderers)
      const rawResp = trialResult?.rawResponse as any;
      const matchedDrive: string | null = rawResp?.matchedDrive ?? null;
      const matchedPolarity: string = rawResp?.matchedPolarity ?? 'neutral';
      const correctnessScore: number = rawResp?.correctnessScore ?? 0.5;

      // Use correctnessScore as the primary scoring signal (from TaskRenderer options)
      const baseScore = Math.min(1, Math.max(0, correctnessScore));

      // D.9: Use shared shadow keyword detection helper (DRY)
      let writeInDriveDetection: { drive: string; polarity: string; shadowKeyword: string | null } | null = null;
      if (writeIn) {
        writeInDriveDetection = AgenticOrchestrator.detectWriteInShadow(writeIn);
      }

      // When a write-in is present, its keyword-based detection takes priority over
      // the renderer's label matching (which can false-positive on short words like 'I').
      const effectiveDrive = writeInDriveDetection?.drive ?? matchedDrive ?? null;
      const effectivePolarity = writeInDriveDetection?.polarity ?? (matchedPolarity !== 'neutral' ? matchedPolarity : 'neutral');

      // Build differentiated drive scores:
      // - The matched/driven drive gets the full baseScore (or boosted for write-in depth)
      // - Other drives get baseline neutral (0.5)
      // - For write-ins with no shadow detection, apply a depth boost and distribute evenly
      const isWriteInWithNoShadow = matchedDrive === null && !writeInDriveDetection && !!writeIn;

      // ── SCORING FIX: Use rubric dimension weights on TrialResult dimensions ──
      // OLD: averaged 4 drives → compressed to ~0.55 always, even correct answers failed at threshold 0.6
      // NEW: compute weighted score from TrialResult dimensions using the module's rubric weights.
      // This gives a true performance signal: correct MCQ → ~0.8, partial → ~0.55, wrong → ~0.25.
      const rubricWeights = module.scoringRubric.dimensionWeights;
      const trialDims = trialResult!.dimensions;
      let weightedSum = 0;
      let totalWeight = 0;
      for (const [dim, weight] of Object.entries(rubricWeights)) {
        const val = trialDims[dim as keyof typeof trialDims];
        if (weight && typeof val === 'number') {
          weightedSum += val * weight;
          totalWeight += weight;
        }
      }
      // Blend the rubric-weighted score with the drive-correctness score for a robust signal
      const rubricScore = totalWeight > 0 ? weightedSum / totalWeight : baseScore;
      const blendedScore = rubricScore * 0.6 + baseScore * 0.4;

      // Drive scores: matched drive gets blendedScore (consistent with pass/fail),
      // write-in depth bonus applied on top. Unmatched drives get a lower baseline.
      const matchedScore = isWriteInWithNoShadow ? Math.max(blendedScore, 0.55) : blendedScore;
      const driveScores = {
        agency: effectiveDrive === 'agency' ? matchedScore
          : effectiveDrive !== null ? Math.min(0.5, blendedScore * 0.7)
          : matchedScore,
        communion: effectiveDrive === 'communion' ? matchedScore
          : effectiveDrive !== null ? Math.min(0.5, blendedScore * 0.7)
          : matchedScore,
        eros: effectiveDrive === 'eros' ? matchedScore
          : effectiveDrive !== null ? Math.min(0.5, blendedScore * 0.7)
          : matchedScore,
        agape: effectiveDrive === 'agape' ? matchedScore
          : effectiveDrive !== null ? Math.min(0.5, blendedScore * 0.7)
          : matchedScore,
      };

      // Determine polarity from the effective drive detection
      const polarityDirection = effectivePolarity === 'sts' ? 'sts' as const
        : effectivePolarity === 'sto' ? 'sto' as const
        : 'neutral' as const;

      // Derive drive signals from the expression pattern.
      // IMPORTANT: Shadow signals ONLY come from write-in keyword detection or forceShadow.
      // A wrong MCQ answer (low correctnessScore) is a performance miss, NOT a shadow expression.
      const shadowFromWriteIn = writeInDriveDetection?.shadowKeyword ?? null;
      const driveSignals = {
        agency: effectiveDrive === 'agency'
          ? (shadowFromWriteIn === 'DarkAddicted' ? 'DarkAddicted' : 'HealthyBalanced')
          : 'HealthyBalanced',
        communion: effectiveDrive === 'communion'
          ? (shadowFromWriteIn === 'DarkAverted' ? 'DarkAverted' : 'HealthyBalanced')
          : 'HealthyBalanced',
        eros: effectiveDrive === 'eros'
          ? (shadowFromWriteIn === 'GoldenAddicted' ? 'GoldenAddicted' : 'HealthyBalanced')
          : 'HealthyBalanced',
        agape: effectiveDrive === 'agape'
          ? (shadowFromWriteIn === 'GoldenAverted' ? 'GoldenAverted' : 'HealthyBalanced')
          : 'HealthyBalanced',
      };

      // Determine pass: blendedScore must meet threshold AND no shadow pathology
      const passThreshold = module.scoringRubric.passThreshold ?? 0.7;
      const effectiveScore = isWriteInWithNoShadow ? Math.max(blendedScore, 0.55) : blendedScore;
      const hasShadow = !!shadowFromWriteIn;
      const passed = !hasShadow && effectiveScore >= passThreshold;

      // Build contextual developmental feedback based on score, drive, polarity, and history
      const driveLabel = effectiveDrive ?? 'unidentified';
      const polarityLabel = effectivePolarity === 'sts' ? 'self-oriented' : effectivePolarity === 'sto' ? 'other-oriented' : 'balanced';
      const scorePct = (baseScore * 100).toFixed(0);
      const historyCount = this.history.length;
      const recentPasses = this.history.slice(-3).filter(r => Object.values(r.polarityTrace.driveDirectionality).every(d => d === 'HealthyBalanced')).length;
      const consistencyNote = recentPasses >= 3 ? ' You are building strong momentum across encounters.'
        : recentPasses === 0 && historyCount >= 2 ? ' The last few encounters have been challenging — this is where real growth happens.'
        : '';

      const feedback = hasShadow
        ? `A ${shadowFromWriteIn} pattern surfaced through your ${driveLabel} expression (${polarityLabel}). In the developmental framework, this shadow arises when the ${driveLabel} drive becomes imbalanced — either clinging to lower patterns (dark) or bypassing toward higher without integration (golden). Naming it here is the first step toward healing it. ${historyCount > 0 ? `This is your ${historyCount + 1}th encounter — each shadow surfaced is an opportunity for the field to work with you.` : ''}`
        : passed
          ? `Your ${driveLabel} drive expressed with health (performance: ${scorePct}%, polarity: ${polarityLabel}). ${parseInt(scorePct) >= 80 ? 'Strong performance — the integration is deepening across the ' + module.line.toLowerCase() + ' dimension.' : 'Solid engagement — the ' + module.line.toLowerCase() + ' capacity at ' + module.stage + ' stage is growing.'} ${consistencyNote}The field recognizes your sustained attention to this developmental edge.`
          : `Your ${driveLabel} drive expressed at ${scorePct}% performance (${polarityLabel}). ${parseInt(scorePct) >= 40 ? 'Close to the threshold — the gap between where you are and where this capacity can be is narrowing. A focused effort on the next encounter may tip the balance.' : 'This is a genuine edge for you. The ' + module.line.toLowerCase() + ' line at ' + module.stage + ' stage is where your developmental work lives right now — not as punishment, but as invitation.'} The ${module.line.toLowerCase()} dimension will continue to offer opportunities to strengthen this capacity.`;

      evaluation = {
        passed,
        polarityDirection,
        driveScores,
        driveSignals,
        feedback,
      };
    } else {
      // Fallback: keyword-based evaluation
      evaluation = this.evaluateViaDriveProbes(module, playerResponseText);
    }

    // 4. Detect shadow surfacing from response pattern (with optional forceShadow override)
    const validQuadrants = ['DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy'] as const;
    const forcedQuadrant = this.forceShadow && validQuadrants.includes(this.forceShadow as any)
      ? this.forceShadow as ShadowQuadrant
      : null;
    // Shadow detection only fires for write-in text (free-form responses)
    // MCQ option labels should NOT trigger shadow detection — they're structured choices, not expressions.
    const isWriteIn = !!writeIn;
    const shadowSignal = forcedQuadrant
      ? { quadrant: forcedQuadrant, intensity: 0.7 }
      : this.detectShadowFromResponse(playerResponseText, currentModality, isWriteIn);

    // G.25: Wire ShadowDetector — detect behavioral shadows from encounter patterns
    const { detectShadows, computeBehavioralPatterns } = await import('../usecases/ShadowDetector.js');
    const recentEncounters = this.significator.recentEncounters.slice(-20);
    const patterns = computeBehavioralPatterns(recentEncounters);
    const behavioralSignals = detectShadows(this.significator, patterns);
    // Merge: keyword detection takes priority; behavioral signals are fallback
    const BEHAVIORAL_QUADRANT_MAP: Record<string, ShadowQuadrant> = {
      fixation: 'DarkAddiction', regression: 'DarkAllergy',
      repression: 'GoldenAddiction', goldenAllergy: 'GoldenAllergy',
    };
    const effectiveShadow = shadowSignal ?? (behavioralSignals.length > 0
      ? { quadrant: BEHAVIORAL_QUADRANT_MAP[behavioralSignals[0]!.type] ?? 'DarkAddiction', intensity: 0.6 }
      : null);

    // If forceShadow is active, propagate to drive signals AND force-fail the encounter
    if (forcedQuadrant && this._currentRendererEvaluate) {
      const forcedDrive = forcedQuadrant === 'DarkAddiction' ? 'agency'
        : forcedQuadrant === 'DarkAllergy' ? 'communion'
        : forcedQuadrant === 'GoldenAddiction' ? 'eros'
        : 'agape';
      const forcedSignal = forcedQuadrant;
      evaluation.driveSignals = { ...evaluation.driveSignals, [forcedDrive]: forcedSignal } as typeof evaluation.driveSignals;
      // Forced shadow = pathology detected → must fail
      evaluation = { ...evaluation, passed: false, feedback: `Shadow surfaced: ${forcedQuadrant} through ${forcedDrive} expression (forced). This indicates the ${forcedDrive} drive is operating from a developmental shadow — awareness of this pattern is the first step toward integration.` };
    }

    // 5. Build a rich narrative summary from the module context
    // Pass the actual presented task so narrative matches what the user saw
    const narrativeSummary = this.buildModuleNarrative(module, playerResponseText, evaluation.passed, currentModality, holonName, task);

    // 6. Check for altitude shift: only when ALL drives HealthyBalanced AND passed
    const altitudeShift = this.computeAltitudeShift(evaluation.driveSignals, module, stage, evaluation.passed);

    const finalResult = this.createAssessmentResult(
      evaluation.passed, {}, evaluation.driveScores, trialResult ? [trialResult] : undefined,
    );

    // Build outcome with altitude shift support
    const energeticDirection: EnergeticDirection = evaluation.polarityDirection === 'sto' ? 'Radiative'
      : evaluation.polarityDirection === 'sts' ? 'Absorptive' : 'Diffuse';

    const SIGNAL_MAP: Record<string, DriveDirectionality> = {
      'HealthyBalanced': 'HealthyBalanced',
      'DarkAddicted': 'DarkAddicted',
      'DarkAverted': 'DarkAverted',
      'GoldenAddicted': 'GoldenAddicted',
      'GoldenAverted': 'GoldenAverted',
    };

    const baseDir: DriveDirectionality = evaluation.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality: Record<Drive, DriveDirectionality> = {
      Agency: SIGNAL_MAP[evaluation.driveSignals.agency] ?? baseDir,
      Communion: SIGNAL_MAP[evaluation.driveSignals.communion] ?? baseDir,
      Eros: SIGNAL_MAP[evaluation.driveSignals.eros] ?? baseDir,
      Agape: SIGNAL_MAP[evaluation.driveSignals.agape] ?? baseDir,
    };

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality: driveDirectionality as Record<Drive, DriveDirectionality>,
      stageOrientation: evaluation.polarityDirection === 'sto' ? 'ReachingHigher' : 'Homeostatic',
      sourceOfNourishment: evaluation.polarityDirection === 'sto' ? 'HigherRealm'
        : (evaluation.polarityDirection === 'sts' ? 'LowerRealm' : 'Ambivalent'),
      shadowSurfaced: effectiveShadow?.quadrant ?? null,
      shadowResolvedId: null,
      narrativeSummary,
    };

    const record = processOutcome(this.encounter, response, now);

    // Override altitudeShift on the record if computed
    const updatedRecord: ConsequenceRecord = {
      ...record,
      altitudeShift: altitudeShift ?? null,
    };

    // Apply failure consequences: accelerate theta-decay for failed modules
    if (!evaluation.passed) {
      const [fl, fs] = this.encounter.moduleRef.split(':');
      const cellKey = `${fl}:${fs}`;
      const currentTs = this.significator.theta.lastEncounter[cellKey] ?? 0;
      if (currentTs > now - 3600000) {
        (this.significator.theta.lastEncounter as Record<string, number>)[cellKey] = now - 7200000;
      }
    }

    // Apply consequences — shadow entries will be created if shadowSurfaced is set
    const updated = applyConsequences(this.significator, this.world, updatedRecord, this.encounter);

    // Apply altitude shift if computed
    let finalSig = updated.sig;
    if (altitudeShift) {
      const currentOrd = stageOrdinal(altitudeShift.to);
      const ALL_STAGES: readonly Stage[] = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'];
      if (currentOrd < ALL_STAGES.length - 1) {
        const nextStage = ALL_STAGES[currentOrd + 1]!;
        finalSig = {
          ...finalSig,
          altitudes: { ...finalSig.altitudes, [altitudeShift.line]: nextStage },
        };
        // Update currentStage if all lines are at least at nextStage
        const allAtNext = Object.values(finalSig.altitudes).every(
          a => stageOrdinal(a) >= stageOrdinal(nextStage),
        );
        if (allAtNext) {
          finalSig = { ...finalSig, currentStage: nextStage };
        }
      }
    }

    // G.12: PESTLE correlation — map encounter content to dimensions
    const PESTLE_DIMS_ARRAY: (keyof PESTLETension)[] = ['political', 'economic', 'social', 'technological', 'legal', 'environmental'];
    const lineToPestle: Record<string, keyof PESTLETension> = {
      Cognitive: 'technological',
      Emotional: 'social',
      Moral: 'legal',
      Intrapersonal: 'environmental',
      Spiritual: 'environmental',
      Somatic: 'environmental',
      Willpower: 'political',
      Interpersonal: 'social',
    };
    const dim = lineToPestle[finalResult.line] ?? PESTLE_DIMS_ARRAY[Math.floor(Math.random() * PESTLE_DIMS_ARRAY.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );
    const activeEvents = (updated.world as any).activeMacroEvents ?? [];
    const macroEvent = tryTriggerMacroEvent(newTension, activeEvents, finalSig.currentStage, now);
    const newActiveEvents = macroEvent ? [...activeEvents, macroEvent] : activeEvents;
    const updatedWorld = { ...updated.world, pestleTension: newTension, activeMacroEvents: newActiveEvents } as WorldState;

    return {
      updatedSig: finalSig,
      updatedWorld,
      finalResult,
      consequenceRecord: updatedRecord,
      narrativeSummary,
      feedback: evaluation.feedback,
      playerWriteIn: writeIn,
      driveScores: evaluation.driveScores,
      messages: this.messages,
    };
  }

  /**
   * Select the best assessment task from the module based on encounter modality.
   */
  private selectTaskForModality(module: StageAssessment, modality: Modality): AssessmentTask {
    // All task types supported by TaskRenderers
    const ALL_RENDERABLE: readonly TaskType[] = [
      'n_back', 'stroop', 'go_no_go', 'hold', 'pattern_prediction',
      'emotion_identification', 'dilemma', 'scenario', 'self_report',
      'value_ranking', 'reaction_time', 'rhythm', 'cooperation', 'imitation',
    ];

    // Modality-specific preference order (first match wins)
    const modalityPreference: Record<string, readonly TaskType[]> = {
      Deterministic: ['n_back', 'stroop', 'go_no_go', 'hold', 'reaction_time', 'rhythm', 'pattern_prediction'],
      LanguageReflective: ['llm_dialogue', 'self_report', 'emotion_identification', 'scenario', 'dilemma'],
      ScenarioChoice: ['dilemma', 'scenario', 'emotion_identification', 'self_report'],
      Embodied: ['hold', 'rhythm', 'imitation', 'reaction_time', 'go_no_go'],
      Strategic: ['pattern_prediction', 'value_ranking', 'n_back', 'stroop'],
      SocialCooperative: ['cooperation', 'dilemma', 'emotion_identification', 'scenario', 'self_report'],
      ImmersiveRPG: ['scenario', 'dilemma', 'llm_dialogue', 'emotion_identification', 'self_report'],
    };

    const preferred = modalityPreference[modality] ?? ALL_RENDERABLE;

    // G.1: Try preferred types first, then fall back to any renderable type in the module
    for (const prefType of [...preferred, ...ALL_RENDERABLE]) {
      const match = module.tasks.find(t => t.type === prefType);
      if (match) return match;
    }

    // Last resort: generate a modality-appropriate task
    return this.generateModalityFallbackTask(modality, module);
  }

  /**
   * Generate a generic task appropriate for the modality when the module
   * doesn't have any of the preferred task types. This ensures ScenarioChoice
   * always shows a dilemma, ImmersiveRPG always shows a scenario, etc.
   */
  private generateModalityFallbackTask(modality: Modality, module: StageAssessment): AssessmentTask {
    const prefix = `${module.line.toLowerCase()}-${module.stage.toLowerCase()}`;
    // Inject stage into all generated task parameters so TaskRenderers can use it for difficulty scaling
    const stage = module.stage;
    switch (modality) {
      case 'ScenarioChoice':
      case 'ImmersiveRPG':
        return {
          id: `generic-dilemma-${prefix}`,
          type: 'dilemma',
          description: `A developmental dilemma at the ${module.stage} stage of ${module.line} development`,
          parameters: { dilemmaType: 'developmental', choices: 4, stage, line: module.line },
          measures: ['depth', 'coherence'],
        };
      case 'LanguageReflective':
        return {
          id: `generic-self-report-${prefix}`,
          type: 'self_report',
          description: `Self-inquiry reflection at the ${module.stage} stage of ${module.line} development`,
          parameters: { stage },
          measures: ['depth', 'metacognition'],
        };
      case 'SocialCooperative':
        return {
          id: `generic-cooperation-${prefix}`,
          type: 'cooperation',
          description: `Cooperative dynamics at the ${module.stage} stage of ${module.line} development`,
          parameters: { stage },
          measures: ['depth', 'coherence'],
        };
      case 'Embodied':
        return {
          id: `generic-hold-${prefix}`,
          type: 'hold',
          description: `Attentional hold at the ${module.stage} stage of ${module.line} development`,
          parameters: { items: 3, holdDurationMs: 5000, stage },
          measures: ['accuracy', 'consistency'],
        };
      case 'Strategic':
        return {
          id: `generic-pattern-${prefix}`,
          type: 'pattern_prediction',
          description: `Pattern recognition at the ${module.stage} stage of ${module.line} development`,
          parameters: { disks: 3, attempts: 4, stage },
          measures: ['accuracy', 'complexity_handled'],
        };
      case 'Deterministic':
      default:
        return module.tasks[0] ?? {
          id: `generic-nback-${prefix}`,
          type: 'n_back',
          description: `Working memory challenge at the ${module.stage} stage of ${module.line} development`,
          parameters: { n: 2, trials: 12, stage },
          measures: ['accuracy', 'response_time'],
        };
    }
  }

  /**
   * Present a module task as a narrative challenge via the UI handler.
   * Translates the assessment task type to CLI-friendly MCQ options.
   */
  private async presentModuleTask(
    _module: StageAssessment,
    task: AssessmentTask,
    _modality: Modality,
    holonName: string,
  ): Promise<AskUserQuestionResult> {
    // Use TaskRenderers to get a real assessment prompt with task-specific options
    // and a response evaluator that captures TrialResult data (timing, accuracy)
    // Inject stage AND line into task parameters so TaskRenderers can use stage-specific
    // difficulty and line-specific dilemma content
    const taskWithStage = { ...task, parameters: { ...task.parameters, stage: _module.stage, line: _module.line } };
    const renderer = getRenderer(taskWithStage);

    // Store the renderer's evaluate function so runModuleAssessment can use it
    this._currentRendererEvaluate = renderer.evaluate;
    this._currentTaskStartTime = Date.now();

    // Prepend holon-narrative framing to the question with continuity context
    const historyPrefix = this.buildBriefHistory();
    const enrichedPrompt: AskUserQuestionParams = {
      questions: renderer.prompt.questions.map(q => ({
        ...q,
        question: `${historyPrefix}${holonName} presents a challenge.\n\n${q.question}`,
        header: q.header, // Keep the renderer's meaningful header
      })),
    };

    return this.uiHandler.askUser(enrichedPrompt);
  }

  /**
   * Evaluate the player's response using the module's drive probes.
   * Determines which drive was selected by option label keywords and scores accordingly.
   */
  private evaluateViaDriveProbes(
    module: StageAssessment,
    responseText: string,
  ): {
    passed: boolean;
    polarityDirection: 'sto' | 'sts' | 'neutral';
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    feedback: string;
  } {
    const lower = responseText.toLowerCase();

    // Determine which drive the player expressed based on option label keywords
    // The options presented are: 'act with agency', 'seek connection', 'reach higher', 'return to foundation'
    const selectedDrive: 'agency' | 'communion' | 'eros' | 'agape' | null =
      lower.includes('agency') ? 'agency' :
      lower.includes('connection') ? 'communion' :
      lower.includes('higher') ? 'eros' :
      lower.includes('foundation') ? 'agape' :
      null;

    // D.9: Use shared shadow keyword detection helper (DRY)
    const shadowMatch = AgenticOrchestrator.detectShadowKeywords(responseText);
    const hasShadowAddiction = shadowMatch?.quadrant === 'DarkAddiction';
    const hasShadowAversion = shadowMatch?.quadrant === 'DarkAllergy';
    const hasGoldenAddiction = shadowMatch?.quadrant === 'GoldenAddiction';
    const hasGoldenAllergy = shadowMatch?.quadrant === 'GoldenAllergy';

    function scoreDrive(drive: 'agency' | 'communion' | 'eros' | 'agape'): { signal: string; score: number } {
      if (selectedDrive === drive) {
        // The selected drive: check for shadow signals
        if (hasShadowAddiction && (drive === 'agency' || drive === 'eros')) {
          return { signal: 'DarkAddicted', score: 0.3 };
        }
        if (hasShadowAversion && (drive === 'communion' || drive === 'agape')) {
          return { signal: 'DarkAverted', score: 0.3 };
        }
        if (hasGoldenAddiction && drive === 'eros') {
          return { signal: 'GoldenAddicted', score: 0.3 };
        }
        if (hasGoldenAllergy && drive === 'agape') {
          return { signal: 'GoldenAverted', score: 0.3 };
        }
        return { signal: 'HealthyBalanced', score: 0.8 };
      }
      // Non-selected drives: baseline neutral
      // BUT: if selectedDrive is null (write-in that doesn't match any option label),
      // AND the text contains shadow keywords, apply shadow signal to prevent false altitude shifts
      if (selectedDrive === null) {
        if (hasShadowAddiction && (drive === 'agency' || drive === 'eros')) {
          return { signal: 'DarkAddicted', score: 0.3 };
        }
        if (hasShadowAversion && (drive === 'communion' || drive === 'agape')) {
          return { signal: 'DarkAverted', score: 0.3 };
        }
        if (hasGoldenAddiction && drive === 'eros') {
          return { signal: 'GoldenAddicted', score: 0.3 };
        }
        if (hasGoldenAllergy && drive === 'agape') {
          return { signal: 'GoldenAverted', score: 0.3 };
        }
      }
      return { signal: 'HealthyBalanced', score: 0.5 };
    }

    const agencyResult = scoreDrive('agency');
    const communionResult = scoreDrive('communion');
    const erosResult = scoreDrive('eros');
    const agapeResult = scoreDrive('agape');

    const agencyScore = agencyResult.score;
    const communionScore = communionResult.score;
    const erosScore = erosResult.score;
    const agapeScore = agapeResult.score;

    // STS: agency+eros dominate communion+agape
    // STO: communion+agape dominate
    // Neutral: balanced
    const selfDominant = agencyScore + erosScore;
    const otherDominant = communionScore + agapeScore;
    let polarityDirection: 'sto' | 'sts' | 'neutral';
    if (selfDominant > otherDominant + 0.3) polarityDirection = 'sts';
    else if (otherDominant > selfDominant + 0.3) polarityDirection = 'sto';
    else polarityDirection = 'neutral';

    // Determine pass/fail from rubric threshold
    // If write-in is present, boost scores based on semantic depth heuristics
    const wordCount = lower.split(/\s+/).filter(w => w.length > 0).length;
    const uniqueWords = new Set(lower.split(/\s+/).filter(w => w.length > 0)).size;
    const conceptDensity = wordCount > 0 ? uniqueWords / wordCount : 0;

    // Compute semantic depth bonus from write-in quality
    // Length bonus: responses >20 words get depth bonus
    const lengthBonus = wordCount > 20 ? Math.min(0.15, wordCount * 0.003) : 0;
    // Concept density bonus: >60% unique words indicates conceptual richness
    const densityBonus = conceptDensity > 0.6 ? 0.1 : (conceptDensity > 0.4 ? 0.05 : 0);
    // Shadow awareness bonus: acknowledging shadow patterns indicates integration
    const shadowAware = lower.includes('shadow') || lower.includes('pattern') || lower.includes('growth') || lower.includes('heal');
    const awarenessBonus = shadowAware ? 0.1 : 0;
    const semanticBonus = lengthBonus + densityBonus + awarenessBonus;

    // Apply semantic bonus to all scores (caps at 1.0)
    const adjustedAgencyScore = Math.min(1.0, agencyScore + (selectedDrive === 'agency' ? semanticBonus : 0));
    const adjustedCommunionScore = Math.min(1.0, communionScore + (selectedDrive === 'communion' ? semanticBonus : 0));
    const adjustedErosScore = Math.min(1.0, erosScore + (selectedDrive === 'eros' ? semanticBonus : 0));
    const adjustedAgapeScore = Math.min(1.0, agapeScore + (selectedDrive === 'agape' ? semanticBonus : 0));

    const avgScore = (adjustedAgencyScore + adjustedCommunionScore + adjustedErosScore + adjustedAgapeScore) / 4;
    const passThreshold = module.scoringRubric.passThreshold ?? 0.7;
    const passed = avgScore >= passThreshold;

    // Build feedback with depth-adjusted scores
    const depthNote = semanticBonus > 0
      ? ` (${wordCount} words, ${(conceptDensity * 100).toFixed(0)}% unique, +${(semanticBonus * 100).toFixed(0)}% depth)`
      : '';
    const feedback = passed
      ? `Your response demonstrated balanced engagement with the ${module.line} ${module.stage} challenge. Agency: ${(adjustedAgencyScore * 100).toFixed(0)}%, Communion: ${(adjustedCommunionScore * 100).toFixed(0)}%, Eros: ${(adjustedErosScore * 100).toFixed(0)}%, Agape: ${(adjustedAgapeScore * 100).toFixed(0)}%.${depthNote}`
      : `The challenge revealed areas for growth. Your ${module.line} ${module.stage} response showed room for deeper integration.`;

    return {
      passed,
      polarityDirection,
      driveScores: { agency: adjustedAgencyScore, communion: adjustedCommunionScore, eros: adjustedErosScore, agape: adjustedAgapeScore },
      driveSignals: {
        agency: agencyResult.signal,
        communion: communionResult.signal,
        eros: erosResult.signal,
        agape: agapeResult.signal,
      },
      feedback,
    };
  }

  /**
   * Detect shadow surfacing from response patterns.
   * Uses keyword heuristics aligned with the 4-quadrant shadow model.
   */
  private detectShadowFromResponse(
    responseText: string,
    _modality: Modality,
    isWriteIn: boolean = false,
  ): { quadrant: ShadowQuadrant; intensity: number } | null {
    // Shadow detection only fires for write-in text (free-form responses)
    // MCQ option labels should NOT trigger shadow detection — they're structured choices, not expressions.
    if (isWriteIn) {
      // D.9: Use shared shadow keyword detection helper (DRY)
      return AgenticOrchestrator.detectShadowKeywords(responseText);
    }

    return null;
  }

  /**
   * Compute an altitude shift signal when the player demonstrates consistent
   * HealthyBalanced drive patterns across ALL 4 drives (selected drive must score
   * healthy, not shadow).
   * Returns a ConsequenceRecord-compatible object or null if no shift is warranted.
   */
  private computeAltitudeShift(
    _driveSignals: { agency: string; communion: string; eros: string; agape: string },
    module: StageAssessment,
    currentEncounterStage: Stage,
    passed: boolean,
  ): { line: Line; from: Stage; to: Stage } | null {
    const key = module.line;

    if (!passed) {
      return null; // Failures don't count but don't reset total count either
    }

    // Use TOTAL passes per line (not consecutive) — the scheduler alternates lines
    // so consecutive passes are mathematically impossible with 8+ lines.
    // Threshold of 2 passes: demonstrates sustained capacity on the same line.
    const totalPasses = (this._consecutivePasses.get(key) ?? 0) + 1;
    this._consecutivePasses.set(key, totalPasses);

    if (totalPasses < 2) {
      return null; // Need at least 2 passes on this line
    }

    // Shift achieved — reset counter so future passes require 2 fresh wins
    this._consecutivePasses.set(key, 0);
    return { line: module.line, from: currentEncounterStage, to: currentEncounterStage };
  }

  /**
   * Build a rich narrative summary from the module context and player choice.
   */
  private buildModuleNarrative(
    module: StageAssessment,
    _responseText: string,
    passed: boolean,
    modality: Modality,
    holonName: string,
    actualTask?: AssessmentTask,
  ): string {
    const modalityDesc: Record<string, string> = {
      Deterministic: 'a focused mental trial',
      LanguageReflective: 'a moment of deep reflection',
      ScenarioChoice: 'a moral crossroads',
      Embodied: 'a somatic awareness exercise',
      Strategic: 'a tactical assessment',
      SocialCooperative: 'a relational challenge',
      ImmersiveRPG: 'a narrative encounter',
    };

    // Use the TASK_TYPE_LABELS for readable task names, not raw task descriptions
    const TASK_LABELS: Record<string, string> = {
      n_back: 'a working memory challenge',
      stroop: 'an inhibitory control test',
      go_no_go: 'an impulse regulation exercise',
      hold: 'an attentional hold task',
      pattern_prediction: 'a pattern recognition puzzle',
      emotion_identification: 'an emotional literacy assessment',
      dilemma: 'a moral dilemma',
      scenario: 'a situational judgment',
      value_ranking: 'a value prioritization exercise',
      self_report: 'a self-inquiry reflection',
      reaction_time: 'a reaction speed test',
      rhythm: 'a rhythmic attunement exercise',
      imitation: 'an imitative learning task',
      cooperation: 'a cooperative dynamics challenge',
      llm_dialogue: 'a reflective dialogue',
    };

    // Use the ACTUAL presented task for narrative label (fix B.2)
    // Falls back to module.tasks[0] only if no actual task was presented
    const displayedTask = actualTask ?? this._currentPresentedTask ?? module.tasks[0];
    const taskLabel = displayedTask ? (TASK_LABELS[displayedTask.type] ?? 'a developmental challenge') : 'a developmental challenge';
    const stageDesc: Record<string, string> = {
      Infrared: 'the most foundational',
      Magenta: 'an instinctive',
      Red: 'a power-oriented',
      Amber: 'a rule-governed',
      Orange: 'an achievement-driven',
      Green: 'a pluralistic',
      Turquoise: 'an integral',
      White: 'a transcendent',
    };

    // Randomized narrative pools for variety within same-line encounters
    const passedOpenings = [
      `${holonName} guided you through ${modalityDesc[modality] ?? 'an assessment'} —`,
      `Through ${modalityDesc[modality] ?? 'an assessment'}, ${holonName} drew forth your capacity —`,
      `${holonName} presented ${taskLabel}, and you rose to meet it —`,
      `The encounter unfolded through ${modalityDesc[modality] ?? 'an assessment'} — ${holonName} witnessed your engagement —`,
      `${holonName} called you into ${modalityDesc[modality] ?? 'an assessment'} — and you answered —`,
      `In the space between challenge and response, ${holonName} held the container for ${modalityDesc[modality] ?? 'an assessment'} —`,
      `The ${module.line.toLowerCase()} current flowed through ${modalityDesc[modality] ?? 'an assessment'} — ${holonName} was the channel —`,
      `With ${holonName} as witness, ${modalityDesc[modality] ?? 'an assessment'} became a crucible for growth —`,
    ];
    const passedClosings = [
      `The ${module.line.toLowerCase()} line strengthens under your attention.`,
      `The world registers your engagement. The ${module.line.toLowerCase()} capacity integrates further.`,
      `Something shifts in the field — the ${module.line.toLowerCase()} dimension acknowledges your effort.`,
      `The developmental architecture responds. The ${module.line.toLowerCase()} current deepens.`,
      `A thread weaves tighter in the fabric of your ${module.line.toLowerCase()} expression.`,
      `The ${module.stage} layer hums with the resonance of integrated capacity.`,
      `You leave this encounter slightly more whole than you entered it.`,
      `The ${module.line.toLowerCase()} dimension recognizes your willingness to engage.`,
    ];
    const failedOpenings = [
      `${holonName} presented ${taskLabel} —`,
      `Through ${modalityDesc[modality] ?? 'an assessment'}, ${holonName} offered a mirror —`,
      `The encounter arrived as ${modalityDesc[modality] ?? 'an assessment'}, delivered by ${holonName} —`,
      `${holonName} set before you ${taskLabel} —`,
      `${holonName} beckoned you into ${modalityDesc[modality] ?? 'an assessment'} — the threshold remained unsteady —`,
      `The ${module.stage} layer offered ${modalityDesc[modality] ?? 'an assessment'} through ${holonName} — the resonance was incomplete —`,
      `${holonName} opened a door to ${taskLabel} — the invitation stood waiting —`,
      `In ${modalityDesc[modality] ?? 'an assessment'}, ${holonName} showed what the ${module.line.toLowerCase()} line still seeks —`,
    ];
    const failedClosings = [
      `The ${module.line.toLowerCase()} capacity holds its tension — the work continues.`,
      `Areas remain where the ${module.line.toLowerCase()} capacity is still integrating.`,
      `The ${module.stage} layer retains its pressure. Growth awaits the next engagement.`,
      `The challenge reveals where the ${module.line.toLowerCase()} dimension still seeks balance.`,
      `Not yet integrated — but the awareness itself is a step forward.`,
      `The ${module.line.toLowerCase()} current pauses here, waiting for your return.`,
      `This edge between capacity and capacity-not-yet is where transformation begins.`,
      `The tension is not failure — it is the developmental field doing its work.`,
    ];

    const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

    if (passed) {
      return `${pick(passedOpenings)} ${taskLabel} at the ${module.stage} stage of ${module.line} development. You demonstrated ${stageDesc[module.stage] ?? ''} expression of the ${module.line.toLowerCase()} capacity. ${pick(passedClosings)}`;
    } else {
      return `${pick(failedOpenings)} ${taskLabel} at the ${module.stage} stage of ${module.line} development. ${pick(failedClosings)}`;
    }
  }

  private evaluateFallbackResponse(selectedLabel: string): {
    passed: boolean;
    polarityDirection: 'sto' | 'sts' | 'neutral';
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    feedback: string;
  } {
    const lower = selectedLabel.toLowerCase();
    
    // Check passed first (false if contains withdraw, resist, decline, sit with it)
    const passed = !['withdraw', 'resist', 'decline', 'sit with it'].some(kw => lower.includes(kw));

    const defaultSignals = {
      agency: 'HealthyBalanced',
      communion: 'HealthyBalanced',
      eros: 'HealthyBalanced',
      agape: 'HealthyBalanced'
    };

    // 1. STS mapping
    const stsKeywords = ['attack', 'betray', 'raid', 'dominate', 'strike', 'profit', 'sell', 'enforce', 'deceive', 'obey'];
    if (stsKeywords.some(kw => lower.includes(kw))) {
      const isAverted = ['betray', 'raid', 'deceive'].some(kw => lower.includes(kw));
      return {
        passed,
        polarityDirection: 'sts',
        driveScores: { agency: 0.8, communion: 0.3, eros: 0.8, agape: 0.3 },
        driveSignals: {
          ...defaultSignals,
          ...(isAverted ? { communion: 'DarkAverted', agape: 'DarkAverted' } : {})
        },
        feedback: isAverted
          ? 'Your response prioritized self-protection and tactical advantage, showing highly active Agency but potential shadow aversion toward Communion.'
          : 'Your response prioritized self-interest, power, or direct force, favoring Agency/Eros over Communion/Agape.'
      };
    }

    // 2. STO mapping
    const stoKeywords = ['alliance', 'negotiate', 'trust', 'share', 'mercy', 'compassion', 'reflect deeply', 'refuse', 'reform', 'breathe'];
    if (stoKeywords.some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'sto',
        driveScores: { agency: 0.5, communion: 0.8, eros: 0.5, agape: 0.8 },
        driveSignals: defaultSignals,
        feedback: 'Your response prioritized cooperation, empathy, and collective service, showing strong Communion and Agape alignment.'
      };
    }

    // 3. Neutral / Withdrawal mapping
    // case 3.1: withdraw / resist / sit with it / decline
    if (['withdraw', 'resist', 'sit with it', 'decline'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.4, communion: 0.5, eros: 0.3, agape: 0.5 },
        driveSignals: {
          ...defaultSignals,
          eros: 'DarkAverted'
        },
        feedback: 'Your choice to withdraw or resist shows a homeostatic focus, maintaining the boundary but delaying growth.'
      };
    }

    // case 3.2: verify / fortify / stay / hybrid / observe
    if (['verify', 'fortify', 'stay', 'hybrid', 'observe'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.6, communion: 0.6, eros: 0.4, agape: 0.5 },
        driveSignals: defaultSignals,
        feedback: 'Your response showed a balanced, cautious approach, securing current foundations before acting.'
      };
    }

    // case 3.3: respond instinctively / challenge / press forward / engage
    if (['respond instinctively', 'challenge', 'press forward', 'engage'].some(kw => lower.includes(kw))) {
      return {
        passed,
        polarityDirection: 'neutral',
        driveScores: { agency: 0.7, communion: 0.4, eros: 0.7, agape: 0.4 },
        driveSignals: defaultSignals,
        feedback: 'Your response was active and assertive, pushing forward with strong Eros and Agency.'
      };
    }

    // Default
    return {
      passed,
      polarityDirection: 'neutral',
      driveScores: { agency: 0.6, communion: 0.6, eros: 0.6, agape: 0.6 },
      driveSignals: defaultSignals,
      feedback: 'Completed the challenge via fallback choices.'
    };
  }

  /**
   * Write-in evaluation for self-reflection (Direct Questioning) encounters.
   * Unlike evaluateFallbackResponse (designed for short MCQ option labels),
   * this analyzes reflective prose for depth, coherence, and shadow signals.
   * Always passes — self-reflection is a practice, not a test.
   */
  private evaluateSelfReflection(responseText: string): {
    passed: boolean;
    polarityDirection: 'sto' | 'sts' | 'neutral';
    driveScores: { agency: number; communion: number; eros: number; agape: number };
    driveSignals: { agency: string; communion: string; eros: string; agape: string };
    feedback: string;
  } {
    const line = this.encounter.moduleRef.split(':')[0];
    const lower = responseText.toLowerCase();
    const wordCount = lower.split(/\s+/).filter(w => w.length > 0).length;

    // Early return for empty/very short responses — honest but non-punitive
    if (wordCount < 5) {
      return {
        passed: true, // still passes — brevity is not failure
        polarityDirection: 'neutral',
        driveScores: { agency: 0.5, communion: 0.5, eros: 0.5, agape: 0.5 },
        driveSignals: { agency: 'HealthyBalanced', communion: 'HealthyBalanced', eros: 'HealthyBalanced', agape: 'HealthyBalanced' },
        feedback: `A brief reflection. The ${line} line invites deeper exploration when you're ready — there is no rush, only invitation.`,
      };
    }

    const uniqueWords = new Set(lower.split(/\s+/).filter(w => w.length > 0)).size;
    const conceptDensity = wordCount > 0 ? uniqueWords / wordCount : 0;

    // Depth heuristics
    const lengthBonus = wordCount > 30 ? 0.3 : wordCount > 15 ? 0.2 : 0.1;
    const densityBonus = conceptDensity > 0.7 ? 0.15 : conceptDensity > 0.5 ? 0.1 : 0;
    const depthScore = Math.min(1.0, 0.4 + lengthBonus + densityBonus);

    // Shadow detection from write-in
    const shadow = AgenticOrchestrator.detectShadowKeywords(responseText);

    // Drive detection from semantic content
    const driveKeywords = {
      agency: ['decide', 'choose', 'act', 'control', 'direct', 'lead', 'assert', 'boundary', 'independent', 'own'],
      communion: ['connect', 'together', 'share', 'listen', 'empathy', 'feel', 'relationship', 'others', 'belong', 'community'],
      eros: ['grow', 'reach', 'aspire', 'seek', 'question', 'explore', 'transform', 'evolve', 'deeper', 'meaning'],
      agape: ['accept', 'integrate', 'compassion', 'hold', 'include', 'balance', 'paradox', 'surrender', 'release', 'wholeness'],
    };
    const driveScores: Record<string, number> = { agency: 0.5, communion: 0.5, eros: 0.5, agape: 0.5 };
    for (const [drive, keywords] of Object.entries(driveKeywords)) {
      const matches = keywords.filter(kw => lower.includes(kw)).length;
      if (matches > 0) driveScores[drive] = Math.min(1.0, 0.5 + matches * 0.1);
    }

    // Polarity from drive balance
    const selfDominant = driveScores.agency + driveScores.eros;
    const otherDominant = driveScores.communion + driveScores.agape;
    let polarityDirection: 'sto' | 'sts' | 'neutral';
    if (selfDominant > otherDominant + 0.3) polarityDirection = 'sts';
    else if (otherDominant > selfDominant + 0.3) polarityDirection = 'sto';
    else polarityDirection = 'neutral';

    // Always passes — self-reflection is a practice, not a test
    const feedback = shadow
      ? `A ${shadow.quadrant} pattern surfaced through your reflection. Naming it here is the first step toward integration. Your response contained ${wordCount} words with ${(conceptDensity * 100).toFixed(0)}% conceptual density.`
      : `Your reflection on the ${line} line showed ${depthScore > 0.7 ? 'notable depth' : 'genuine engagement'}. The field registers your willingness to look inward.`;

    return {
      passed: true,
      polarityDirection,
      driveScores: driveScores as { agency: number; communion: number; eros: number; agape: number },
      driveSignals: {
        agency: shadow?.quadrant === 'DarkAddiction' ? 'DarkAddicted' : 'HealthyBalanced',
        communion: shadow?.quadrant === 'DarkAllergy' ? 'DarkAverted' : 'HealthyBalanced',
        eros: shadow?.quadrant === 'GoldenAddiction' ? 'GoldenAddicted' : 'HealthyBalanced',
        agape: shadow?.quadrant === 'GoldenAllergy' ? 'GoldenAverted' : 'HealthyBalanced',
      },
      feedback,
    };
  }

  /**
   * Build assessment context section for the LLM system prompt.
   * Injects tasks, drive probes, and scoring rubric from the module.
   */
  private buildAssessmentContext(module: StageAssessment): string {
    const tasks = module.tasks.map((t, i) =>
      `  ${i + 1}. ${t.type}: ${t.description} (measures: ${t.measures.join(', ')})`
    ).join('\n');

    const probes = [
      `  agency: ${module.driveProbes.agency.description}`,
      `  communion: ${module.driveProbes.communion.description}`,
      `  eros: ${module.driveProbes.eros.description}`,
      `  agape: ${module.driveProbes.agape.description}`,
    ].join('\n');

    // Include the LLM rubric as scoring guidance (condensed)
    const rubric = module.scoringRubric.llmRubric
      ? `\n[SCORING RUBRIC] ${module.scoringRubric.llmRubric}`
      : '';

    return `
[ASSESSMENT MODULE] line=${module.line}; stage=${module.stage}
[TASKS - present one as a narrative challenge]
${tasks}
[DRIVE PROBES - evaluate each independently]
${probes}${rubric}
[INSTRUCTION] Weave the TASKS into a narrative encounter. After the player responds, evaluate their response against each DRIVE PROBE. Then call complete_encounter with per-drive scores and signals.`;
  }

  private createAssessmentResult(
    passed: boolean,
    scores: Partial<Record<MeasureDimension, number>>,
    driveScores?: { agency: number; communion: number; eros: number; agape: number },
    rawTrials?: readonly TrialResult[],
  ): AssessmentResult {
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

    // Wire per-drive scores into assessment dimensions so they aren't dead code
    // Only override if scores weren't explicitly provided (driveScores is a fallback signal)
    if (driveScores && !scores.accuracy) {
      dimensions.accuracy = driveScores.agency;
      dimensions.depth = driveScores.eros;
      dimensions.coherence = driveScores.communion;
      dimensions.integration = driveScores.agape;
    }

    // Populate rawTrials from the TaskRenderer's TrialResult
    const trials = rawTrials ?? [];

    return {
      line,
      stage,
      passed,
      confidence: computeConfidence(trials, 0.7),
      dimensions,
      rawTrials: trials,
    };
  }

  private finalizeEncounter(
    params: {
      passed: boolean;
      feedback: string;
      polarityDirection: 'sto' | 'sts' | 'neutral';
      driveScores?: { agency?: number; communion?: number; eros?: number; agape?: number };
      driveSignals?: { agency?: string; communion?: string; eros?: string; agape?: string };
      shadowSignal?: {
        quadrant: ShadowQuadrant;
        intensity: number;
      };
      narrativeSummary: string;
    },
    now: number
  ): Omit<OrchestratorResult, 'finalResult' | 'messages'> {
    const feedback = params.feedback;
    let energeticDirection: EnergeticDirection = 'Diffuse';
    if (params.polarityDirection === 'sto') energeticDirection = 'Radiative';
    else if (params.polarityDirection === 'sts') energeticDirection = 'Absorptive';

    // Map LLM-provided drive signals to DriveDirectionality enum.
    // If the LLM provided explicit per-drive signals, use them directly.
    // Otherwise fall back to polarity-based derivation.
    const SIGNAL_MAP: Record<string, DriveDirectionality> = {
      'HealthyBalanced': 'HealthyBalanced',
      'DarkAddicted': 'DarkAddicted',
      'DarkAverted': 'DarkAverted',
      'GoldenAddicted': 'GoldenAddicted',
      'GoldenAverted': 'GoldenAverted',
    };

    const baseDir: DriveDirectionality = params.passed ? 'HealthyBalanced' : 'DarkAddicted';
    const driveDirectionality: Record<Drive, DriveDirectionality> = {
      Agency: params.driveSignals?.agency ? (SIGNAL_MAP[params.driveSignals.agency] ?? baseDir) : baseDir,
      Communion: params.driveSignals?.communion ? (SIGNAL_MAP[params.driveSignals.communion] ?? baseDir) : baseDir,
      Eros: params.driveSignals?.eros ? (SIGNAL_MAP[params.driveSignals.eros] ?? baseDir) : (params.polarityDirection === 'sto' ? 'HealthyBalanced' : baseDir),
      Agape: params.driveSignals?.agape ? (SIGNAL_MAP[params.driveSignals.agape] ?? baseDir) : (params.polarityDirection === 'sts' ? 'HealthyBalanced' : baseDir),
    };

    const response: PlayerResponse = {
      encounterId: this.encounter.id,
      energeticDirection,
      driveDirectionality: driveDirectionality as Record<Drive, DriveDirectionality>,
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
      // Progressive degradation: failures matter more as session progresses
      const effectiveDelta = params.passed ? delta : delta * (1 + Math.min(1.5, this.history.length * 0.05));
      const newValue = Math.max(0, Math.min(1, oldValue + effectiveDelta));
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
    // G.26: PESTLE correlation — use lineToPestle mapping instead of random
    const lineToPestleLlm: Record<string, keyof PESTLETension> = {
      Cognitive: 'technological', Emotional: 'social', Moral: 'legal',
      Intrapersonal: 'environmental', Spiritual: 'environmental', Somatic: 'environmental',
      Willpower: 'political', Interpersonal: 'social',
    };
    const [encLine] = this.encounter.moduleRef.split(':');
    const dim = lineToPestleLlm[encLine] ?? PESTLE_DIMS[Math.floor(Math.random() * PESTLE_DIMS.length)]!;
    const newTension = accumulateTension(
      (updated.world as any).pestleTension ?? { political: 0, economic: 0, social: 0, technological: 0, legal: 0, environmental: 0 },
      dim,
      0.05,
    );

    // Check for macro-event trigger
    const activeEvents = (updated.world as any).activeMacroEvents ?? [];
    const macroEvent = tryTriggerMacroEvent(newTension, activeEvents, updated.sig.currentStage, now);
    const newActiveEvents = macroEvent ? [...activeEvents, macroEvent] : activeEvents;

    const updatedWorld = { ...updated.world, pestleTension: newTension, activeMacroEvents: newActiveEvents } as WorldState;

    return {
      updatedSig: updated.sig,
      updatedWorld,
      consequenceRecord: updatedRecord,
      narrativeSummary: params.narrativeSummary,
      feedback,
    };
  }
}
