import type { ShadowQuadrant } from '../domain/enums.js';
import type { Drive } from '../domain/Drive.js';
import type { Line } from '../domain/Line.js';
import type { Stage } from '../domain/Stage.js';
import { driveForLine } from '../usecases/ProfileUpdater.js';

/**
 * Shadow encounter content: narrative prompt, evaluation rubric, and drive focus.
 */
export interface ShadowEncounterContent {
  /** Narrative introduction tailored to the shadow quadrant */
  readonly narrativeIntro: string;
  /** The drive to probe during this shadow encounter */
  readonly targetDrive: Drive;
  /** Specific prompts for the LLM to use during the encounter */
  readonly prompts: readonly string[];
  /** Evaluation criteria specific to shadow integration */
  readonly evaluationCriteria: ShadowEvaluationCriteria;
  /** Feedback template for when shadow integration is demonstrated */
  readonly integrationFeedback: string;
  /** Feedback template for when shadow remains unintegrated */
  readonly avoidanceFeedback: string;
}

export interface ShadowEvaluationCriteria {
  /** Did the player acknowledge the shadow pattern? */
  readonly acknowledged: string;
  /** Did the player demonstrate understanding of the pattern? */
  readonly understood: string;
  /** Did the player show movement toward integration? */
  readonly integrating: string;
  /** Did the player bypass or avoid the shadow? */
  readonly bypassing: string;
}

// ─── Quadrant-specific content templates ───────────────────────────────────────

const QUADRANT_CONTENT: Record<ShadowQuadrant, {
  narrativeFrames: string[];
  prompts: string[];
  evalCriteria: ShadowEvaluationCriteria;
  integrationFeedback: string;
  avoidanceFeedback: string;
}> = {
  DarkAddiction: {
    narrativeFrames: [
      'A deep pull toward the familiar shadows of {line} at {stage}. The patterns of {drive} cling here — not because they serve you, but because they are known.',
      'The weight of old habits presses on your {line} dimension. Your {drive} drive has been running on autopilot, replaying patterns that once protected you.',
    ],
    prompts: [
      'Notice the pull toward what is familiar. Where does your {drive} drive cling to old patterns?',
      'What would it feel like to release this need for control? What remains when the clinging softens?',
      'If you could observe this pattern from a distance, what would you name it?',
    ],
    evalCriteria: {
      acknowledged: 'Player names the clinging pattern without defensiveness',
      understood: 'Player identifies what the pattern was protecting or providing',
      integrating: 'Player expresses willingness to experiment with releasing the pattern',
      bypassing: 'Player intellectualizes the pattern without emotional engagement',
    },
    integrationFeedback: 'You met the shadow of clinging with awareness. Each time you notice the pull and choose differently, the grip loosens. Your {drive} drive is learning new ways to express.',
    avoidanceFeedback: 'The shadow of clinging remains unnamed. When the pattern runs unexamined, it runs unchallenged. Consider: what is the {drive} drive protecting?',
  },

  DarkAllergy: {
    narrativeFrames: [
      'A withdrawal from {line} at {stage}. Something in the {drive} dimension has pulled back — a numbness, a turning away from what feels too heavy.',
      'The silence around your {drive} expression speaks volumes. There is a part of you that has decided this dimension is not safe to explore.',
    ],
    prompts: [
      'What has your {drive} drive decided is too dangerous to feel?',
      'If the withdrawal had a voice, what would it say it is protecting you from?',
      'Where in your body do you feel the turning away? What would happen if you stayed with that sensation?',
    ],
    evalCriteria: {
      acknowledged: 'Player recognizes the withdrawal pattern without forcing engagement',
      understood: 'Player identifies what the aversion is protecting them from',
      integrating: 'Player demonstrates willingness to approach the avoided material gradually',
      bypassing: 'Player dismisses the withdrawal as insignificant or irrelevant',
    },
    integrationFeedback: 'You turned toward the withdrawal with courage. Your {drive} drive is learning that it can touch difficult material without being destroyed. This is the beginning of integration.',
    avoidanceFeedback: 'The withdrawal remains in place. The {drive} drive has decided this territory is forbidden. Without gentle exploration, the aversion persists.',
  },

  GoldenAddiction: {
    narrativeFrames: [
      'A premature reaching toward the light in your {line} dimension. The {drive} drive has decided that the lower stages are beneath you — that you should be past this by now.',
      'The aspiration to transcend the {stage} stage is itself a shadow. Your {drive} drive reaches for heights it has not yet earned through ground-level integration.',
    ],
    prompts: [
      'What if staying at this level — exactly where you are — is exactly what is needed?',
      'Where does your {drive} drive try to skip the difficult work? What would it mean to stay?',
      'If you could honor the {stage} stage as complete in itself, what would change?',
    ],
    evalCriteria: {
      acknowledged: 'Player recognizes the bypass pattern without self-judgment',
      understood: 'Player identifies what the bypass is avoiding (the difficult ground-level work)',
      integrating: 'Player demonstrates willingness to engage with the stage-appropriate material',
      bypassing: 'Player continues to reach for higher stages while avoiding current-stage work',
    },
    integrationFeedback: 'You chose to stay with what is real rather than reaching for what is ideal. Your {drive} drive is learning that transcendence includes, not bypasses. The ground-level work is the foundation.',
    avoidanceFeedback: 'The reach for transcendence continues to bypass the necessary ground-level integration. The {drive} drive has decided that where you are is not enough.',
  },

  GoldenAllergy: {
    narrativeFrames: [
      'A refusal to grow in your {line} dimension. The {drive} drive has decided that development itself is threatening — that staying where you are is safer than becoming more.',
      'The resistance to growth in your {drive} expression is not laziness. It is wisdom that has calcified into limitation. Something in you knows that growth changes everything.',
    ],
    prompts: [
      'What would change if you grew in this dimension? What are you afraid of losing?',
      'Where does your {drive} drive resist becoming more? What would it mean to let go of who you are?',
      'If growth was not dangerous, what would your {drive} drive reach for?',
    ],
    evalCriteria: {
      acknowledged: 'Player recognizes the resistance without forcing change',
      understood: 'Player identifies what the resistance is protecting (stability, identity, safety)',
      integrating: 'Player demonstrates willingness to experiment with small growth steps',
      bypassing: 'Player intellectualizes the resistance without engaging emotionally',
    },
    integrationFeedback: 'You met the resistance with curiosity rather than force. Your {drive} drive is learning that growth does not require abandoning who you are — it includes who you are in something larger.',
    avoidanceFeedback: 'The refusal to grow remains intact. The {drive} drive has decided that the cost of development is too high. Without gentle engagement, the resistance persists.',
  },
};

/**
 * Generate shadow-specific encounter content based on the line, stage, and dominant shadow quadrant.
 */
export function generateShadowContent(
  line: Line,
  stage: Stage,
  shadowQuadrant: ShadowQuadrant | null,
): ShadowEncounterContent {
  const quadrant = shadowQuadrant ?? 'DarkAddiction';
  const templates = QUADRANT_CONTENT[quadrant];
  const drive = driveForLine(line);

  // Pick narrative frame based on line (deterministic selection)
  const frameIndex = line.charCodeAt(0) % templates.narrativeFrames.length;
  const narrativeFrame = templates.narrativeFrames[frameIndex];

  // Fill in template variables
  const narrativeIntro = narrativeFrame
    .replace('{line}', line)
    .replace('{stage}', stage)
    .replace('{drive}', drive);

  // Pick prompts (use all 3 for shadow encounters — deeper engagement)
  const prompts = templates.prompts.map(p =>
    p.replace('{line}', line).replace('{stage}', stage).replace('{drive}', drive)
  );

  // Build evaluation criteria with line-specific context
  const evalCriteria: ShadowEvaluationCriteria = {
    acknowledged: `${templates.evalCriteria.acknowledged} (in the context of ${line} at ${stage})`,
    understood: templates.evalCriteria.understood,
    integrating: templates.evalCriteria.integrating,
    bypassing: templates.evalCriteria.bypassing,
  };

  // Fill feedback templates
  const integrationFeedback = templates.integrationFeedback
    .replace('{drive}', drive)
    .replace('{stage}', stage);

  const avoidanceFeedback = templates.avoidanceFeedback
    .replace('{drive}', drive)
    .replace('{stage}', stage);

  return {
    narrativeIntro,
    targetDrive: drive,
    prompts,
    evaluationCriteria: evalCriteria,
    integrationFeedback,
    avoidanceFeedback,
  };
}

/**
 * Build a system prompt addition for shadow encounters.
 * This is appended to the LLM's system prompt when executionMode='shadow'.
 */
export function buildShadowPromptSuffix(
  content: ShadowEncounterContent,
  line: Line,
  _stage: Stage,
  unresolvedCount: number,
): string {
  return `
[SHADOW WORK MODE — CRITICAL INSTRUCTIONS]
This is a SHADOW ENCOUNTER, not a capacity encounter. The player has ${unresolvedCount} unresolved shadows in ${line}.

RULES FOR SHADOW ENCOUNTERS:
1. Do NOT measure capacity. This encounter is about shadow INTEGRATION, not skill assessment.
2. Focus on the ${content.targetDrive} drive's relationship to shadow patterns.
3. Use the narrative frame: "${content.narrativeIntro}"
4. Ask questions that gently surface the shadow without forcing confrontation.
5. Evaluate based on:
   - ${content.evaluationCriteria.acknowledged}
   - ${content.evaluationCriteria.understood}
   - ${content.evaluationCriteria.integrating}
6. Watch for bypass patterns: ${content.evaluationCriteria.bypassing}
7. If the player integrates, respond with: "${content.integrationFeedback}"
8. If the player avoids, respond with: "${content.avoidanceFeedback}"
9. Keep the tone compassionate and invitational — never diagnostic or confrontational.
10. This encounter serves the never-outgrown principle: lower stages remain part of the holon.
`;
}
