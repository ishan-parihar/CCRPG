# Concept Drafts — 64 Modules × 7 Game Modalities

> **Purpose:** First-principles concept designs for every game in the CCRPG assessment ecosystem.
> **Structure:** `{line}/{stage}/` — one directory per module (64 total).
> **Each module contains:** 7 concept-draft files (one per game modality) + 1 shadow-diagnostics file.

---

## Directory Structure

```
concept-drafts/
├── cognitive/
│   ├── 01-infrared/
│   │   ├── deterministic.md
│   │   ├── language-reflective.md
│   │   ├── scenario-choice.md
│   │   ├── embodied-somatic.md
│   │   ├── strategic-planning.md
│   │   ├── social-cooperative.md
│   │   ├── immersive-rpg.md
│   │   └── shadow-diagnostics.md
│   ├── 02-magenta/
│   │   └── ... (same 8 files)
│   └── ... (through 08-white)
├── emotional/
├── moral/
├── intrapersonal/
├── spiritual/
├── somatic/
├── willpower/
└── interpersonal/
```

**Total files when complete:** 64 modules × 8 files = 512 concept documents.

---

## What Each File Must Contain

### Per-modality concept draft (`deterministic.md`, `language-reflective.md`, etc.)

```markdown
# {Line}/{Stage} — {Modality} Game Concept

## 1. Game Identity
- Title (evocative, not clinical)
- Core mechanic (one sentence)
- Duration (seconds/minutes)
- Difficulty parameters (what adapts)

## 2. What It Measures
- Primary dimensions (from foundations/11 §4)
- Drive signals (which drives this game reveals)
- Shadow signals (what addiction/allergy looks like in this game)

## 3. The Game Design
- Setup (what the player sees)
- Interaction (what they do)
- Feedback (what they learn)
- Progression within the game (how difficulty adapts)

## 4. Item Pool Specification
- Item types (stimuli, scenarios, patterns)
- Minimum pool size (≥20)
- Generation rules (how to create more items)

## 5. Scoring Rubric
- Capacity scoring (how performance maps to stage-pass/fail)
- Drive-health scoring (how behaviour reveals drives)
- LLM rubric (if applicable — for qualitative assessment)

## 6. Shadow Integration
- How this game surfaces dark-addiction at this stage
- How this game surfaces dark-allergy at this stage
- How this game surfaces golden-addiction (bypassing toward next stage)
- How this game surfaces golden-allergy (refusing next stage)
- The heal/evolve vector (what healing looks like in this game)
- The evolve/heal vector (what growth looks like in this game)

## 7. Technical Requirements
- Input types (tap, hold, swipe, text, choice)
- Timing requirements (RT measurement, sustained input)
- NPC/AI requirements (for social/cooperative)
- LLM requirements (for language-based)
```

### Shadow diagnostics file (`shadow-diagnostics.md`)

```markdown
# {Line}/{Stage} — Shadow Diagnostics

## 1. The Four Shadows at This Module
- Dark-Addiction: [name, description, detection signals]
- Dark-Allergy: [name, description, detection signals]
- Golden-Addiction: [name, description, detection signals]
- Golden-Allergy: [name, description, detection signals]

## 2. Drive-Health Expressions
- Agency healthy vs. pathological at this (line, stage)
- Communion healthy vs. pathological
- Eros healthy vs. pathological
- Agape healthy vs. pathological

## 3. Atman Project Defenses Active at This Stage
- Which defenses are most common here
- How they manifest in gameplay
- How the game addresses them

## 4. Heal/Evolve Mechanics
- What "healing" looks like at this module
- What "evolving" looks like at this module
- How resolving this module's shadows enables advancement

## 5. Cross-Module Relationships
- Which other modules' shadows reinforce this one
- Which other modules' health dissolves this one
- The compound shadow patterns that involve this module
```

---

## Development Priority

Per `STAGE-ASSESSMENT-ARCHITECTURE.md §13.1`:

| Phase | Modules | Files |
|---|---|---|
| **Phase 1** | Red × all 8 lines | 64 files (8 modules × 8 files) |
| **Phase 2** | Amber + Magenta × all 8 lines | 128 files |
| **Phase 3** | Orange + Green × all 8 lines | 128 files |
| **Phase 4** | Infrared + Turquoise + White × all 8 lines | 192 files |

---

## Reference Documents

- `foundations/10` — The 256-shadow model (4-quadrant: dark/golden × addiction/allergy)
- `foundations/11` — Game modalities (7 types, what each measures)
- `foundations/12` — Drive assessment mechanics (per-module drive probes)
- `foundations/13` — Architecture of consciousness (theoretical substrate)
- `STAGE-ASSESSMENT-ARCHITECTURE.md` — Module contract and composition rules
