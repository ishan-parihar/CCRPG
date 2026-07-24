/**
 * ArchetypalClass — the 8×4=32 archetypal-class matrix per HoloOS 08.8.26.
 *
 * Each of the 8 functional roles (M·P·C·E·S·T·G·Ch) manifests across 4
 * dimensions (Mental, Biological, Social, Collective), producing 32 distinct
 * archetypal classes. This is the canonical typology for catalyst-class
 * identification, user-Matrix modelling, and encounter targeting.
 *
 * Status: canonical-hypothesis (Mysterium-specific operationalization of HoloOS
 * 08.8.26, which is canonical-hypothesis).
 */

/** The 4 manifestation dimensions per HoloOS 08.8.26 §2. */
export type Dimension = 'Mental' | 'Biological' | 'Social' | 'Collective';

export const ALL_DIMENSIONS: readonly Dimension[] = ['Mental', 'Biological', 'Social', 'Collective'];

/** The 8 functional roles per HoloOS 02.1 (canonical). */
export type ArchetypalRole = 'Matrix' | 'Potentiator' | 'Catalyst' | 'Experience' | 'Significator' | 'Transformation' | 'GreatWay' | 'Choice';

export const ALL_ROLES: readonly ArchetypalRole[] = [
  'Matrix', 'Potentiator', 'Catalyst', 'Experience',
  'Significator', 'Transformation', 'GreatWay', 'Choice',
];

/** The 32 archetypal classes (8 roles × 4 dimensions). */
export interface ArchetypalClass {
  readonly role: ArchetypalRole;
  readonly dimension: Dimension;
  readonly name: string;
  readonly description: string;
}

/** The canonical 32-class matrix. */
export const ARCHETYPAL_CLASS_MATRIX: readonly ArchetypalClass[] = [
  // Matrix (current-state organizer, reservoir, intra-holonic, holds the past)
  { role: 'Matrix', dimension: 'Mental', name: 'cognitive-schema', description: 'Thought-patterns, mental models, belief structures' },
  { role: 'Matrix', dimension: 'Biological', name: 'structural-configuration', description: 'Physical substrate organization, cellular architecture' },
  { role: 'Matrix', dimension: 'Social', name: 'role-identity', description: 'Social position, institutional role, relational patterns' },
  { role: 'Matrix', dimension: 'Collective', name: 'cultural-field', description: 'Shared mythology, collective memory, species-level patterns' },

  // Potentiator (latent-state generator, reservoir, extra-holonic, holds the future)
  { role: 'Potentiator', dimension: 'Mental', name: 'imaginal-possibility', description: 'Envisioned futures, creative potential, dream-constructs' },
  { role: 'Potentiator', dimension: 'Biological', name: 'genomic-potential', description: 'Epigenetic potential, developmental plasticity, unused capacity' },
  { role: 'Potentiator', dimension: 'Social', name: 'relational-field', description: 'Reachable social configurations, unactualized relationships' },
  { role: 'Potentiator', dimension: 'Collective', name: 'emergent-myth', description: 'Cultural possibilities, unmanifest social forms, future archetypes' },

  // Catalyst (input perturbation, currency, flows extra→intra)
  { role: 'Catalyst', dimension: 'Mental', name: 'cognitive-perturbation', description: 'Ideas that challenge, paradoxes that open, concepts that break frames' },
  { role: 'Catalyst', dimension: 'Biological', name: 'physical-perturbation', description: 'Physical stressors, somatic challenges, environmental pressures' },
  { role: 'Catalyst', dimension: 'Social', name: 'relational-perturbation', description: 'Conflict, intimacy, power-dynamics, social friction' },
  { role: 'Catalyst', dimension: 'Collective', name: 'field-perturbation', description: 'Cultural shifts, collective events, systemic crises' },

  // Experience (integrated state-update, currency, flows intra→extra)
  { role: 'Experience', dimension: 'Mental', name: 'cognitive-integration', description: 'New understanding, shifted worldview, resolved paradox' },
  { role: 'Experience', dimension: 'Biological', name: 'somatic-adaptation', description: 'Physical conditioning, neural plasticity, embodied learning' },
  { role: 'Experience', dimension: 'Social', name: 'relational-skill', description: 'New relational capacity, communication development, boundary-setting' },
  { role: 'Experience', dimension: 'Collective', name: 'cultural-transmission', description: 'Contributed to shared meaning, participated in collective ritual' },

  // Significator (persistent identity-pattern, reservoir, accumulated across all stages)
  { role: 'Significator', dimension: 'Mental', name: 'self-narrative', description: 'The story of who-I-am across time, cognitive identity' },
  { role: 'Significator', dimension: 'Biological', name: 'embodied-identity', description: 'The body\'s accumulated history, somatic memory, constitutional pattern' },
  { role: 'Significator', dimension: 'Social', name: 'social-identity', description: 'How others know you, reputation, relational history' },
  { role: 'Significator', dimension: 'Collective', name: 'archetypal-resonance', description: 'Which collective patterns the holon embodies and carries' },

  // Transformation (threshold restructuring event, the contact-boundary at greater-cycle scale)
  { role: 'Transformation', dimension: 'Mental', name: 'paradigm-shift', description: 'Cognitive reorganization, worldview dissolution-and-rebuild' },
  { role: 'Transformation', dimension: 'Biological', name: 'metabolic-shift', description: 'Physiological reorganization, developmental milestone, healing crisis' },
  { role: 'Transformation', dimension: 'Social', name: 'social-role-shift', description: 'Identity transition in the social field, coming-of-age, career change' },
  { role: 'Transformation', dimension: 'Collective', name: 'collective-phase-transition', description: 'Civilizational transformation, cultural paradigm shift' },

  // Great Way (operating environment, reservoir, accumulated Potentiator)
  { role: 'GreatWay', dimension: 'Mental', name: 'cognitive-landscape', description: 'The intellectual context the holon operates within' },
  { role: 'GreatWay', dimension: 'Biological', name: 'ecological-context', description: 'The physical environment and its affordances/constraints' },
  { role: 'GreatWay', dimension: 'Social', name: 'social-system', description: 'The institutional and relational system surrounding the holon' },
  { role: 'GreatWay', dimension: 'Collective', name: 'civilizational-field', description: 'The collective-consciousness field, species-level trajectory' },

  // Choice (directional commitment, currency, flows intra→extra at greater-cycle scale)
  { role: 'Choice', dimension: 'Mental', name: 'cognitive-commitment', description: 'Deciding what to think, what to investigate, what to believe' },
  { role: 'Choice', dimension: 'Biological', name: 'somatic-commitment', description: 'Deciding how to live, what to consume, how to move' },
  { role: 'Choice', dimension: 'Social', name: 'relational-commitment', description: 'Deciding who to relate to, how to engage, what to build together' },
  { role: 'Choice', dimension: 'Collective', name: 'collective-commitment', description: 'Deciding what to contribute to the collective, what to carry forward' },
];

/** Look up an archetypal class by role + dimension. */
export function getArchetypalClass(role: ArchetypalRole, dimension: Dimension): ArchetypalClass | undefined {
  return ARCHETYPAL_CLASS_MATRIX.find(c => c.role === role && c.dimension === dimension);
}

/** Get all classes for a given role. */
export function getClassesForRole(role: ArchetypalRole): readonly ArchetypalClass[] {
  return ARCHETYPAL_CLASS_MATRIX.filter(c => c.role === role);
}

/** Get all classes for a given dimension. */
export function getClassesForDimension(dimension: Dimension): readonly ArchetypalClass[] {
  return ARCHETYPAL_CLASS_MATRIX.filter(c => c.dimension === dimension);
}
