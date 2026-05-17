# Concept Drafts — 64 Modules × 7 Game Modalities

> **Purpose:** First-principles concept designs for every game in the CCRPG assessment ecosystem. Each game is a self-contained developmental catalyst that implicitly diagnoses AND progressively heals/evolves the player across all drives and shadow-polarities for its line×stage module.
> **Structure:** `{line}/{stage}/` — one directory per module (64 total).
> **Each module contains:** 7 concept-draft files (one per game modality) + 1 shadow-diagnostics file + 1 scoring skeleton.

---

## Directory Structure

```
concept-drafts/
├── cognitive/
│   ├── 01-infrared/
│   │   ├── scoring.md
│   │   ├── shadow-diagnostics.md
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

**Total files when complete:** 64 modules × 9 files = 576 concept documents.

---

## The Core Requirement: Game as Developmental Catalyst

Every game in this system follows the catalyst→experience→integration flow:

```
CATALYST: The game presents a challenge at the player's contact boundary
  → DRIVES ACTIVATE: All 4 drives respond (healthy or pathological, in dark and golden domains)
    → SHADOWS SURFACE: The dominant pathology pattern becomes visible through behaviour
      → EXPERIENCE: The player processes the catalyst through their current structure
        → INTEGRATION: The game's progression mechanics guide toward healthy drive expression
          → HEALING (dark shadows integrate) / EVOLUTION (golden shadows dissolve)
```

Each game must be:
- **Self-contained:** Playable independently with its own internal progression
- **All-inclusive:** Probes ALL 4 drives × BOTH domains (dark/golden) × ALL 4 shadow quadrants
- **Progressive:** Moves from diagnosis → healing → evolution within a single play session
- **Dual-vector:** Supports heal/evolve (Agape+Agency integrating dark) AND evolve/heal (Eros+Communion dissolving golden)
- **Holonically aware:** Keeps lower-stage capacities healthy while enabling upper-stage growth

---

## What Each File Must Contain

### Per-modality concept draft (`deterministic.md`, `language-reflective.md`, etc.)

```markdown
# {Line}/{Stage} — {Modality} Game Concept

## 1. Game Identity
- Title (evocative, not clinical)
- Core mechanic (one sentence)
- Duration (seconds/minutes per session)
- Internal progression stages (how the game deepens across sessions)

## 2. The Catalyst→Experience→Integration Flow
- What catalyst does this game present at the contact boundary?
- How does the player's unconscious respond? (submergent and emergent)
- How does the game guide from experience toward integration?
- What does successful integration look like within this game?

## 3. Drive Probing (All 4 × Both Domains)
- Agency dark-domain: [how the game creates context for sovereign vs. dominating]
- Agency golden-domain: [how the game creates context for individuating at the edge]
- Communion dark-domain: [how the game creates context for sharing vs. fusing]
- Communion golden-domain: [how the game creates context for joining at the new level]
- Eros dark-domain: [how the game creates context for resting vs. compulsive growth]
- Eros golden-domain: [how the game creates context for reaching vs. bypassing]
- Agape dark-domain: [how the game creates context for returning vs. regressing]
- Agape golden-domain: [how the game creates context for embodying vs. staying abstract]

## 4. Shadow Surfacing (All 4 Quadrants)
- Dark-Addiction: [what clinging/fixation looks like in this game; detection signals]
- Dark-Allergy: [what avoidance/aversion looks like in this game; detection signals]
- Golden-Addiction: [what bypassing/rushing looks like in this game; detection signals]
- Golden-Allergy: [what refusal/terror looks like in this game; detection signals]

## 5. Healing/Evolution Mechanics
- Heal/Evolve vector: How does this game use Agape+Agency to integrate dark shadows?
  - What does the game present when dark-addiction is detected?
  - What does the game present when dark-allergy is detected?
  - What does successful dark-shadow integration look like in gameplay?
- Evolve/Heal vector: How does this game use Eros+Communion to dissolve golden shadows?
  - What does the game present when golden-addiction is detected?
  - What does the game present when golden-allergy is detected?
  - What does successful golden-shadow dissolution look like in gameplay?
- How does healing at this stage maintain lower-stage health?
- How does evolution at this stage prepare for upper-stage growth?

## 6. Game Design
- Setup (what the player sees)
- Interaction (what they do)
- Feedback (what they learn — implicit, not clinical)
- Difficulty adaptation (how the game meets the player where they are)
- Internal progression (how the game deepens across repeated sessions)

## 7. Item Pool Specification
- Item types (stimuli, scenarios, patterns)
- Minimum pool size (≥20 per shadow quadrant)
- Generation rules (how to create more items)
- How items map to drives and shadow quadrants

## 8. Scoring Rubric
- Capacity scoring (stage-pass/fail)
- Drive-health scoring (all 4 drives × both domains)
- Shadow-state scoring (which quadrant is dominant)
- Integration scoring (is the player healing/evolving through play?)
- LLM rubric (if applicable — for qualitative assessment)

## 9. Technical Requirements
- Input types (tap, hold, swipe, text, choice)
- Timing requirements (RT measurement, sustained input)
- NPC/AI requirements (for social/cooperative)
- LLM requirements (for language-based)
- State persistence (what carries across sessions)
```

### Shadow diagnostics file (`shadow-diagnostics.md`)

```markdown
# {Line}/{Stage} — Shadow Diagnostics

## 1. The Four Shadow Archetypes at This Module

### Dark-Addiction: [Named Archetype]
- Description: What fixation/clinging looks like at this line×stage
- Which drives are pathological: [specify which drives contribute and how]
- Detection signals in gameplay
- What the player is unconsciously avoiding by clinging

### Dark-Allergy: [Named Archetype]
- Description: What avoidance/aversion looks like at this line×stage
- Which drives are pathological: [specify which drives contribute and how]
- Detection signals in gameplay
- What the player is unconsciously rejecting

### Golden-Addiction: [Named Archetype]
- Description: What bypassing/premature transcendence looks like at this line×stage
- Which drives are pathological: [specify which drives contribute and how]
- Detection signals in gameplay
- What the player is unconsciously avoiding by rushing upward

### Golden-Allergy: [Named Archetype]
- Description: What terror of transcendence looks like at this line×stage
- Which drives are pathological: [specify which drives contribute and how]
- Detection signals in gameplay
- What the player is unconsciously refusing

## 2. Full Drive-Health Landscape (4 Drives × 2 Domains)

| Drive | Healthy (dark domain) | Pathological (dark domain) | Healthy (golden domain) | Pathological (golden domain) |
|---|---|---|---|---|
| Agency | [specific to this line×stage] | [specific] | [specific] | [specific] |
| Communion | [specific] | [specific] | [specific] | [specific] |
| Eros | [specific] | [specific] | [specific] | [specific] |
| Agape | [specific] | [specific] | [specific] | [specific] |

## 3. Atman Project Defenses Active at This Module
- Which defenses are most common at this line×stage
- How they manifest in gameplay behaviour
- How the games circumvent them (working WITH the contact boundary)

## 4. The Catalyst→Experience→Integration Map
- What catalyst does this module's contact boundary naturally seek?
- How does the submergent unconscious respond to this catalyst?
- How does the emergent unconscious respond to this catalyst?
- What does successful integration look like at this module?

## 5. Heal/Evolve Mechanics
- Heal/Evolve (bottom-up): How Agape + Agency integrate dark shadows at this module
- Evolve/Heal (top-down): How Eros + Communion dissolve golden shadows at this module
- What "healed" looks like — the integration criteria
- How resolving this module's shadows enables advancement

## 6. Cross-Module Relationships
- Which other modules' shadows reinforce this one (compound shadows)
- Which other modules' health dissolves this one
- How this module's health supports the holon above
- How this module's health depends on the holon below

## 7. Lower-Stage Maintenance
- How this module remains relevant when the player advances beyond it
- What "shadow-mode" looks like for this module (testing drive-health, not capacity)
- When the system should present this module as a holonic return encounter
```

---

## Development Priority

| Phase | Modules | Files |
|---|---|---|
| **Phase 1** | Red × all 8 lines | 64 files (8 modules × 8 files) |
| **Phase 2** | Amber + Magenta × all 8 lines | 128 files |
| **Phase 3** | Orange + Green × all 8 lines | 128 files |
| **Phase 4** | Infrared + Turquoise + White × all 8 lines | 192 files |

---

## Reference Documents

- `foundations/10` — The 4-quadrant shadow model (addiction/allergy × dark/golden), all 4 drives × both domains
- `foundations/11` — Game modalities (7 types, what each measures)
- `foundations/12` — Drive assessment mechanics (dual-domain probes, golden-domain probes)
- `foundations/13` — Architecture of consciousness (theoretical substrate: 5-layer topography, contact boundary, Matrix/Potentiator)
- `foundations/14` — Game as developmental catalyst (catalyst→experience→integration mechanics)
- `STAGE-ASSESSMENT-ARCHITECTURE.md` — Module contract and composition rules
