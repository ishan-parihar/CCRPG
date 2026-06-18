/**
 * TaskRenderers — translates assessment TaskTypes into CLI-compatible MCQ prompts
 * and evaluates responses into TrialResult objects with real timing/accuracy data.
 *
 * Each renderer produces an AskUserQuestionParams-compatible prompt and a
 * response evaluator that generates TrialResult[] for the scoring engine.
 */
import type { AssessmentTask, TrialResult, MeasureDimension } from '../types.js';
import type { AskUserQuestionParams } from '../agentTypes.js';

// ── ANSI helpers (must be at top for const hoisting) ──────────────────

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  magenta: '\x1b[35m', cyan: '\x1b[36m', red: '\x1b[31m',
};

// ── Symbol sets for cognitive tasks ────────────────────────────────────

const NBACK_SYMBOLS = ['◆', '●', '▲', '■', '★', '◇', '○', '△'];
const STROOP_COLORS = [
  { word: 'RED', render: '\x1b[31mRED\x1b[0m', short: 'Red' },
  { word: 'BLUE', render: '\x1b[34mBLUE\x1b[0m', short: 'Blue' },
  { word: 'GREEN', render: '\x1b[32mGREEN\x1b[0m', short: 'Green' },
  { word: 'YELLOW', render: '\x1b[33mYELLOW\x1b[0m', short: 'Yellow' },
];
const GONOGO_STIMULI = ['⚔', '🛡', '☠', '✦'];

// ── N-Back Renderer ───────────────────────────────────────────────────

/**
 * Render an n-back task: generate a symbol sequence and ask the player
 * to identify which positions match the item from n steps back.
 *
 * Parameters: { n: number, trials: number, stimulusDurationMs: number, interStimulusMs: number }
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
      // Force a match
      sequence.push(sequence[i - n]!);
      matchPositions.push(i);
    } else {
      const sym = NBACK_SYMBOLS[Math.floor(Math.random() * NBACK_SYMBOLS.length)]!;
      // Avoid accidental matches with the item n steps back
      if (i >= n && sym === sequence[i - n]) {
        const alternatives = NBACK_SYMBOLS.filter(s => s !== sequence[i - n]);
        sequence.push(alternatives[Math.floor(Math.random() * alternatives.length)]!);
      } else {
        sequence.push(sym);
      }
    }
  }

  // Show the full sequence in a readable format
  const displaySequence = sequence.map((s, i) => `${C.dim}[${i + 1}]${C.reset} ${s}`).join('  ');

  const question = [
    `You see a sequence of symbols. Track each one — does it match the symbol from ${n} steps back?`,
    ``,
    `${displaySequence}`,
    ``,
    `${C.bold}How many matches did you find?${C.reset} (Type the number)`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: `N-Back(${n})`,
        options: [
          { label: `${matchPositions.length} matches`, description: `I counted ${matchPositions.length} matches in the sequence` },
          { label: `${Math.max(0, matchPositions.length - 1)} matches`, description: 'I may have missed one' },
          { label: `${matchPositions.length + 1} matches`, description: 'I may have counted an extra' },
          { label: `0 matches`, description: 'I found no matching pairs' },
        ],
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      // Parse the player's answer — extract first number found
      const numericMatch = answer.match(/\d+/);
      const playerCount = numericMatch ? parseInt(numericMatch[0]!, 10) : -1;
      const expectedCount = matchPositions.length;

      // Accuracy: how close to the correct count
      const error = Math.abs(playerCount - expectedCount);
      const accuracy = Math.max(0, 1 - error / Math.max(1, trialCount * 0.5));

      // Response time: normalized against expected time
      const expectedTime = trialCount * ((task.parameters.stimulusDurationMs as number) ?? 1100) + 2000;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;

      // Consistency: if they match exactly, high consistency
      const consistency = error === 0 ? 0.95 : error === 1 ? 0.7 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency },
        rawResponse: { playerCount, expectedCount, sequence: sequence.join(''), matchPositions },
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

  // Generate Stroop trials: word ≠ ink color
  const trials: { wordIdx: number; inkIdx: number }[] = [];
  for (let i = 0; i < trialCount; i++) {
    let wordIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    let inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    while (inkIdx === wordIdx) {
      inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    }
    trials.push({ wordIdx, inkIdx });
  }

  // Show all trials in a grid
  const trialDisplay = trials.map((t, i) => {
    const inkColor = STROOP_COLORS[t.inkIdx]!;
    return `${C.dim}#${i + 1}${C.reset} ${inkColor.render}`;
  }).join('   ');

  const question = [
    `Name the INK COLOR of each word (not the word itself).`,
    ``,
    `${trialDisplay}`,
    ``,
    `${C.bold}What is the correct ink color sequence?${C.reset} (e.g., "R,G,B,Y")`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: 'Stroop',
        options: [
          { label: 'R,G,B,Y', description: 'Red, Blue, Green, Yellow in order' },
          { label: 'B,R,Y,G', description: 'Blue, Red, Yellow, Green in order' },
          { label: 'G,Y,R,B', description: 'Green, Yellow, Red, Blue in order' },
          { label: 'Y,G,B,R', description: 'Yellow, Green, Blue, Red in order' },
        ],
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;

      // Parse answer into color initials
      const colorMap: Record<string, number> = { r: 0, red: 0, b: 1, blue: 1, g: 2, green: 2, y: 3, yellow: 3 };
      const parts = answer.toLowerCase().split(/[, ]+/).filter(Boolean);
      const playerColors = parts.map(p => colorMap[p] ?? -1).filter(c => c >= 0);

      // Compare with expected
      const expected = trials.map(t => t.inkIdx);
      let correct = 0;
      for (let i = 0; i < Math.min(playerColors.length, expected.length); i++) {
        if (playerColors[i] === expected[i]) correct++;
      }

      const accuracy = expected.length > 0 ? correct / expected.length : 0;
      const expectedTime = trialCount * 2500;
      const timeRatio = durationMs / expectedTime;
      const responseTime = timeRatio < 0.5 ? 0.9 : timeRatio < 1.5 ? 0.7 : timeRatio < 3 ? 0.5 : 0.3;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency: accuracy },
        rawResponse: { playerColors, expected, correct, total: expected.length },
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

  // Generate stimuli: 70% Go (⚔), 30% No-Go (🛡)
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

  return {
    prompt: {
      questions: [{
        question,
        header: 'Go/No-Go',
        options: [
          { label: `${goCount} GO`, description: `I counted ${goCount} go signals` },
          { label: `${goCount - 1} GO`, description: 'I may have missed one' },
          { label: `${goCount + 1} GO`, description: 'I may have counted an extra' },
          { label: `I couldn't keep track`, description: 'Too many stimuli to count' },
        ],
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

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          consistency: error === 0 ? 0.95 : error === 1 ? 0.7 : 0.4,
        },
        rawResponse: { playerCount, goCount, nogoCount, stimuli: stimuli.join('') },
        durationMs,
      };
    },
  };
}

// ── Hold Task Renderer ───────────────────────────────────────────────

/**
 * Render a Hold task: show items to remember, introduce a distraction,
 * then ask the player to recall the items.
 */
export function renderHold(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const itemCount = (task.parameters.items as number) ?? 3;
  const holdDurationMs = (task.parameters.holdDurationMs as number) ?? 5000;

  // Generate items to remember
  const items = NBACK_SYMBOLS.slice(0, itemCount);

  const question = [
    `Remember these ${itemCount} symbols:`,
    ``,
    `  ${items.join('   ')}`,
    ``,
    `Hold them in your mind for ${Math.round(holdDurationMs / 1000)} seconds.`,
    `Now: ${C.bold}List the symbols in order${C.reset} (e.g., "◆ ▲ ■")`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: 'Hold',
        options: [
          { label: `${items.join(' ')}`, description: `I remember: ${items.join(', ')}` },
          { label: `${items.slice(0, -1).join(' ')}`, description: 'I remember most of them' },
          { label: `Partial recall`, description: 'I remember some but not all' },
          { label: `I forgot`, description: 'The symbols slipped away' },
        ],
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;

      // Count matching symbols in the answer
      const answerLower = answer.toLowerCase();
      const matched = items.filter(item => answerLower.includes(item));
      const accuracy = matched.length / items.length;

      const responseTime = holdDurationMs > 0 ? Math.min(1, holdDurationMs / (holdDurationMs * 2)) : 0.7;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: { accuracy, response_time: responseTime, consistency: accuracy },
        rawResponse: { items, matched, answer },
        durationMs,
      };
    },
  };
}

// ── Pattern Prediction Renderer ──────────────────────────────────────

/**
 * Render a pattern prediction task: show a sequence and ask what comes next.
 */
export function renderPatternPrediction(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const disks = (task.parameters.disks as number) ?? 3;
  const attempts = (task.parameters.attempts as number) ?? 4;

  // Generate a simple numeric pattern
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

  return {
    prompt: {
      questions: [{
        question,
        header: 'Pattern',
        options: [
          { label: `${nextValue}`, description: `The next value is ${nextValue} (increasing by ${step})` },
          { label: `${nextValue + 1}`, description: `Maybe ${nextValue + 1}` },
          { label: `${nextValue - 1}`, description: `Maybe ${nextValue - 1}` },
          { label: `No pattern`, description: 'I see no clear pattern' },
        ],
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

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          complexity_handled: accuracy,
          self_correction: error <= 1 ? 0.8 : 0.4,
        },
        rawResponse: { pattern, nextValue, playerValue, step },
        durationMs,
      };
    },
  };
}

// ── Emotion Identification Renderer ──────────────────────────────────

/**
 * Render an emotion identification task: describe a scenario and ask
 * the player to identify the primary emotion.
 */
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
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]!;
  const options = [scenario.emotion, ...scenario.wrong].sort(() => Math.random() - 0.5);

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
        header: 'Emotion ID',
        options: options.map(o => ({
          label: o,
          description: `Identify this emotion`,
        })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const isCorrect = answer.toLowerCase().includes(scenario.emotion.toLowerCase());

      const accuracy = isCorrect ? 0.9 : 0.3;
      const responseTime = durationMs < 10000 ? 0.8 : durationMs < 30000 ? 0.6 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          response_time: responseTime,
          depth: isCorrect ? 0.7 : 0.3,
        },
        rawResponse: { scenario: scenario.text, playerEmotion: answer, expectedEmotion: scenario.emotion, isCorrect },
        durationMs,
      };
    },
  };
}

// ── Dilemma Renderer ─────────────────────────────────────────────────

/**
 * Render a dilemma: present a moral scenario with genuine ethical tensions.
 * Options map to different drives — scoring differentiates by drive alignment.
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
        { label: 'Transcend the need', description: 'The truth doesn\'t matter — only growth does', drive: 'eros', polarity: 'neutral' },
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
        { label: 'Find a third path', description: 'There\'s always another option', drive: 'eros', polarity: 'neutral' },
      ],
    },
  ];

  const dilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)]!;

  const question = [
    `${C.bold}${dilemma.scenario}${C.reset}`,
    ``,
    `What do you do?`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: 'Dilemma',
        options: dilemma.options.map(o => ({
          label: o.label,
          description: o.description,
        })),
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const answerLower = answer.toLowerCase();

      // Match player answer to a dilemma option
      const matchedOption = dilemma.options.find(o =>
        answerLower.includes(o.label.toLowerCase()) ||
        answerLower.includes(o.label.split(' ')[0]!.toLowerCase())
      );

      const accuracy = 0.7; // No wrong answer in dilemmas — any genuine engagement passes
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

/**
 * Render a self-report: ask the player to reflect on their internal state.
 */
export function renderSelfReport(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  const prompts = [
    'What emotion is most present for you right now? Describe it in your own words.',
    'When you face a challenge, what is your first instinct — fight, flee, freeze, or connect?',
    'What is one thing you avoid thinking about, and why?',
    'Describe a recent moment where you felt truly alive.',
  ];

  const promptText = prompts[Math.floor(Math.random() * prompts.length)]!;

  return {
    prompt: {
      questions: [{
        question: `${C.bold}Look inward.${C.reset}\n\n${promptText}`,
        header: 'Self-Report',
        options: [
          { label: 'I know the answer', description: 'I can articulate it clearly' },
          { label: 'I\'m uncertain', description: 'I have a sense but can\'t pin it down' },
          { label: 'I don\'t want to answer', description: 'This feels too vulnerable' },
          { label: 'Let me reflect more', description: 'I need more time to think about this' },
        ],
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const wordCount = answer.split(/\s+/).filter(Boolean).length;

      const depth = wordCount > 30 ? 0.9 : wordCount > 15 ? 0.7 : wordCount > 5 ? 0.5 : 0.3;
      const accuracy = wordCount > 5 ? 0.7 : 0.4;
      const responseTime = durationMs < 30000 ? 0.8 : durationMs < 120000 ? 0.6 : 0.4;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          depth,
          response_time: responseTime,
          metacognition: wordCount > 20 ? 0.7 : 0.4,
        },
        rawResponse: { prompt: promptText, answer, wordCount },
        durationMs,
      };
    },
  };
}

// ── Value Ranking Renderer ───────────────────────────────────────────

/**
 * Render a value ranking: ask the player to prioritize values.
 */
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
    `${C.bold}Your ranking (e.g., "3,1,4,2"):${C.reset}`,
  ].join('\n');

  return {
    prompt: {
      questions: [{
        question,
        header: 'Values',
        options: shuffled.map(v => ({
          label: v,
          description: `Prioritize ${v}`,
        })),
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

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy,
          depth,
          response_time: responseTime,
          coherence: hasRanking ? 0.7 : 0.4,
        },
        rawResponse: { values: shuffled, answer },
        durationMs,
      };
    },
  };
}

// ── Generic Fallback Renderer ────────────────────────────────────────

/**
 * Generic renderer for task types without specific implementations.
 * Presents the task description as a reflective question.
 */
export function renderGeneric(task: AssessmentTask): {
  prompt: AskUserQuestionParams;
  evaluate: (answer: string, startTimeMs: number, endTimeMs: number) => TrialResult;
} {
  return {
    prompt: {
      questions: [{
        question: `${task.description}\n\n${C.bold}How did you engage with this challenge?${C.reset}`,
        header: task.type,
        options: [
          { label: 'Fully engaged', description: 'I gave it my full attention and effort' },
          { label: 'Partially engaged', description: 'I was somewhat distracted or uncertain' },
          { label: 'Withdrew', description: 'I chose not to engage fully' },
          { label: 'Transcended', description: 'I saw beyond the surface of the task' },
        ],
        allowWriteIn: true,
        multiSelect: false,
      }],
    },
    evaluate: (answer: string, startTimeMs: number, endTimeMs: number): TrialResult => {
      const durationMs = endTimeMs - startTimeMs;
      const wordCount = answer.split(/\s+/).filter(Boolean).length;

      return {
        taskId: task.id,
        timestamp: startTimeMs,
        dimensions: {
          accuracy: wordCount > 5 ? 0.7 : 0.5,
          depth: wordCount > 15 ? 0.8 : wordCount > 5 ? 0.6 : 0.4,
          response_time: durationMs < 30000 ? 0.7 : 0.5,
        },
        rawResponse: { answer, wordCount },
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
    default: return renderGeneric(task);
  }
}
