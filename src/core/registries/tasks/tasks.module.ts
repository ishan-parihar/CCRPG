/**
 * Task modules — registers all cognitive tasks into TaskRegistry.
 */
import { TaskRegistry } from '../index.js';

export function register(): void {
  TaskRegistry.register('n_back', {
    slug: 'n_back',
    line: 'Cognitive',
    networkClaim: 'Dorsolateral prefrontal cortex (DLPFC) — working memory maintenance and updating.',
  });
  TaskRegistry.register('stroop', {
    slug: 'stroop',
    line: 'Cognitive',
    networkClaim: 'Anterior cingulate cortex (ACC) — conflict monitoring and inhibitory control.',
  });
  TaskRegistry.register('simon', {
    slug: 'simon',
    line: 'Cognitive',
    networkClaim: 'Premotor cortex + ACC — spatial stimulus-response conflict resolution.',
  });
  TaskRegistry.register('go_no_go', {
    slug: 'go_no_go',
    line: 'Willpower',
    networkClaim: 'Right inferior frontal gyrus (rIFG) — behavioural inhibition.',
  });
  TaskRegistry.register('affect_recognition', {
    slug: 'affect_recognition',
    line: 'Emotional',
    networkClaim: 'Fusiform face area + amygdala — facial affect decoding.',
  });
  TaskRegistry.register('dilemma_choice', {
    slug: 'dilemma_choice',
    line: 'Moral',
    networkClaim: 'Ventromedial prefrontal cortex (vmPFC) + temporoparietal junction (TPJ) — moral reasoning.',
  });
  TaskRegistry.register('reaction_time', {
    slug: 'reaction_time',
    line: 'Somatic',
    networkClaim: 'Primary motor cortex + supplementary motor area — simple motor response.',
  });
  TaskRegistry.register('held_input', {
    slug: 'held_input',
    line: 'Willpower',
    networkClaim: 'Supplementary motor area + basal ganglia — sustained motor control.',
  });
  TaskRegistry.register('breath_rhythm', {
    slug: 'breath_rhythm',
    line: 'Somatic',
    networkClaim: 'Insular cortex + brainstem respiratory centres — interoceptive rhythm coherence.',
  });
}
