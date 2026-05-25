import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { AgenticOrchestrator, type AgenticUIHandler } from '../../../src/core/assessments/AgenticOrchestrator.js';
import type { AskUserQuestionResult } from '../../../src/core/assessments/agentTypes.js';
import { createSignificator } from '../../../src/core/domain/Significator.js';
import { createInitialWorldState } from '../../../src/core/engines/CandidateGeneration.js';
import type { ScheduledEncounter } from '../../../src/core/domain/EncounterSpecNew.js';

// Polyfill environment for test environment
process.env.VITE_LLM_BASE_URL = 'https://mock-api.openai.com/v1';
process.env.VITE_LLM_API_KEY = 'mock-key';
process.env.VITE_LLM_MODEL = 'gpt-4o-mini';

describe('AgenticOrchestrator', () => {
  const originalFetch = globalThis.fetch;

  beforeAll(() => {
    // Mock global fetch for LLM completions
    globalThis.fetch = vi.fn();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('runs the agent loop through ask_user_question and completes the encounter', async () => {
    const mockFetch = vi.mocked(globalThis.fetch);

    // Mock first response: call ask_user_question tool
    const firstResponse = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Let\'s ask the player how they want to proceed.',
            tool_calls: [{
              id: 'call_1',
              type: 'function',
              function: {
                name: 'ask_user_question',
                arguments: JSON.stringify({
                  questions: [{
                    question: 'How do you remember items?',
                    header: 'Strategy',
                    options: [
                      { label: 'Spatial', description: 'Visual mapping' },
                      { label: 'Repetition', description: 'Rehearsing names' }
                    ],
                    multiSelect: false,
                    allowWriteIn: false
                  }]
                })
              }
            }]
          }
        }]
      })
    };

    // Mock second response: call complete_encounter tool
    const secondResponse = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Completing the encounter now.',
            tool_calls: [{
              id: 'call_2',
              type: 'function',
              function: {
                name: 'complete_encounter',
                arguments: JSON.stringify({
                  passed: true,
                  scores: { accuracy: 0.9, response_time: 0.8 },
                  feedback: 'Excellent visual memory structure.',
                  polarityDirection: 'sto',
                  narrativeSummary: 'The player used visual mapping to solve the memory grid.'
                })
              }
            }]
          }
        }]
      })
    };

    mockFetch.mockResolvedValueOnce(firstResponse as any).mockResolvedValueOnce(secondResponse as any);

    // Mock UI Handler
    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['Spatial']
        }]
      } as AskUserQuestionResult)
    };

    // Initialize inputs
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
    const sig = createSignificator('player-1', initialAltitudes, 'Red');
    const world = createInitialWorldState([]);

    const encounter: ScheduledEncounter = {
      id: 'enc-cog-red-nback',
      moduleRef: 'Cognitive:Red',
      modality: 'LanguageReflective',
      targetLines: ['Cognitive'],
      stage: 'Red',
      holonSource: 'npc-guide',
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'peak',
      priority: 1.0,
      driveTarget: null,
      executionMode: 'encounter',
    };

    const orchestrator = new AgenticOrchestrator({
      encounter,
      significator: sig,
      world,
      history: [],
      conceptIndex: { modules: {} },
      uiHandler,
    });

    const result = await orchestrator.run();

    // Assert fetch was called twice
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Assert UI handler was called once with the correct parameters
    expect(uiHandler.askUser).toHaveBeenCalledTimes(1);
    const uiCallParams = vi.mocked(uiHandler.askUser).mock.calls[0]![0];
    expect(uiCallParams.questions[0]!.header).toBe('Strategy');

    // Assert outcome properties
    expect(result.finalResult.passed).toBe(true);
    expect(result.finalResult.dimensions.accuracy).toBe(0.9);
    expect(result.finalResult.dimensions.response_time).toBe(0.8);
    expect(result.narrativeSummary).toBe('The player used visual mapping to solve the memory grid.');
    expect(result.messages).toHaveLength(4); // User prompt, assistant tool call 1, tool response 1, assistant tool call 2

    // Verify consequence application mutated state
    expect(result.updatedSig.totalEncounters).toBe(1);
    expect(result.updatedWorld.recentEncounterIds).toContain('enc-cog-red-nback');
  });
});
