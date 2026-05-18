# Cognitive / Magenta — Deterministic Game Concept

> **Axis:** The deterministic axis provides OBJECTIVE measurement of cognitive capacity — no LLM interpretation, no subjective scoring. Pure psychometric signal. At Magenta, this means: can the player hold one symbol in mind, recognise its return, and inhibit response to non-targets?
>
> **Why this axis for Cognitive/Magenta:** This is the GROUND TRUTH for the module. All other modalities cross-validate against deterministic. If the player can't pass n=1 here, their performance elsewhere is either procedural (body-memory) or performed (golden-addiction).

---

## 1. Game Identity

- **Title:** "The Glimmer-Catcher"
- **Core mechanic:** Rune-symbols flash; the player must recognise when a symbol RETURNS (n=1 echo detection), match symbols to their referents, and inhibit response to distractors. Pure symbolic working-memory measurement wrapped in magical aesthetics.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Rune → The Echo → The Substitution → The Pattern → The Living Symbol

---

## 2. Catalyst Delivery

**Catalyst:** "A rune flashes in the dark. Remember it. When it returns, catch it. When something else appears, let it pass." The contact boundary is: "Can you hold a symbol in mind?"

**Unconscious response:**
- *Submergent:* Does the player engage symbolically at all? Do they confuse symbols with reality (dark-addiction)? Refuse to engage (dark-allergy)?
- *Emergent:* Can they hold the symbol cleanly? Do they rush to hold two (golden-addiction)? Fear the symbol's return (golden-allergy)?

**Integration path:** Rewards ACCURATE symbol-holding — not magical attribution, not avoidance, not premature advancement. The rune is a tool. Hold it. Use it. Let it go.

**Successful integration:** The player holds one symbol stably, recognises its return accurately, inhibits on non-targets, and uses symbols as representations (not magical forces).

---

## 3. Game Design

### Setup
The Glimmer-Catcher: rune-symbols appear in a magical space (painted cave, totem circle, dream-ground). The player catches returning runes and lets non-targets pass. The aesthetic: Magenta-stage wonder — glowing symbols in darkness, each one alive and meaningful.

### Interaction
- **The First Rune (1-5):** Single symbol presented; player taps when it appears among blanks. Pure recognition.
- **The Echo (5-15):** Symbol appears, disappears, reappears among distractors. n=1 echo detection.
- **The Substitution (15-30):** Symbol appears; player must USE it (tap the thing it represents, not the symbol itself). Symbol-as-tool.
- **The Pattern (30-50):** Symbol returns across longer sequences; player must recognise return despite intervening items.
- **The Living Symbol (50+):** Full n=1 mastery — hold, recognise, substitute, inhibit, all integrated.

### Feedback
- Accurate catch → The rune glows; the world responds. "You remembered. The symbol lives in you."
- False alarm → The rune fades. "That wasn't yours. Let it pass."
- Miss → The rune dims. "It returned, but you didn't see it. Watch again."
- Magical-thinking detected → "The rune is a tool, not a force. Hold it gently."

### Difficulty Adaptation
- Distractor similarity: very different → similar → near-identical
- Inter-stimulus interval: long (3s) → medium (2s) → short (1.2s)
- Sequence length: 3 items → 5 → 8 → 12
- Symbol complexity: simple geometric → complex rune → abstract glyph

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Rune | 1-5 | Single symbol recognition; no distractors |
| The Echo | 5-15 | n=1 with distractors; echo detection |
| The Substitution | 15-30 | Symbol-as-tool; use not just recognise |
| The Pattern | 30-50 | Longer sequences; sustained n=1 |
| The Living Symbol | 50+ | Full integrated n=1 mastery |

---

## 4. Item Pool Specification

### Item types
- **Target symbols:** Runes/glyphs the player must track (varied complexity)
- **Distractor symbols:** Non-target runes (varied similarity to target)
- **Substitution targets:** Objects/actions the symbol represents
- **Sequence configurations:** Varied lengths and distractor densities

### Minimum pool size
- 30+ target symbols, 50+ distractors, 20+ substitution mappings, 25+ sequence configurations

### Drive/shadow mapping
- Magical attribution → dark-addiction; zero engagement → dark-allergy
- Premature n=2 attempts → golden-addiction; approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap (respond to target); withhold (inhibit on non-target); drag (substitution tasks)

### Timing requirements
- Stimulus presentation: 60Hz minimum; response window: 100-3000ms; latency measurement at ±16ms precision

### NPC/AI requirements
- None. Pure player-vs-task. Environmental aesthetics only.

### LLM requirements
- **Low:** Feedback text generation; contextual framing. Core psychometrics entirely algorithmic.

### State persistence
- d-prime history; hit/false-alarm rates per session; response latency distributions; consistency metrics; shadow signals (magical-attribution, avoidance, premature-advancement, approach-withdrawal); drive/shadow indicators; fatigue state; checkpoint position; item difficulty calibrations
