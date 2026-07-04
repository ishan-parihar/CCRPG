import { describe, it, expect } from 'vitest';
import { contractRegistry, getContract } from '../../src/infra/llm/contracts/index.js';
import { buildPrompt, scoreResponse } from '../../src/infra/llm/contracts/LanguageReflective.js';
import { buildScenarioPrompt } from '../../src/infra/llm/contracts/ScenarioChoice.js';
import { buildFramingPrompt } from '../../src/infra/llm/contracts/DeterministicFraming.js';
import { generateFrequencySpec } from '../../src/infra/llm/FrequencyConditioner.js';

describe('ModalityContracts', () => {
  describe('contractRegistry', () => {
    it('returns valid contract for LanguageReflective', () => {
      const contract = getContract('LanguageReflective');
      expect(contract).toBeDefined();
      expect(contract.name).toBe('LanguageReflective');
    });

    it('returns valid contract for ScenarioChoice', () => {
      const contract = getContract('ScenarioChoice');
      expect(contract).toBeDefined();
      expect(contract.name).toBe('ScenarioChoice');
    });

    it('returns valid contract for Deterministic', () => {
      const contract = getContract('Deterministic');
      expect(contract).toBeDefined();
      expect(contract.name).toBe('Deterministic');
    });

    it('each contract has non-empty fixedMechanics', () => {
      const modalities = ['LanguageReflective', 'ScenarioChoice', 'Deterministic'] as const;
      for (const m of modalities) {
        const contract = getContract(m);
        expect(contract.fixedMechanics.length).toBeGreaterThan(0);
        expect(contract.fixedMechanics[0]).not.toBe('');
      }
    });

    it('each contract has non-empty llmResponsibilities', () => {
      const modalities = ['LanguageReflective', 'ScenarioChoice', 'Deterministic'] as const;
      for (const m of modalities) {
        const contract = getContract(m);
        expect(contract.llmResponsibilities.length).toBeGreaterThan(0);
        expect(contract.llmResponsibilities[0]).not.toBe('');
      }
    });

    it('each contract has generationConstraints with maxWordCount > 0', () => {
      const modalities = ['LanguageReflective', 'ScenarioChoice', 'Deterministic'] as const;
      for (const m of modalities) {
        const contract = getContract(m);
        expect(contract.generationConstraints.maxWordCount).toBeGreaterThan(0);
      }
    });

    it('contract scoring rubric weights sum to approximately 1.0', () => {
      const modalities = ['LanguageReflective', 'ScenarioChoice', 'Deterministic'] as const;
      for (const m of modalities) {
        const contract = getContract(m);
        const weightSum = contract.scoringRubric.dimensions.reduce((s, d) => s + d.weight, 0);
        expect(weightSum).toBeCloseTo(1.0, 2);
      }
    });

    it('registry contains entries for all 7 modalities', () => {
      expect(Object.keys(contractRegistry).length).toBe(7);
    });
  });

  describe('LanguageReflective buildPrompt', () => {
    it('returns non-empty string containing frequency reference', () => {
      const freq = generateFrequencySpec('Cognitive', 'Red', 'Cognitive', 'Red', 'LanguageReflective');
      const prompt = buildPrompt(freq, { line: 'Cognitive', stage: 'Red', purpose: 'self-reflection' });
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('action verbs/force-words');
    });

    it('includes encounter purpose in prompt', () => {
      const freq = generateFrequencySpec('Emotional', 'Green', 'Emotional', 'Green', 'LanguageReflective');
      const prompt = buildPrompt(freq, { line: 'Emotional', stage: 'Green', purpose: 'explore empathy' });
      expect(prompt).toContain('explore empathy');
    });
  });

  describe('LanguageReflective scoreResponse', () => {
    it('returns score between 0 and 1', () => {
      const result = scoreResponse('I chose to fight because my honor demanded it.', 'Red');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('detects self-referential language and gives higher score', () => {
      const selfRef = scoreResponse(
        'I chose this path because my instinct told me it was right. I felt the pull of something deeper within myself.',
        'Red',
      );
      const noSelfRef = scoreResponse(
        'The path was chosen. The instinct spoke. It was right. The pull came from something deeper.',
        'Red',
      );
      expect(selfRef.score).toBeGreaterThan(noSelfRef.score);
      expect(selfRef.signals).toContain('self-referential language detected');
    });

    it('gives lower score for empty or minimal responses', () => {
      const minimal = scoreResponse('Yes.', 'Red');
      const substantial = scoreResponse(
        'I struck because I saw no other way. My enemies closed in and I had to act before they destroyed what I built.',
        'Red',
      );
      expect(minimal.score).toBeLessThan(substantial.score);
      expect(minimal.signals).toContain('minimal response');
    });

    it('scores a short response more leniently at Red than at Green', () => {
      const shortResponse = 'I did it.';
      const redScore = scoreResponse(shortResponse, 'Red');
      const greenScore = scoreResponse(shortResponse, 'Green');
      // Red (early stage) is more lenient with short responses
      expect(redScore.score).toBeGreaterThan(greenScore.score);
    });

    it('scores nuance/paradox language higher at Green than at Red', () => {
      const nuancedResponse =
        'Both paths had merit, yet the tension between them held something deeper. I felt simultaneously drawn to each choice, perhaps because the paradox itself revealed a complex truth about my nature that I had not yet embraced.';
      const redScore = scoreResponse(nuancedResponse, 'Red');
      const greenScore = scoreResponse(nuancedResponse, 'Green');
      // Later stages (Green) reward nuance/paradox vocabulary
      expect(greenScore.score).toBeGreaterThan(redScore.score);
      expect(greenScore.signals).toContain('nuance/paradox language detected');
    });

    it('differentiates scoring at Amber (middle stage)', () => {
      const amberScore = scoreResponse(
        'I chose to stay because I believed loyalty demanded it, although part of me wanted to leave.',
        'Amber',
      );
      expect(amberScore.score).toBeGreaterThanOrEqual(0);
      expect(amberScore.score).toBeLessThanOrEqual(1);
      // Middle stage should reward connectives/reasoning
      expect(amberScore.signals).toContain('causal reasoning present');
    });
  });

  describe('ScenarioChoice buildScenarioPrompt', () => {
    it('returns non-empty string', () => {
      const freq = generateFrequencySpec('Moral', 'Red', 'Moral', 'Red', 'ScenarioChoice');
      const prompt = buildScenarioPrompt(freq, { line: 'Moral', stage: 'Red', purpose: 'test loyalty' });
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains frequency spec elements', () => {
      const freq = generateFrequencySpec('Moral', 'Amber', 'Moral', 'Amber', 'ScenarioChoice');
      const prompt = buildScenarioPrompt(freq, { line: 'Moral', stage: 'Amber', purpose: 'duty vs desire' });
      expect(prompt).toContain('formal/duty-words');
    });
  });

  describe('DeterministicFraming buildFramingPrompt', () => {
    it('returns non-empty string', () => {
      const freq = generateFrequencySpec('Cognitive', 'Red', 'Cognitive', 'Red', 'Deterministic');
      const prompt = buildFramingPrompt(freq, { line: 'Cognitive', stage: 'Red', taskType: 'pattern-match' });
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains task type in prompt', () => {
      const freq = generateFrequencySpec('Cognitive', 'Orange', 'Cognitive', 'Orange', 'Deterministic');
      const prompt = buildFramingPrompt(freq, { line: 'Cognitive', stage: 'Orange', taskType: 'sequence-recall' });
      expect(prompt).toContain('sequence-recall');
    });
  });
});
