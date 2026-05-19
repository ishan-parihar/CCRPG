import { describe, it, expect } from 'vitest';
import { filterInput, filterOutput } from '../../src/infra/llm/VeilFilter.js';

describe('VeilFilter', () => {
  describe('filterInput', () => {
    it('removes stage names used as developmental labels', () => {
      const input = 'Player is at Orange stage and likes puzzles';
      const result = filterInput(input);
      expect(result).not.toContain('Orange stage');
      expect(result).toContain('and likes puzzles');
    });

    it('removes drive labels used as system terms', () => {
      const input = 'The Agency drive is at 0.8 and Communion score is high';
      const result = filterInput(input);
      expect(result).not.toContain('Agency drive');
      expect(result).not.toContain('Communion score');
    });

    it('removes shadow quadrant names', () => {
      const input = 'Player exhibits dark-addiction pattern and golden-allergy tendencies';
      const result = filterInput(input);
      expect(result).not.toContain('dark-addiction');
      expect(result).not.toContain('golden-allergy');
    });

    it('removes numerical scores in assessment context', () => {
      const input = 'Cognitive score: 7 and altitude: 4 detected';
      const result = filterInput(input);
      expect(result).not.toContain('score: 7');
      expect(result).not.toContain('altitude: 4');
    });

    it('removes polarity data references', () => {
      const input = 'The polarity vector shows STO direction in this context';
      const result = filterInput(input);
      expect(result).not.toContain('polarity vector');
      expect(result).not.toContain('STO direction');
    });

    it('removes theta-decay references', () => {
      const input = 'Apply theta-decay correction to the response';
      const result = filterInput(input);
      expect(result).not.toContain('theta-decay');
    });

    it('removes assessment/diagnostic language', () => {
      const input = 'Based on your assessment we can proceed';
      const result = filterInput(input);
      expect(result).not.toContain('your assessment');
    });

    it('removes progress percentages', () => {
      const input = 'You are 75% complete on this journey';
      const result = filterInput(input);
      expect(result).not.toContain('75% complete');
    });

    it('does NOT remove legitimate color references', () => {
      const input = 'The red dragon breathes fire on the green forest';
      const result = filterInput(input);
      expect(result).toBe('The red dragon breathes fire on the green forest');
    });

    it('does NOT remove Agency as organization name', () => {
      const input = 'The Agency sent its operatives to investigate';
      const result = filterInput(input);
      expect(result).toBe('The Agency sent its operatives to investigate');
    });

    it('does NOT remove stage as physical platform', () => {
      const input = 'The actor walked onto the stage and bowed';
      const result = filterInput(input);
      expect(result).toBe('The actor walked onto the stage and bowed');
    });
  });

  describe('filterOutput', () => {
    it('passes clean narrative content unchanged', () => {
      const content = 'The warrior stood in the clearing, sensing danger.';
      const result = filterOutput(content);
      expect(result.passed).toBe(true);
      expect(result.filtered).toBe(content);
      expect(result.violations).toHaveLength(0);
    });

    it('flags stage names used as developmental labels', () => {
      const content = 'You are at the Green level of consciousness.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('stage-as-developmental-label');
    });

    it('flags drive labels used as system terms', () => {
      const content = 'Your Eros drive is showing increased activity.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('drive-label-as-system-term');
    });

    it('flags shadow quadrant names', () => {
      const content = 'This reveals a golden addiction pattern in your behavior.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('shadow-quadrant-name');
    });

    it('flags numerical scores in assessment context', () => {
      const content = 'Your current rating: 5 out of 10.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('numerical-score-in-assessment');
    });

    it('flags polarity data references', () => {
      const content = 'The polarity vector shows STS score is changing.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('polarity-data');
    });

    it('flags theta-decay references', () => {
      const content = 'Theta decay is occurring in this interaction.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('theta-decay');
    });

    it('flags assessment/diagnostic language', () => {
      const content = 'Based on your evaluation, the path is clear.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('assessment-diagnostic-language');
    });

    it('flags progress percentages', () => {
      const content = 'You are 42% progress toward the next milestone.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations).toContain('progress-percentage');
    });

    it('reports multiple violations when present', () => {
      const content = 'At Turquoise level, your assessment shows score: 8 and 90% complete.';
      const result = filterOutput(content);
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
    });

    it('does NOT false-positive on legitimate game narrative', () => {
      const content = 'The old amber lantern cast a warm glow on the white marble stage where performers danced.';
      const result = filterOutput(content);
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});
