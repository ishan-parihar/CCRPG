# Cognitive / Magenta — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes cognitive intelligence THROUGH THE BODY — does the body participate in symbolic thinking? At Magenta, symbols are GESTURAL: the first spell is a hand-movement, the first rune is traced in the air. The body MAKES the symbol before the mind holds it abstractly.
>
> **Why this axis for Cognitive/Magenta:** At Magenta, cognition is not yet disembodied. Symbols live in gesture, posture, and movement. The body is the first symbol-maker. This modality tests whether symbolic capacity has somatic grounding — can the body produce, hold, and recognise symbols?

---

## 1. Game Identity

- **Title:** "The Gesture-Caster"
- **Core mechanic:** The player produces symbolic gestures (trace runes, hold postures, perform ritual movements) and the game measures whether the body can produce, hold, and recognise symbols. Gesture as the somatic foundation of symbolic thought.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Gesture → The Held Shape → The Traced Rune → The Gesture-Echo → The Living Spell

---

## 2. Catalyst Delivery

**Catalyst:** "Draw the rune in the air. Hold the shape. Your body knows the symbol before your mind does." The contact boundary is: "Can your body make and hold symbols?"

**Unconscious response:**
- *Submergent:* Does the body participate in symbolic life? The Magical Thinker performs elaborate rituals (body as magical instrument). The Concrete-Bound moves without symbolic intent (just physical). The Premature Reasoner skips gesture ("I don't need to move, I can just think it"). The Wonder-Refuser's body freezes at symbolic gesture.
- *Emergent:* Can the body produce accurate symbols? Can gesture become spell?

**Integration path:** Rewards ACCURATE gestural symbol-production — the body traces the rune correctly, holds the shape stably, and produces the symbol on demand. Not ritual performance, not random movement, not avoidance.

**Successful integration:** The player's body produces symbols accurately, holds symbolic shapes stably, and demonstrates that gesture IS cognition at Magenta.

---

## 3. Game Design

### Setup
The Gesture-Caster: a somatic-symbolic space where the body produces magic. The player traces runes, holds shapes, and casts through gesture. The aesthetic: Magenta-stage cave-painting — the player's hand leaves glowing traces in the air, each trace a symbol, each symbol a spell.

### Interaction
- **The First Gesture (1-5):** Copy a simple shape. The hand traces; the world responds. Pure gesture-symbol connection.
- **The Held Shape (5-15):** Hold a gesture-shape for a duration. The body must sustain the symbol.
- **The Traced Rune (15-30):** Trace a specific rune accurately. Precision matters.
- **The Gesture-Echo (30-50):** Reproduce a gesture from memory (gestural n=1). See it, then produce it.
- **The Living Spell (50+):** Full gestural-symbolic integration — produce, hold, recall, and cast through body.

### Feedback
- Accurate gesture → The trace glows; the spell activates. "Your body spoke the rune."
- Over-elaborate → "Too much. The rune is simpler than your ritual. Just the shape."
- Random movement → "Your hand moved, but it didn't say anything. Watch the shape. Try again."
- Frozen → "Your hand knows. Let it move. Just a little. Any direction."

### Difficulty Adaptation
- Shape complexity: line → curve → angle → compound → rune
- Hold duration: 1s → 2s → 3s → 5s
- Accuracy demand: approximate → close → precise
- Memory demand: immediate copy → 1s delay → 3s delay → 5s delay

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Gesture | 1-5 | Copy simple shapes; any approximation accepted |
| The Held Shape | 5-15 | Sustain gesture-shapes for duration |
| The Traced Rune | 15-30 | Accurate rune-tracing; precision matters |
| The Gesture-Echo | 30-50 | Reproduce from memory; gestural n=1 |
| The Living Spell | 50+ | Full gestural-symbolic integration |

---

## 4. Item Pool Specification

### Item types
- **Copy gestures:** Shapes to reproduce immediately
- **Hold gestures:** Shapes to sustain for duration
- **Precision traces:** Runes requiring accurate reproduction
- **Memory gestures:** Shapes to reproduce after delay (gestural n=1)
- **Compound gestures:** Multi-part symbolic movements

### Minimum pool size
- 25+ copy, 20+ hold, 20+ precision, 15+ memory, 10+ compound

### Drive/shadow mapping
- Over-elaborate ritual → dark-addiction; random movement → dark-allergy
- Gesture-avoidance → golden-addiction; freeze/approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Touch-trace (draw on screen); gyroscope/accelerometer (gesture in air); hold-position (sustained touch); swipe-patterns (directional gesture)

### Timing requirements
- Trace capture at ≥60Hz; hold measurement continuous; memory-delay precision at ±100ms

### NPC/AI requirements
- None. Pure player-vs-task. Environmental response to gestures (glowing traces, spell effects).

### LLM requirements
- **Low:** Feedback text generation; contextual framing. Core gestural measurement entirely algorithmic (shape-matching algorithms, DTW for gesture comparison).

### State persistence
- Gestural accuracy history; hold-stability scores; gestural memory (delay tolerance); efficiency metrics (ritual-addition detection); spontaneity indicators; shadow signals; drive indicators; fatigue state; checkpoint position
