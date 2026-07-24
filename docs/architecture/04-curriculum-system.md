# Curriculum System Architecture

## 1. Purpose

Describes the holonic curriculum system — a complete education replacement with 5-level knowledge hierarchy, 6-level depth assessment, spaced repetition, cross-domain isomorphisms, and research pipeline. This system transforms Mysterium from an assessment tool into a self-contained educational practice.

## 2. Scientific basis

- **Holonic curriculum** — Foundations/30: 5-level hierarchy (Program → Course → Module → Concept → Atom)
- **Depth assessment** — Foundations/31: 6-level spectrum (Foundational → Contextual → Applied → Analytical → Evaluative → Transformative)
- **Spaced repetition** — Foundations/29: Ebbinghaus forgetting curves applied to concept retention
- **Meta-learning science** — Foundations/29: desirable difficulties, interleaving, testing effect

## 3. Game-design mapping

### 5-Level Holarchy

```
Program (e.g., "Cognitive Development")
  └── Course (e.g., "Working Memory Mastery")
        └── Module (e.g., "N-Back Progression")
              └── Concept (e.g., "Sequential Storage")
                    └── Atom (e.g., "2-Back Task")
```

Each level is a holon — whole at its own level, part of a larger whole.

### 6-Level Depth Spectrum

| Level | Name | What it measures |
|---|---|---|
| 1 | Foundational | Can the player recall facts? |
| 2 | Contextual | Can the player apply in context? |
| 3 | Applied | Can the player use in novel situations? |
| 4 | Analytical | Can the player break down and examine? |
| 5 | Evaluative | Can the player judge and critique? |
| 6 | Transformative | Can the player create new understanding? |

### Spaced Repetition Engine

`CurriculumEngine.scheduleReview()`:
- Tracks retention probability per concept per player
- Schedules reviews when retention drops below 0.7
- Adjusts interval based on difficulty and depth level
- Integrates with encounter scheduler for natural curriculum delivery

### Cross-Domain Isomorphisms

The curriculum maps structural similarities between domains:
- Feedback loops in ecology ≈ feedback loops in psychology
- Musical harmony ≈ mathematical ratios
- Biological homeostasis ≈ social equilibrium

Isomorphisms enable transfer learning — mastery in one domain accelerates mastery in structurally similar domains.

### Curriculum Linter

Three-agent validation workflow:
1. **Generator** — creates curriculum content
2. **Critic** — validates against rubric (depth accuracy, prerequisite chains, assessment alignment)
3. **Integrator** — merges validated content into the knowledge graph

## 4. Architectural contract

- `src/core/curriculum/CurriculumEngine.ts` — scheduling and progression
- `src/core/curriculum/CurriculumLinter.ts` — three-agent validation
- `src/core/curriculum/LearningAnalytics.ts` — retention tracking
- `src/core/curriculum/AdaptiveDifficulty.ts` — depth-aware difficulty
- `src/core/curriculum/data/` — curriculum seed data (CS, Math, Physics foundations)

## 5. Open questions

- **Graduation depth** — when does a player "complete" the curriculum? The 5-level holarchy scales to ~850 holons.
- **Research pipeline** — the curriculum promises a path through Ph.D.-level content. How deep does it actually go?
- **Curriculum-encounter integration** — how do curriculum concepts surface naturally in encounters?

## 6. Principles served

Principles **2, 4, 8** — validity, earned progression, curriculum as education replacement.
