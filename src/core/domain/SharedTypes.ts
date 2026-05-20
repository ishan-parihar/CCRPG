/**
 * SharedTypes -- types extracted from PlayerProfile that are used broadly across the codebase.
 * These remain even after PlayerProfile is deprecated.
 */
export type Quadrant = 'UL' | 'UR' | 'LL' | 'LR';

export type TaskSlug =
  | 'n_back'
  | 'stroop'
  | 'simon'
  | 'go_no_go'
  | 'affect_recognition'
  | 'dilemma_choice'
  | 'reaction_time'
  | 'held_input'
  | 'breath_rhythm'
  | 'self_report'
  | 'value_coherence'
  | 'pattern_prediction';
