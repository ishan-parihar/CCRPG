# Moral / Magenta — Deterministic Game Concept

> **Axis:** The deterministic axis probes moral intelligence through OBJECTIVE MEASUREMENT — can the player detect sacred weight? At Magenta, this is: "Does this object/action carry taboo? Is this sacred or ordinary?" Binary moral detection without reasoning — pure sensing.
>
> **Why this axis for Moral/Magenta:** Before moral reasoning (Red+), there must be moral SENSING — the felt detection that something carries sacred weight. This modality tests whether the player can detect taboo/sacred markers objectively, like a moral Geiger counter.

---

## 1. Game Identity

- **Title:** "The Sacred-Sense"
- **Core mechanic:** Objects and actions are presented. The player must detect which carry sacred weight and which are ordinary. Not WHY they're sacred — just WHETHER they are. Pure taboo-detection. The moral Geiger counter.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Taboo → The Sacred Object → The Weighted Action → The Hidden Sacred → The Living Taboo

---

## 2. Catalyst Delivery

**Catalyst:** "Some things are sacred. Some are ordinary. Can you tell which is which? Not why — just which. Feel it. Which one carries weight?" The contact boundary is: "Can you detect moral weight?"

**Unconscious response:**
- *Submergent:* How does the player detect sacred weight? The Taboo-Slave marks EVERYTHING sacred. The Profane-Breaker marks NOTHING sacred. The Premature Rule-Maker applies rules ("it LOOKS sacred because X"). The Ritual-Refuser detects correctly but doesn't engage.
- *Emergent:* Can they accurately detect sacred weight — neither over-sensing nor under-sensing?

**Integration path:** Rewards ACCURATE SACRED DETECTION — correctly identifying which items/actions carry moral weight. Not everything-sacred, not nothing-sacred, not rule-based, not disengaged.

**Successful integration:** The player reliably detects sacred weight — the foundation of all moral sensing.

---

## 3. Game Design

### Setup
The Sacred-Sense: a moral detection space. Objects and actions are presented. Some carry sacred weight; some are ordinary. The player's task: detect which is which. The aesthetic: Magenta-stage altar — objects glow faintly when sacred; the player must sense the glow.

### Interaction
- **The First Taboo (1-5):** Two objects → "Which is sacred?" Binary choice, high contrast.
- **The Sacred Object (5-15):** Multiple objects → identify all sacred ones. Moderate contrast.
- **The Weighted Action (15-30):** Actions (not just objects) → "Which action carries weight?"
- **The Hidden Sacred (30-50):** Reduced visual cues → detect from felt-sense alone.
- **The Living Taboo (50+):** Full sacred detection: objects + actions + hidden + novel.

### Feedback
- Accurate detection → "You felt it! That one carries weight. Your sensing is true."
- Over-detection → "Not that one. Just ordinary. Feel the difference. Not everything is sacred."
- Under-detection → "That one! Feel it again. Something there. Weight. It matters."
- Rule-based → "Not because it looks that way. FEEL it. Close your eyes. Which has weight?"
- Disengaged → "You felt it. You knew. That matters. Your sensing means something."

### Difficulty Adaptation
- Sacred/profane contrast: high (obvious) → moderate → subtle
- Item complexity: objects → actions → situations
- Cue availability: visual + felt → felt only
- Ambiguity: clear sacred/profane → ambiguous items
- Novel content: familiar sacred markers → unfamiliar sacred weight

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Taboo | 1-5 | Binary sacred/profane (high contrast) |
| The Sacred Object | 5-15 | Multiple items, moderate contrast |
| The Weighted Action | 15-30 | Actions carry moral weight |
| The Hidden Sacred | 30-50 | Reduced cues; felt-sense detection |
| The Living Taboo | 50+ | Full sacred detection integration |

---

## 4. Item Pool Specification

### Item types
- **High-contrast sacred:** Obviously sacred objects (altar items, ritual objects)
- **High-contrast profane:** Obviously ordinary objects (rocks, sticks)
- **Moderate sacred:** Sacred but less obvious (worn ritual items, quiet sacred spaces)
- **Ambiguous items:** Could be sacred or profane depending on context
- **Sacred actions:** Actions that carry moral weight (giving, taking, breaking, honouring)

### Minimum pool size
- 25+ high-contrast sacred, 25+ high-contrast profane, 20+ moderate, 15+ ambiguous, 15+ actions

### Drive/shadow mapping
- Over-detection (all sacred) → dark-addiction; under-detection (all profane) → dark-allergy
- Rule-based detection → golden-addiction; accurate but disengaged → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-classify (sacred/profane); drag-to-sort (sacred pile / profane pile); hold (sustain sensing)

### Timing requirements
- Response latency tracked (hesitation = data); no time pressure; detection confidence measured

### NPC/AI requirements
- Item generation system (sacred/profane with varying contrast)
- Sacred-weight system (items carry measurable sacred markers)
- Difficulty adaptation (contrast, cue availability, novelty)

### LLM requirements
- **Low:** Primarily algorithmic classification scoring. LLM for felt-sense language evaluation and novel item generation.

### State persistence
- Detection accuracy rates; discrimination quality; felt-sense indicators; ambiguity tolerance; engagement quality; over-detection rates; under-detection rates; rule-based indicators; disengagement indicators; drive/shadow signals; fatigue state; checkpoint position
