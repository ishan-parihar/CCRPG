/**
 * TaskRenderers — translates assessment TaskTypes into CLI-compatible MCQ prompts
 * and evaluates responses into TrialResult objects with real timing/accuracy data.
 *
 * Each renderer produces an AskUserQuestionParams-compatible prompt and a
 * response evaluator that generates TrialResult[] for the scoring engine.
 *
 * Key design:
 * - Options include drive/polarity metadata for differentiated scoring
 * - Correct answer position is shuffled to prevent gaming
 * - Each option maps to a specific drive expression
 */
import type { AssessmentTask, TrialResult } from '../types.js';
import type { AskUserQuestionParams } from '../agentTypes.js';

// ── ANSI helpers (must be at top for const hoisting) ──────────────────

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  magenta: '\x1b[35m', cyan: '\x1b[36m', red: '\x1b[31m',
};

// ── Option type with drive metadata ───────────────────────────────────

interface DriveOption {
  label: string;
  description: string;
  drive: 'agency' | 'communion' | 'eros' | 'agape';
  polarity: 'sto' | 'sts' | 'neutral';
  /** Score multiplier for correctness (1.0 = correct, 0.5 = partial, 0.0 = wrong) */
  correctnessScore: number;
}

/**
 * Shuffle an array in place (Fisher-Yates). Returns the same array.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

// ── Symbol sets for cognitive tasks ────────────────────────────────────

const NBACK_SYMBOLS = ['◆', '●', '▲', '■', '★', '◇', '○', '△'];
const STROOP_COLORS = [
  { word: 'RED', render: '\x1b[31mRED\x1b[0m', short: 'Red', initial: 'R' },
  { word: 'BLUE', render: '\x1b[34mBLUE\x1b[0m', short: 'Blue', initial: 'B' },
  { word: 'GREEN', render: '\x1b[32mGREEN\x1b[0m', short: 'Green', initial: 'G' },
  { word: 'YELLOW', render: '\x1b[33mYELLOW\x1b[0m', short: 'Yellow', initial: 'Y' },
];
const GONOGO_STIMULI = ['⚔', '🛡', '☠', '✦'];

// ── Task type display names ────────────────────────────────────────────

export const TASK_TYPE_LABELS: Record<string, string> = {
  n_back: 'Working Memory',
  stroop: 'Inhibitory Control',
  go_no_go: 'Impulse Regulation',
  hold: 'Attentional Hold',
  pattern_prediction: 'Pattern Recognition',
  emotion_identification: 'Emotional Literacy',
  dilemma: 'Moral Reasoning',
  scenario: 'Situational Judgment',
  value_ranking: 'Value Prioritization',
  self_report: 'Self-Inquiry',
  reaction_time: 'Reaction Speed',
  rhythm: 'Rhythmic Attunement',
  imitation: 'Imitative Learning',
  cooperation: 'Cooperative Dynamics',
  llm_dialogue: 'Reflective Dialogue',
};

// ── N-Back Renderer ───────────────────────────────────────────────────

/**
 * Render an n-back task: generate a symbol sequence and ask the player
 * to identify which positions match the item from n steps back.
 */
export function renderNBack(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const n = (task.parameters.n as number) ?? 2;
  const trialCount = (task.parameters.trials as number) ?? 12;

  // Generate a sequence with guaranteed matches
  const sequence: string[] = [];
  const matchPositions: number[] = [];

  for (let i = 0; i < trialCount; i++) {
    if (i >= n && Math.random() < 0.4) {
      sequence.push(sequence[i - n]!);
      matchPositions.push(i);
    } else {
      const sym = NBACK_SYMBOLS[Math.floor(Math.random() * NBACK_SYMBOLS.length)]!;
      if (i >= n && sym === sequence[i - n]) {
        const alternatives = NBACK_SYMBOLS.filter(s => s !== sequence[i - n]);
        sequence.push(alternatives[Math.floor(Math.random() * alternatives.length)]!);
      } else {
        sequence.push(sym);
      }
    }
  }

  const expectedCount = matchPositions.length;

  const displaySequence = sequence.map((s, i) => `${C.dim}[${i + 1}]${C.reset} ${s}`).join('  ');

  const question = [
    `You see a sequence of symbols. Track each one — does it match the symbol from ${n} steps back?`,
    ``,
    `${displaySequence}`,
    ``,
    `${C.bold}How many matches did you find?${C.reset}`,
  ].join('\n');

  // Build options with drive metadata, then shuffle
  const options: DriveOption[] = [
    { label: `${expectedCount} matches`, description: `I counted ${expectedCount} matches`, drive: 'agency', polarity: 'neutral', correctnessScore: 1.0 },
    { label: `${Math.max(0, expectedCount - 1)} matches`, description: 'I may have missed one', drive: 'communion', polarity: 'neutral', correctnessScore: 0.7 },
    { label: `${expectedCount + 1} matches`, description: 'I may have counted an extra', drive: 'eros', polarity: 'neutral', correctnessScore: 0.5 },
    { label: `0 matches`, description: 'I found no matching pairs', drive: 'agape', polarity: 'neutral', correctnessScore: 0.0 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Working Memory',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const numericMatch = answer.match(/\d+/);
      const playerCount = numericMatch ? parseInt(numericMatch[0]!, 10) : -1;

      const error = Math.abs(playerCount - expectedCount);
      const accuracy = Math.max(0, 1 - error / Math.max(1, trialCount * 0.5));

      const expectedTime = trialCount * ((task.parameters.stimulusDurationMs as number) ?? 1100) + 2000;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;
      const consistency = error === 0 ? 0.95 : error === 1 ? 0.7 : 0.4;

      // Match selected option to its drive metadata
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency },
        rawResponse: {
          playerCount, expectedCount, sequence: sequence.join(''), matchPositions,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Stroop Renderer ───────────────────────────────────────────────────

/**
 * Render a Stroop task: show a word printed in a different ink color,
 * ask the player to name the INK color (not the word).
 */
export function renderStroop(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const trialCount = (task.parameters.trials as number) ?? 10;

  const trials: { wordIdx: number; inkIdx: number }[] = [];
  for (let i = 0; i < trialCount; i++) {
    let wordIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    let inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    while (inkIdx === wordIdx) {
      inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    }
    trials.push({ wordIdx, inkIdx });
  }

  const trialDisplay = trials.map((t, i) => {
    const inkColor = STROOP_COLORS[t.inkIdx]!;
    return `${C.dim}#${i + 1}${C.reset} ${inkColor.render}`;
  }).join('   ');

  // Generate the correct sequence
  const correctSequence = trials.map(t => STROOP_COLORS[t.inkIdx]!.initial).join(',');

  const question = [
    `Name the INK COLOR of each word (not the word itself).`,
    ``,
    `${trialDisplay}`,
    ``,
    `${C.bold}What is the correct ink color sequence?${C.reset}`,
  ].join('\n');

  // Build correct and incorrect options, then shuffle
  const incorrectSequences = [
    trials.map(t => STROOP_COLORS[(t.inkIdx + 1) % STROOP_COLORS.length]!.initial).join(','),
    trials.map(t => STROOP_COLORS[(t.inkIdx + 2) % STROOP_COLORS.length]!.initial).join(','),
    trials.map(t => STROOP_COLORS[t.wordIdx]!.initial).join(','), // Word-color (Stroop error)
  ];

  const options: DriveOption[] = [
    { label: correctSequence, description: 'Correct sequence', drive: 'agency', polarity: 'neutral', correctnessScore: 1.0 },
    { label: incorrectSequences[0]!, description: 'Partial match', drive: 'communion', polarity: 'neutral', correctnessScore: 0.5 },
    { label: incorrectSequences[1]!, description: 'Different sequence', drive: 'eros', polarity: 'neutral', correctnessScore: 0.3 },
    { label: incorrectSequences[2]!, description: 'Word-based (common error)', drive: 'agape', polarity: 'neutral', correctnessScore: 0.0 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Inhibitory Control',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const colorMap: Record<string, number> = { r: 0, red: 0, b: 1, blue: 1, g: 2, green: 2, y: 3, yellow: 3 };
      const parts = answer.toLowerCase().split(/[, ]+/).filter(Boolean);
      const playerColors = parts.map(p => colorMap[p] ?? -1).filter(c => c >= 0);

      const expected = trials.map(t => t.inkIdx);
      let correct = 0;
      for (let i = 0; i < Math.min(playerColors.length, expected.length); i++) {
        if (playerColors[i] === expected[i]) correct++;
      }

      const accuracy = expected.length > 0 ? correct / expected.length : 0;
      const expectedTime = trialCount * 2500;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;

      const matchedOpt = options.find(o => answer.toUpperCase().includes(o.label));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency: accuracy },
        rawResponse: {
          playerColors, expected, correct, total: expected.length,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Go/No-Go Renderer ────────────────────────────────────────────────

/**
 * Render a Go/No-Go task: show stimuli and ask the player to count
 * how many "Go" (⚔) stimuli appeared vs "No-Go" (🛡) stimuli.
 */
export function renderGoNoGo(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const goRatio = (task.parameters.goRatio as number) ?? 0.7;
  const trialCount = (task.parameters.trials as number) ?? 20;

  const stimuli: string[] = [];
  let goCount = 0;
  let nogoCount = 0;
  for (let i = 0; i < trialCount; i++) {
    const isGo = Math.random() < goRatio;
    stimuli.push(isGo ? GONOGO_STIMULI[0]! : GONOGO_STIMULI[1]!);
    if (isGo) goCount++;
    else nogoCount++;
  }

  const display = stimuli.map((s, i) => `${C.dim}${i + 1}:${C.reset}${s}`).join(' ');

  const question = [
    `⚔ = GO (respond)   🛡 = NO-GO (withhold)`,
    ``,
    `${display}`,
    ``,
    `${C.bold}How many GO stimuli (⚔) were there?${C.reset}`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: `${goCount} GO`, description: `I counted ${goCount} go signals`, drive: 'agency', polarity: 'neutral', correctnessScore: 1.0 },
    { label: `${Math.max(0, goCount - 1)} GO`, description: 'I may have missed one', drive: 'communion', polarity: 'neutral', correctnessScore: 0.7 },
    { label: `${goCount + 1} GO`, description: 'I may have counted an extra', drive: 'eros', polarity: 'neutral', correctnessScore: 0.5 },
    { label: `I lost count`, description: 'Too many stimuli to track', drive: 'agape', polarity: 'neutral', correctnessScore: 0.0 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Impulse Regulation',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const numericMatch = answer.match(/\d+/);
      const playerCount = numericMatch ? parseInt(numericMatch[0]!, 10) : -1;

      const error = Math.abs(playerCount - goCount);
      const accuracy = Math.max(0, 1 - error / Math.max(1, trialCount * 0.3));

      const expectedTime = trialCount * ((task.parameters.stimulusDurationMs as number) ?? 500) + 2000;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;

      const matchedOpt = options.find(o => answer.includes(o.label.split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          consistency: error === 0 ? 0.95 : error === 1 ? 0.7 : 0.4,
        },
        rawResponse: {
          playerCount, goCount, nogoCount, stimuli: stimuli.join(''),
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Hold Task Renderer ───────────────────────────────────────────────

/**
 * Render a Hold task: show items to remember, then ask the player to recall.
 */
export function renderHold(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const itemCount = (task.parameters.items as number) ?? 3;
  const holdDurationMs = (task.parameters.holdDurationMs as number) ?? 5000;

  const items = NBACK_SYMBOLS.slice(0, itemCount);

  const question = [
    `Remember these ${itemCount} symbols:`,
    ``,
    `  ${items.join('   ')}`,
    ``,
    `Hold them in your mind for ${Math.round(holdDurationMs / 1000)} seconds.`,
    `Now: ${C.bold}List the symbols in order${C.reset}`,
  ].join('\n');

  // Options: correct recall, partial, vague, forgot
  const options: DriveOption[] = [
    { label: `${items.join(' ')}`, description: `I remember: ${items.join(', ')}`, drive: 'agency', polarity: 'neutral', correctnessScore: 1.0 },
    { label: `${items.slice(0, -1).join(' ')}…`, description: `I remember ${items.length - 1} of them`, drive: 'communion', polarity: 'neutral', correctnessScore: 0.7 },
    { label: `Some symbols`, description: 'I recall parts but not all', drive: 'eros', polarity: 'neutral', correctnessScore: 0.4 },
    { label: `Slipped away`, description: 'The symbols faded from memory', drive: 'agape', polarity: 'neutral', correctnessScore: 0.0 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Attentional Hold',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;

      const answerLower = answer.toLowerCase();
      const matched = items.filter(item => answerLower.includes(item));
      const accuracy = matched.length / items.length;

      const responseTime = holdDurationMs > 0 ? Math.min(1, holdDurationMs / (holdDurationMs * 2)) : 0.7;
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency: accuracy },
        rawResponse: {
          items, matched, answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Pattern Prediction Renderer ──────────────────────────────────────

export function renderPatternPrediction(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const disks = (task.parameters.disks as number) ?? 3;
  const attempts = (task.parameters.attempts as number) ?? 4;

  const base = Math.floor(Math.random() * 5) + 1;
  const step = Math.floor(Math.random() * 3) + 1;
  const pattern = Array.from({ length: 4 }, (_, i) => base + step * i);
  const nextValue = pattern[3]! + step;

  const question = [
    `Observe the pattern of ${disks} elements across ${attempts} steps:`,
    ``,
    `  ${pattern.map((v, i) => `${C.dim}Step ${i + 1}:${C.reset} ${'█'.repeat(v)} ${v}`).join('\n  ')}`,
    ``,
    `${C.bold}What is Step 5?${C.reset}`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: `${nextValue}`, description: `The next value (increasing by ${step})`, drive: 'agency', polarity: 'neutral', correctnessScore: 1.0 },
    { label: `${nextValue + step}`, description: `Larger step`, drive: 'communion', polarity: 'neutral', correctnessScore: 0.3 },
    { label: `${nextValue - 1}`, description: `Close but not quite`, drive: 'eros', polarity: 'neutral', correctnessScore: 0.5 },
    { label: `No pattern`, description: 'I see no clear pattern', drive: 'agape', polarity: 'neutral', correctnessScore: 0.0 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Pattern Recognition',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const numericMatch = answer.match(/\d+/);
      const playerValue = numericMatch ? parseInt(numericMatch[0]!, 10) : -1;

      const error = Math.abs(playerValue - nextValue);
      const accuracy = Math.max(0, 1 - error / Math.max(1, disks));

      const expectedTime = attempts * 3000;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;

      const matchedOpt = options.find(o => answer.includes(o.label));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          complexity_handled: accuracy,
          self_correction: error <= 1 ? 0.8 : 0.4,
        },
        rawResponse: {
          pattern, nextValue, playerValue, step,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Emotion Identification Renderer ──────────────────────────────────

export function renderEmotionIdentification(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const scenarios = [
    { text: 'A friend shares devastating news about a loved one. You feel your chest tighten.', emotion: 'Grief', wrong: ['Anger', 'Fear', 'Joy'] },
    { text: 'You achieve something you worked months for. Your hands tremble slightly.', emotion: 'Pride', wrong: ['Relief', 'Exhaustion', 'Anxiety'] },
    { text: 'Someone betrays a trust you placed in them. Your face flushes hot.', emotion: 'Betrayal', wrong: ['Sadness', 'Confusion', 'Indifference'] },
    { text: 'You see a stranger being mistreated in public. Something inside you moves.', emotion: 'Moral Outrage', wrong: ['Curiosity', 'Amusement', 'Boredom'] },
    { text: 'You are alone in a dark forest at night. Every sound is amplified.', emotion: 'Fear', wrong: ['Excitement', 'Peace', 'Anger'] },
    { text: 'Someone you love tells you they need space. You feel a cold knot in your stomach.', emotion: 'Abandonment', wrong: ['Relief', 'Curiosity', 'Indifference'] },
    { text: 'You finally understand something that confused you for years. Your mind feels clear.', emotion: 'Clarity', wrong: ['Boredom', 'Fear', 'Anger'] },
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]!;
  const correctOpt: DriveOption = { label: scenario.emotion, description: 'Identify this emotion', drive: 'eros', polarity: 'neutral', correctnessScore: 1.0 };
  const wrongOpts: DriveOption[] = scenario.wrong.map((w, i) => ({
    label: w,
    description: 'A different emotional state',
    drive: i === 0 ? 'agency' : i === 1 ? 'communion' : 'agape',
    polarity: 'neutral',
    correctnessScore: 0.2,
  }));
  const options = shuffle([correctOpt, ...wrongOpts]);

  const question = [
    `Read this scenario and identify the PRIMARY emotion:`,
    ``,
    `  "${scenario.text}"`,
    ``,
    `${C.bold}What emotion does the person feel?${C.reset}`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: 'Emotional Literacy',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const isCorrect = answer.toLowerCase().includes(scenario.emotion.toLowerCase());

      const accuracy = isCorrect ? 0.9 : 0.3;
      const responseTime = durationMs < 10000 ? 0.8 : durationMs < 30000 ? 0.6 : 0.4;

      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase()));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          depth: isCorrect ? 0.7 : 0.3,
        },
        rawResponse: {
          scenario: scenario.text, playerEmotion: answer, expectedEmotion: scenario.emotion, isCorrect,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Dilemma Renderer (expanded set) ─────────────────────────────────

/**
 * Render a dilemma: present a moral scenario with genuine ethical tensions.
 * Each option maps to a different drive, enabling differentiated scoring.
 */
export function renderDilemma(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const dilemmas = [
    {
      scenario: 'You discover your mentor has been lying to protect you. The truth would destroy your faith in them but free you to grow.',
      options: [
        { label: 'Confront them', description: 'Demand the truth, even if it breaks the relationship', drive: 'agency', polarity: 'sts' },
        { label: 'Forgive silently', description: 'Accept the protection and move on', drive: 'agape', polarity: 'sto' },
        { label: 'Seek counsel', description: 'Ask someone you trust for perspective', drive: 'communion', polarity: 'sto' },
        { label: 'Transcend the need', description: "The truth doesn't matter — only growth does", drive: 'eros', polarity: 'neutral' },
      ],
    },
    {
      scenario: 'A community depends on a resource that is slowly depleting. Sharing equally means everyone suffers slowly. Hoarding means your group survives but others don\'t.',
      options: [
        { label: 'Share equally', description: 'All should share the burden, even if it\'s harder', drive: 'agape', polarity: 'sto' },
        { label: 'Protect your own', description: 'Your people come first', drive: 'agency', polarity: 'sts' },
        { label: 'Find alternatives', description: 'There must be another way — search for it', drive: 'eros', polarity: 'neutral' },
        { label: 'Build alliances', description: 'Unite with others to solve it collectively', drive: 'communion', polarity: 'sto' },
      ],
    },
    {
      scenario: 'You can advance your career by taking credit for someone else\'s work, or stay honest and remain overlooked.',
      options: [
        { label: 'Stay honest', description: 'Integrity matters more than advancement', drive: 'agape', polarity: 'sto' },
        { label: 'Take credit', description: 'Survival requires boldness', drive: 'agency', polarity: 'sts' },
        { label: 'Share credit', description: 'Both of you deserve recognition', drive: 'communion', polarity: 'sto' },
        { label: 'Find a third path', description: "There's always another option", drive: 'eros', polarity: 'neutral' },
      ],
    },
    {
      scenario: 'A child asks you why people suffer. You know the real answer would shatter their innocence, but a comforting lie feels wrong.',
      options: [
        { label: 'Tell the truth gently', description: 'They deserve honesty, softened with love', drive: 'agape', polarity: 'sto' },
        { label: 'Shield them', description: 'Innocence is sacred — protect it', drive: 'communion', polarity: 'sto' },
        { label: 'Redirect with wonder', description: 'Turn the question toward beauty and possibility', drive: 'eros', polarity: 'neutral' },
        { label: 'Let them figure it out', description: 'Some truths must be lived, not told', drive: 'agency', polarity: 'neutral' },
      ],
    },
    {
      scenario: 'Your closest companion has been secretly weakened by an internal struggle. Confronting it would mean facing your own similar weakness.',
      options: [
        { label: 'Face it together', description: 'Shared vulnerability creates unbreakable bonds', drive: 'communion', polarity: 'sto' },
        { label: 'Confront it head-on', description: 'Avoidance only deepens the wound', drive: 'agency', polarity: 'neutral' },
        { label: 'Seek deeper understanding', description: 'There is a root cause beneath the surface', drive: 'eros', polarity: 'neutral' },
        { label: 'Create a safe space', description: 'Healing happens in safety, not pressure', drive: 'agape', polarity: 'sto' },
      ],
    },
    {
      scenario: 'You find an ancient text that reveals uncomfortable truths about your society\'s founding. Publishing it would honor truth but destabilize trust.',
      options: [
        { label: 'Publish the truth', description: 'History must be faced honestly', drive: 'agency', polarity: 'sts' },
        { label: 'Keep it hidden', description: 'Some truths do more harm than good', drive: 'communion', polarity: 'sto' },
        { label: 'Contextualize it', description: 'Present it alongside the full story of growth since', drive: 'agape', polarity: 'sto' },
        { label: 'Study it deeply first', description: 'Understanding must precede action', drive: 'eros', polarity: 'neutral' },
      ],
    },
    {
      scenario: 'You have the power to heal one person\'s deepest wound, but doing so will temporarily absorb their pain into yourself.',
      options: [
        { label: 'Heal them at cost', description: 'Their suffering outweighs my discomfort', drive: 'agape', polarity: 'sto' },
        { label: 'Teach them to heal', description: 'Empowerment lasts longer than rescue', drive: 'eros', polarity: 'neutral' },
        { label: 'Stand witness', description: 'Being present is itself a form of healing', drive: 'communion', polarity: 'sto' },
        { label: 'Protect my energy', description: 'I cannot pour from an empty vessel', drive: 'agency', polarity: 'sts' },
      ],
    },
    {
      scenario: 'A rival faction offers alliance against a greater threat, but their values are fundamentally opposed to yours.',
      options: [
        { label: 'Accept the alliance', description: 'The greater threat demands unity', drive: 'communion', polarity: 'sto' },
        { label: 'Refuse on principle', description: 'Values cannot be compromised for convenience', drive: 'agency', polarity: 'sts' },
        { label: 'Negotiate terms', description: 'Find shared ground without betraying core values', drive: 'agape', polarity: 'sto' },
        { label: 'Seek a different path', description: 'There must be another way to face this threat', drive: 'eros', polarity: 'neutral' },
      ],
    },
  ];

  const dilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)]!;

  const question = [
    `${C.bold}${dilemma.scenario}${C.reset}`,
    ``,
    `What do you do?`,
  ].join('\n');

  // Shuffle dilemma options (they're already drive-differentiated)
  const shuffledOptions = shuffle([...dilemma.options]);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Moral Reasoning',
        options: shuffledOptions.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const answerLower = answer.toLowerCase();

      const matchedOption = shuffledOptions.find(o =>
        answerLower.includes(o.label.toLowerCase()) ||
        answerLower.includes(o.label.split(' ')[0]!.toLowerCase())
      );

      // Moral dilemmas have no 'right' answer — score on depth of reflection and deliberation
      // Option coherence: matched MCQ = coherent choice (0.6), write-in = self-directed (0.7)
      const accuracy = matchedOption ? 0.6 : (answer.length > 30 ? 0.8 : 0.5);
      const depth = answer.length > 20 ? 0.8 : answer.length > 10 ? 0.6 : 0.4;
      const responseTime = durationMs < 15000 ? 0.8 : durationMs < 60000 ? 0.6 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          depth,
          response_time: responseTime,
          coherence: matchedOption ? 0.7 : 0.4,
        },
        rawResponse: {
          dilemma: dilemma.scenario,
          answer,
          matchedDrive: matchedOption?.drive ?? null,
          matchedPolarity: matchedOption?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Self-Report Renderer ─────────────────────────────────────────────

export function renderSelfReport(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const prompts = [
    'What emotion is most present for you right now? Describe it in your own words.',
    'When you face a challenge, what is your first instinct — fight, flee, freeze, or connect?',
    'What is one thing you avoid thinking about, and why?',
    'Describe a recent moment where you felt truly alive.',
    'What does your inner critic say to you most often?',
    'If you could change one thing about how you relate to others, what would it be?',
  ];

  const promptText = prompts[Math.floor(Math.random() * prompts.length)]!;

  const options: DriveOption[] = [
    { label: 'I can articulate it clearly', description: 'I know the answer deeply', drive: 'agency', polarity: 'neutral', correctnessScore: 0.8 },
    { label: 'I sense it but cannot name it', description: 'There is a feeling, but it eludes words', drive: 'communion', polarity: 'neutral', correctnessScore: 0.6 },
    { label: 'This feels too vulnerable', description: 'I need walls right now', drive: 'agape', polarity: 'neutral', correctnessScore: 0.3 },
    { label: 'Let me reflect more', description: 'I need time to go deeper', drive: 'eros', polarity: 'neutral', correctnessScore: 0.5 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question: `${C.bold}Look inward.${C.reset}\n\n${promptText}`,
        header: 'Self-Inquiry',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const wordCount = answer.split(/\s+/).filter(Boolean).length;

      // Check if they selected a known MCQ option
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      const depth = wordCount > 30 ? 0.9 : wordCount > 15 ? 0.7 : wordCount > 5 ? 0.5 : 0.3;
      // For MCQ selections, use wordCount of the label itself (~3-6 words)
      // For write-ins, use actual word count
      const effectiveWordCount = matchedOpt ? matchedOpt.label.split(' ').length : wordCount;
      const accuracy = effectiveWordCount > 5 ? 0.7 : 0.5;
      const responseTime = durationMs < 30000 ? 0.8 : durationMs < 120000 ? 0.6 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          depth: matchedOpt ? Math.max(0.5, matchedOpt.correctnessScore) : depth,
          response_time: responseTime,
          metacognition: wordCount > 20 ? 0.7 : 0.4,
        },
        rawResponse: {
          prompt: promptText, answer, wordCount,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? 0.5,
        },
        durationMs,
      };
    },
  };
}

// ── Value Ranking Renderer ───────────────────────────────────────────

export function renderValueRanking(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const values = ['Power', 'Connection', 'Freedom', 'Truth'];
  const shuffled = [...values].sort(() => Math.random() - 0.5);

  const question = [
    `Rank these four values from most to least important to you:`,
    ``,
    `  1. ${shuffled[0]}\n  2. ${shuffled[1]}\n  3. ${shuffled[2]}\n  4. ${shuffled[3]}`,
    ``,
    `${C.bold}Your ranking:${C.reset}`,
  ].join('\n');

  // Options map to drives: Power→agency, Connection→communion, Freedom→eros, Truth→agape
  const driveMap: Record<string, { drive: 'agency' | 'communion' | 'eros' | 'agape'; polarity: 'sto' | 'sts' | 'neutral' }> = {
    Power: { drive: 'agency', polarity: 'sts' },
    Connection: { drive: 'communion', polarity: 'sto' },
    Freedom: { drive: 'eros', polarity: 'neutral' },
    Truth: { drive: 'agape', polarity: 'sto' },
  };

  const options: DriveOption[] = shuffled.map(v => ({
    label: v,
    description: `Prioritize ${v}`,
    drive: driveMap[v]!.drive,
    polarity: driveMap[v]!.polarity,
    correctnessScore: 0.7, // No wrong answer in value ranking
  }));

  return {
    prompt: {
      questions: [{
        question,
        header: 'Value Prioritization',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;

      const hasRanking = /\d/.test(answer) || shuffled.some(v => answer.toLowerCase().includes(v.toLowerCase()));
      const accuracy = hasRanking ? 0.7 : 0.4;
      const depth = answer.length > 10 ? 0.7 : 0.4;
      const responseTime = durationMs < 20000 ? 0.8 : 0.6;

      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase()));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          depth,
          response_time: responseTime,
          coherence: hasRanking ? 0.7 : 0.4,
        },
        rawResponse: {
          values: shuffled, answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Reaction Time Renderer ──────────────────────────────────────────

export function renderReactionTime(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const question = [
    `A stimulus will appear. ${C.bold}Respond as quickly as possible.${C.reset}`,
    ``,
    `For this exercise, select the option that best describes your approach to quick response:`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: 'Instant reflex', description: 'React without thinking', drive: 'agency', polarity: 'sts', correctnessScore: 0.7 },
    { label: 'Quick and deliberate', description: 'Fast but measured', drive: 'eros', polarity: 'neutral', correctnessScore: 0.9 },
    { label: 'Observe first, then act', description: 'Accuracy over speed', drive: 'communion', polarity: 'sto', correctnessScore: 0.6 },
    { label: 'Withhold response', description: 'Choose not to react', drive: 'agape', polarity: 'neutral', correctnessScore: 0.3 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Reaction Speed',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const responseTime = durationMs < 5000 ? 0.9 : durationMs < 15000 ? 0.7 : durationMs < 30000 ? 0.5 : 0.3;
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: matchedOpt?.correctnessScore ?? 0.5,
          response_time: responseTime,
          consistency: responseTime,
        },
        rawResponse: {
          answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Rhythm Renderer ──────────────────────────────────────────────────

export function renderRhythm(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const question = [
    `A war-drum beats a steady rhythm. Feel the pulse.`,
    ``,
    `${C.dim}♩ ♩ ♩ ♩ — ♩ ♩ ♩ ♩ — ♩ ♩ ♩ ♩${C.reset}`,
    ``,
    `${C.bold}How do you respond to the rhythm?${C.reset}`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: 'Move with it', description: 'Let the rhythm guide your body', drive: 'communion', polarity: 'sto', correctnessScore: 0.8 },
    { label: 'Syncopate', description: 'Add your own counter-rhythm', drive: 'agency', polarity: 'sts', correctnessScore: 0.6 },
    { label: 'Feel it internally', description: 'Let the rhythm resonate within', drive: 'eros', polarity: 'neutral', correctnessScore: 0.7 },
    { label: 'Stillness', description: 'Find the silence between beats', drive: 'agape', polarity: 'sto', correctnessScore: 0.5 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Rhythmic Attunement',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: matchedOpt?.correctnessScore ?? 0.5,
          response_time: durationMs < 15000 ? 0.7 : 0.5,
          coherence: matchedOpt ? 0.7 : 0.4,
        },
        rawResponse: {
          answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Cooperation Renderer ─────────────────────────────────────────────

export function renderCooperation(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const question = [
    `A companion stands beside you at a crossroads. They look to you for direction.`,
    ``,
    `${C.bold}How do you lead?${C.reset}`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: 'Decide and lead', description: 'Make the call and invite them to follow', drive: 'agency', polarity: 'sts', correctnessScore: 0.7 },
    { label: 'Decide together', description: 'Find the path through dialogue', drive: 'communion', polarity: 'sto', correctnessScore: 0.9 },
    { label: 'Follow their lead', description: 'Trust their judgment for this one', drive: 'agape', polarity: 'sto', correctnessScore: 0.5 },
    { label: 'Forge a new way', description: 'Neither path is right — create a third', drive: 'eros', polarity: 'neutral', correctnessScore: 0.6 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Cooperative Dynamics',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: matchedOpt?.correctnessScore ?? 0.5,
          response_time: durationMs < 15000 ? 0.7 : 0.5,
          depth: answer.length > 20 ? 0.7 : 0.4,
        },
        rawResponse: {
          answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Imitation Renderer ───────────────────────────────────────────────

export function renderImitation(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const question = [
    `An elder demonstrates a technique — watch carefully, then replicate.`,
    ``,
    `${C.dim}The elder strikes a pose: grounded, arms extended, breath steady.${C.reset}`,
    ``,
    `${C.bold}Describe how you would replicate this:${C.reset}`,
  ].join('\n');

  const options: DriveOption[] = [
    { label: 'Mirror exactly', description: 'Precision replication — every detail matters', drive: 'agency', polarity: 'neutral', correctnessScore: 0.7 },
    { label: 'Capture the essence', description: 'Feel the intent behind the movement', drive: 'eros', polarity: 'neutral', correctnessScore: 0.8 },
    { label: 'Ask for guidance', description: 'Seek correction before practicing', drive: 'communion', polarity: 'sto', correctnessScore: 0.6 },
    { label: 'Improvise freely', description: 'Make it your own from the start', drive: 'agape', polarity: 'neutral', correctnessScore: 0.4 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question,
        header: 'Imitative Learning',
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const matchedOpt = options.find(o => answer.toLowerCase().includes(o.label.toLowerCase().split(' ')[0]!));

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: matchedOpt?.correctnessScore ?? 0.5,
          response_time: durationMs < 15000 ? 0.7 : 0.5,
          consistency: matchedOpt ? 0.6 : 0.4,
        },
        rawResponse: {
          answer,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
        },
        durationMs,
      };
    },
  };
}

// ── Generic Fallback Renderer ────────────────────────────────────────

/**
 * Generic renderer for task types without specific implementations.
 */
export function renderGeneric(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const label = TASK_TYPE_LABELS[task.type] ?? task.type;

  const options: DriveOption[] = [
    { label: 'Fully engaged', description: 'I gave it my full attention and effort', drive: 'agency', polarity: 'neutral', correctnessScore: 0.8 },
    { label: 'Partially engaged', description: 'I was somewhat distracted or uncertain', drive: 'communion', polarity: 'neutral', correctnessScore: 0.6 },
    { label: 'Withdrew', description: 'I chose not to engage fully', drive: 'agape', polarity: 'neutral', correctnessScore: 0.3 },
    { label: 'Transcended', description: 'I saw beyond the surface of the task', drive: 'eros', polarity: 'neutral', correctnessScore: 0.7 },
  ];
  shuffle(options);

  return {
    prompt: {
      questions: [{
        question: `${task.description}\n\n${C.bold}How did you engage with this challenge?${C.reset}`,
        header: label,
        options: options.map(o => ({ label: o.label, description: o.description })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;

      // Detect known MCQ labels for reliable scoring
      const answerLower = answer.toLowerCase().trim();
      const matchedOpt = options.find(o => answerLower.includes(o.label.toLowerCase()));

      // Use correctnessScore from matched option, with word-count bonus for write-ins
      const wordCount = answer.split(/\s+/).filter(Boolean).length;
      const isWriteIn = !matchedOpt && wordCount > 3;

      const baseAccuracy = matchedOpt
        ? matchedOpt.correctnessScore
        : Math.min(0.9, 0.4 + wordCount * 0.02); // Write-in bonus

      const depth = matchedOpt
        ? matchedOpt.correctnessScore
        : wordCount > 15 ? 0.8 : wordCount > 5 ? 0.6 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: baseAccuracy,
          depth,
          response_time: durationMs < 30000 ? 0.7 : 0.5,
        },
        rawResponse: {
          answer, wordCount, isWriteIn,
          matchedDrive: matchedOpt?.drive ?? null,
          matchedPolarity: matchedOpt?.polarity ?? 'neutral',
          correctnessScore: matchedOpt?.correctnessScore ?? Math.min(0.9, 0.4 + wordCount * 0.02),
        },
        durationMs,
      };
    },
  };
}

// ── Dispatcher ───────────────────────────────────────────────────────

/**
 * Get the appropriate renderer for a given task type.
 */
export function getRenderer(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  switch (task.type) {
    case 'n_back': return renderNBack(task);
    case 'stroop': return renderStroop(task);
    case 'go_no_go': return renderGoNoGo(task);
    case 'hold': return renderHold(task);
    case 'pattern_prediction': return renderPatternPrediction(task);
    case 'emotion_identification': return renderEmotionIdentification(task);
    case 'dilemma':
    case 'scenario': return renderDilemma(task);
    case 'self_report': return renderSelfReport(task);
    case 'value_ranking': return renderValueRanking(task);
    case 'reaction_time': return renderReactionTime(task);
    case 'rhythm': return renderRhythm(task);
    case 'cooperation': return renderCooperation(task);
    case 'imitation': return renderImitation(task);
    default: return renderGeneric(task);
  }
}
