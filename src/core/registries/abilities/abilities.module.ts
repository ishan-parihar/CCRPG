/**
 * Abilities module — MVP verb bindings for all 8 lines.
 * Each ability references a task in TaskRegistry.
 */
import { AbilityRegistry } from '../index.js';

export function register(): void {
  // Cognitive line
  AbilityRegistry.register('echo-cast', {
    slug: 'echo-cast',
    line: 'Cognitive',
    taskSlug: 'n_back',
    name: 'Echo Cast',
  });
  AbilityRegistry.register('pattern-weave', {
    slug: 'pattern-weave',
    line: 'Cognitive',
    taskSlug: 'simon',
    name: 'Pattern Weave',
  });

  // Emotional line
  AbilityRegistry.register('empathy-read', {
    slug: 'empathy-read',
    line: 'Emotional',
    taskSlug: 'affect_recognition',
    name: 'Empathy Read',
  });

  // Moral line
  AbilityRegistry.register('vow-strike', {
    slug: 'vow-strike',
    line: 'Moral',
    taskSlug: 'dilemma_choice',
    name: 'Vow Strike',
  });

  // Intrapersonal line
  AbilityRegistry.register('witness-pause', {
    slug: 'witness-pause',
    line: 'Intrapersonal',
    taskSlug: 'stroop',
    name: 'Witness Pause',
  });

  // Spiritual line
  AbilityRegistry.register('breath-gate', {
    slug: 'breath-gate',
    line: 'Spiritual',
    taskSlug: 'breath_rhythm',
    name: 'Breath Gate',
  });

  // Somatic line
  AbilityRegistry.register('reflex-dodge', {
    slug: 'reflex-dodge',
    line: 'Somatic',
    taskSlug: 'reaction_time',
    name: 'Reflex Dodge',
  });

  // Willpower line
  AbilityRegistry.register('iron-hold', {
    slug: 'iron-hold',
    line: 'Willpower',
    taskSlug: 'held_input',
    name: 'Iron Hold',
  });
  AbilityRegistry.register('impulse-check', {
    slug: 'impulse-check',
    line: 'Willpower',
    taskSlug: 'go_no_go',
    name: 'Impulse Check',
  });

  // Interpersonal line
  AbilityRegistry.register('mirror-sync', {
    slug: 'mirror-sync',
    line: 'Interpersonal',
    taskSlug: 'breath_rhythm',
    name: 'Mirror Sync',
  });
}
