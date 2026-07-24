# curriculum-linter

> Agentic workflow for validating curriculum modules against meta-learning principles,
> holonic structure, depth assessment requirements, and Mysterium engine integration.

## Purpose

Validate that curriculum content is:
1. **Structurally sound** — prerequisites correct, depth progression monotonic, metadata complete
2. **Pedagogically effective** — leverages desirable difficulties, spaced repetition, multiple representations
3. **Developmentally integrated** — exercises claimed developmental lines, maps to correct stages
4. **Epistemically honest** — facts presented as claims with evidence, uncertainty acknowledged

## Architecture: Three-Agent Pipeline

### Agent 1: Curriculum Generator
- **Role:** Creates curriculum content following the holonic structure template
- **Input:** Topic specification (subject, concept, target depth, target lines, prerequisites)
- **Output:** Complete CurriculumHolon with all metadata
- **Constraints:** Must follow the five-phase holonic structure (observation → principle → application → integration → creation)

### Agent 2: Curriculum Critic
- **Role:** Validates generated content against all invariants
- **Input:** Generated module + existing knowledge graph
- **Output:** CurriculumLinterReport (errors, warnings, infos)
- **Checks:**
  - **Structural (A-checks):** Prerequisite completeness, DAG integrity, depth rubric completeness, representation diversity, depth monotonicity
  - **Pedagogical (B-checks):** Elaborative interrogation, transfer tasks, misconception coverage, spacing model, interleaving support, desirable difficulty, multiple modalities
  - **Developmental (C-checks):** Line authenticity, stage appropriateness, drive probe inclusion, shadow detection, metacognitive probes
  - **Epistemic (D-checks):** Evidence-based claims, uncertainty acknowledged, frontier distinction, source attribution

### Agent 3: Curriculum Integrator
- **Role:** Wires validated module into the Mysterium engine
- **Input:** Validated module + existing registry state
- **Output:** Final module with engine hooks wired
- **Validates:** Developmental mapping authenticity, Significator update paths, scheduler compatibility

## Triggers

- "Create a curriculum module for [concept]"
- "Validate the [subject] curriculum"
- "Check if [concept] builds properly on its prerequisites"
- "Refine this module until the Critic passes"

## References

- `docs/foundations/29-meta-learning-science.md` — The 7 principles
- `docs/foundations/30-holonic-curriculum-architecture.md` — The content template
- `docs/foundations/31-depth-assessment-model.md` — Depth differentiation patterns
- `docs/foundations/32-agentic-curriculum-linter.md` — The full linter specification
- `src/core/curriculum/types.ts` — The type definitions

## Iterative Workflow

```
1. Generator creates module
2. Critic validates → produces report
3. If errors exist:
   a. Critic provides specific feedback to Generator
   b. Generator refines the module
   c. Critic re-validates
   d. Repeat until zero errors
4. If warnings exist:
   a. Critic suggests improvements
   b. Generator optionally refines
5. Once Critic passes:
   a. Integrator wires the module into the engine
   b. Module is registered in CurriculumRegistry
```

## Output Format

The Critic produces a `CurriculumLinterReport`:

```typescript
interface CurriculumLinterReport {
  readonly moduleId: string;
  readonly timestamp: number;
  readonly passed: boolean;
  readonly errors: readonly LinterIssue[];
  readonly warnings: readonly LinterIssue[];
  readonly infos: readonly LinterIssue[];
  readonly summary: {
    readonly totalChecks: number;
    readonly passed: number;
    readonly errors: number;
    readonly warnings: number;
    readonly infos: number;
  };
  readonly pedagogicalQuality: number;
  readonly developmentalIntegration: number;
}
```
