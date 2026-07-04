import { describe, it, expect, vi, beforeAll, afterAll, type Mock } from 'vitest';
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
    const mockFetch = globalThis.fetch as unknown as Mock;

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
    const uiCallParams = (uiHandler.askUser as Mock).mock.calls[0]![0];
    expect(uiCallParams.questions[0]!.header).toBe('Strategy');

    // Assert outcome properties
    expect(result.finalResult.passed).toBe(true);
    expect(result.finalResult.dimensions.accuracy).toBe(0.9);
    expect(result.finalResult.dimensions.response_time).toBe(0.8);
    expect(result.narrativeSummary).toBe('The player used visual mapping to solve the memory grid.');
    expect(result.messages).toHaveLength(5); // User prompt, assistant tool call 1, tool response 1, user follow-up, assistant tool call 2

    // Verify consequence application mutated state
    expect(result.updatedSig.totalEncounters).toBe(1);
    expect(result.updatedWorld.recentEncounterIds).toContain('enc-cog-red-nback');
  });

  it('correctly handles false-positive error strings and true error objects in LLM responses', async () => {
    const mockFetch = globalThis.fetch as unknown as Mock;
    mockFetch.mockReset();

    // Setup input structures
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

    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['Reflect deeply']
        }]
      } as AskUserQuestionResult)
    };

    // --- CASE 1A: False-positive error (literal requested string) ---
    // Should NOT trigger fallback. It should make a second fetch call to resolve.
    const firstCallNarrative1A = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: "The Conqueror says: 'This is not an error.'",
            tool_calls: []
          }
        }]
      })
    };

    const secondCallComplete1A = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Completing the encounter now.',
            tool_calls: [{
              id: 'call_case1a_complete',
              type: 'function',
              function: {
                name: 'complete_encounter',
                arguments: JSON.stringify({
                  passed: true,
                  scores: {},
                  feedback: 'Narrative completed',
                  polarityDirection: 'neutral',
                  narrativeSummary: 'Completed successfully.'
                })
              }
            }]
          }
        }]
      })
    };

    mockFetch.mockResolvedValueOnce(firstCallNarrative1A as any).mockResolvedValueOnce(secondCallComplete1A as any);

    const orchestrator1A = new AgenticOrchestrator({
      encounter,
      significator: sig,
      world,
      history: [],
      conceptIndex: { modules: {} },
      uiHandler,
    });

    const result1A = await orchestrator1A.run();
    expect(mockFetch).toHaveBeenCalledTimes(2); // Should have queried twice because first was not fallback
    expect(uiHandler.askUser).not.toHaveBeenCalled(); // No fallback askUser
    expect(result1A.finalResult.passed).toBe(true);

    // --- CASE 1B: False-positive error with double-quoted "error" in narrative ---
    // Under old code, this triggers fallback because of .includes('"error"').
    // Under new code, this should NOT trigger fallback. It should make a second fetch.
    mockFetch.mockReset();
    uiHandler.askUser = vi.fn().mockResolvedValue({
      answers: [{
        selectedLabels: ['Reflect deeply']
      }]
    } as AskUserQuestionResult);

    const firstCallNarrative1B = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: "The Conqueror says: 'This is not an \"error\".'",
            tool_calls: []
          }
        }]
      })
    };

    const secondCallComplete1B = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Completing the encounter now.',
            tool_calls: [{
              id: 'call_case1b_complete',
              type: 'function',
              function: {
                name: 'complete_encounter',
                arguments: JSON.stringify({
                  passed: true,
                  scores: {},
                  feedback: 'Narrative completed',
                  polarityDirection: 'neutral',
                  narrativeSummary: 'Completed successfully.'
                })
              }
            }]
          }
        }]
      })
    };

    mockFetch.mockResolvedValueOnce(firstCallNarrative1B as any).mockResolvedValueOnce(secondCallComplete1B as any);

    const orchestrator1B = new AgenticOrchestrator({
      encounter,
      significator: sig,
      world,
      history: [],
      conceptIndex: { modules: {} },
      uiHandler,
    });

    const result1B = await orchestrator1B.run();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(uiHandler.askUser).not.toHaveBeenCalled();
    expect(result1B.finalResult.passed).toBe(true);

    // --- CASE 2: True LLM error object (starts with {"error") ---
    // Should trigger fallback immediately on first call and not query fetch again.
    mockFetch.mockReset();
    const fallbackCallError = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"error": "LLM unavailable"}',
            tool_calls: []
          }
        }]
      })
    };

    mockFetch.mockResolvedValueOnce(fallbackCallError as any);

    const orchestrator2 = new AgenticOrchestrator({
      encounter,
      significator: sig,
      world,
      history: [],
      conceptIndex: { modules: {} },
      uiHandler,
    });

    const result2 = await orchestrator2.run();
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should only query once and trigger fallback
    expect(uiHandler.askUser).toHaveBeenCalledTimes(1); // Fallback triggers askUser
    expect(result2.finalResult.passed).toBe(true);
  });

  it('implements differentiated fallback evaluation for STS (attack)', async () => {
    const mockFetch = globalThis.fetch as unknown as Mock;
    mockFetch.mockReset();
    const fallbackCallError = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"error": "LLM unavailable"}',
            tool_calls: []
          }
        }]
      })
    };
    mockFetch.mockResolvedValueOnce(fallbackCallError as any);

    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['Let us attack the enemy']
        }]
      } as AskUserQuestionResult)
    };

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
    expect(result.finalResult.passed).toBe(true);
    expect(result.consequenceRecord.polarityTrace.energeticDirection).toBe('Absorptive');
    expect(result.updatedSig.drives.weights.Communion).toBeCloseTo(0.01);
    expect(result.updatedSig.drives.weights.Agency).toBeCloseTo(0.01);
  });

  it('implements differentiated fallback evaluation for STS (betray)', async () => {
    const mockFetch = globalThis.fetch as unknown as Mock;
    mockFetch.mockReset();
    const fallbackCallError = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"error": "LLM unavailable"}',
            tool_calls: []
          }
        }]
      })
    };
    mockFetch.mockResolvedValueOnce(fallbackCallError as any);

    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['We will betray the ally']
        }]
      } as AskUserQuestionResult)
    };

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
    expect(result.finalResult.passed).toBe(true);
    expect(result.consequenceRecord.polarityTrace.energeticDirection).toBe('Absorptive');
    expect(result.updatedSig.drives.weights.Communion).toBeCloseTo(-0.02);
    expect(result.updatedSig.drives.weights.Agape).toBeCloseTo(-0.02);
    expect(result.updatedSig.drives.weights.Agency).toBeCloseTo(0.01);
    expect(result.updatedSig.drives.fixationRisk.Communion).toBeCloseTo(0.03);
  });

  it('implements differentiated fallback evaluation for STO (negotiate)', async () => {
    const mockFetch = globalThis.fetch as unknown as Mock;
    mockFetch.mockReset();
    const fallbackCallError = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"error": "LLM unavailable"}',
            tool_calls: []
          }
        }]
      })
    };
    mockFetch.mockResolvedValueOnce(fallbackCallError as any);

    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['Let us negotiate a peace agreement']
        }]
      } as AskUserQuestionResult)
    };

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
    expect(result.finalResult.passed).toBe(true);
    expect(result.consequenceRecord.polarityTrace.energeticDirection).toBe('Radiative');
    expect(result.updatedSig.drives.weights.Communion).toBeCloseTo(0.01);
  });

  it('implements differentiated fallback evaluation for Neutral/Withdrawal (withdraw)', async () => {
    const mockFetch = globalThis.fetch as unknown as Mock;
    mockFetch.mockReset();
    const fallbackCallError = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"error": "LLM unavailable"}',
            tool_calls: []
          }
        }]
      })
    };
    mockFetch.mockResolvedValueOnce(fallbackCallError as any);

    const uiHandler: AgenticUIHandler = {
      askUser: vi.fn().mockResolvedValue({
        answers: [{
          selectedLabels: ['I choose to withdraw']
        }]
      } as AskUserQuestionResult)
    };

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
    expect(result.finalResult.passed).toBe(false);
    expect(result.consequenceRecord.polarityTrace.energeticDirection).toBe('Diffuse');
    expect(result.updatedSig.drives.weights.Eros).toBeCloseTo(-0.02);
    expect(result.updatedSig.drives.fixationRisk.Eros).toBeCloseTo(0.03);
  });
});
