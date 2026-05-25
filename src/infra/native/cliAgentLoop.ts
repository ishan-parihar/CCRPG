import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { createSignificator } from '../../core/domain/Significator.js';
import { bootModuleRegistry } from '../../core/assessments/bootModules.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '../../core/assessments/AgenticOrchestrator.js';
import type { AskUserQuestionParams, AskUserQuestionResult, UserAnswer } from '../../core/assessments/agentTypes.js';
import type { ScheduledEncounter } from '../../core/domain/EncounterSpecNew.js';
import { createInitialWorldState } from '../../core/engines/CandidateGeneration.js';

// Simple manual env reader to avoid external dotenv dependency
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1]!;
        let val = match[2]!.trim();
        // Strip quotes
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
} catch {
  // Ignore
}

// Polyfill import.meta.env for Node environment so LLMClient has access
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_LLM_API_KEY || 'sk-placeholder';
const baseUrl = process.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1';
const model = process.env.VITE_LLM_MODEL || 'gpt-4o-mini';

(globalThis as any).import = {
  meta: {
    env: {
      VITE_LLM_BASE_URL: baseUrl,
      VITE_LLM_API_KEY: apiKey,
      VITE_LLM_MODEL: model,
    }
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log('\n==================================================');
  console.log('       CCRPG Agentic CLI Gameplay Runner          ');
  console.log('==================================================\n');

  if (apiKey === 'sk-placeholder') {
    console.warn('WARNING: VITE_LLM_API_KEY is placeholder. OpenAI calls will fail.');
    const userKey = await askQuestion('Please enter your OpenAI API key (or press Enter to try fallback): ');
    if (userKey.trim()) {
      (globalThis as any).import.meta.env.VITE_LLM_API_KEY = userKey.trim();
    }
  }

  console.log('\nBooting registries and initializing Significator...');
  bootModuleRegistry();

  // Create a default Significator for the Red stage
  const initialAltitudes = {
    Cognitive: 'Red' as const,
    Emotional: 'Red' as const,
    Moral: 'Red' as const,
    Intrapersonal: 'Red' as const,
    Spiritual: 'Red' as const,
    Somatic: 'Red' as const,
    Willpower: 'Red' as const,
    Interpersonal: 'Red' as const,
  };
  const significator = createSignificator('cli-test-player', initialAltitudes, 'Red');

  // Create a valid initial WorldState
  const world = createInitialWorldState([]);

  // Define a mock scheduled encounter targeting Cognitive Red
  const encounter: ScheduledEncounter = {
    id: 'cli-cognitive-red',
    moduleRef: 'Cognitive:Red',
    modality: 'LanguageReflective',
    targetLines: ['Cognitive'],
    stage: 'Red',
    holonSource: 'npc-mentor',
    shadowTarget: null,
    polarityMode: 'Exploring',
    difficulty: 0.5,
    sessionPosition: 'peak',
    priority: 1.0,
    driveTarget: null,
    executionMode: 'encounter',
  };

  // Implement the CLI UI Handler for ask_user_question
  const uiHandler: AgenticUIHandler = {
    askUser: async (params: AskUserQuestionParams): Promise<AskUserQuestionResult> => {
      const answers: UserAnswer[] = [];

      for (let i = 0; i < params.questions.length; i++) {
        const q = params.questions[i]!;
        console.log('\n--------------------------------------------------');
        console.log(`[Tab: ${q.header}]`);
        console.log(`\nDialogue: "${q.question}"`);

        const hasOptions = q.options && q.options.length > 0;
        let selectedLabels: string[] = [];
        let writeInValue: string | undefined = undefined;

        if (hasOptions) {
          console.log('\nOptions:');
          q.options.forEach((opt, idx) => {
            console.log(`  [${idx + 1}] ${opt.label} - ${opt.description}`);
          });

          const promptText = q.multiSelect
            ? '\nSelect option numbers (comma-separated, e.g., 1,3): '
            : '\nSelect option number: ';

          let valid = false;
          while (!valid) {
            const answer = await askQuestion(promptText);
            const selections = answer.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

            if (selections.length > 0 && selections.every(n => n >= 1 && n <= q.options.length)) {
              selectedLabels = selections.map(n => q.options[n - 1]!.label);
              valid = true;
            } else {
              console.log('Invalid selection. Please try again.');
            }
          }
        }

        const showWriteIn = q.allowWriteIn || !hasOptions;
        if (showWriteIn) {
          const writeInVal = await askQuestion('\nType your custom/write-in response: ');
          writeInValue = writeInVal.trim() || undefined;
        }

        answers.push({
          selectedLabels,
          writeInValue,
        });
      }

      return { answers };
    }
  };

  console.log('\nStarting agentic orchestrator...');
  console.log('Connecting to LLM (Claude/GPT)... Please wait...');

  try {
    const orchestrator = new AgenticOrchestrator({
      encounter,
      significator,
      world,
      history: [],
      conceptIndex: { modules: {} },
      uiHandler,
    });

    const outcome = await orchestrator.run();

    console.log('\n==================================================');
    console.log('          Encounter Session Finished              ');
    console.log('==================================================');
    console.log(`Passed: ${outcome.finalResult.passed}`);
    console.log(`Confidence: ${outcome.finalResult.confidence}`);
    console.log('\nNarrative Summary:');
    console.log(outcome.narrativeSummary);
    console.log('\nDevelopmental Scores:');
    console.log(JSON.stringify(outcome.finalResult.dimensions, null, 2));
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('\nOrchestrator failed:', err.message || err);
  } finally {
    rl.close();
  }
}

// Run CLI main
main();
