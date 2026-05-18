# Cognitive / Magenta — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes cognitive intelligence through SHARED SYMBOLIC ACTIVITY — can the player engage symbolic thinking WITH others? At Magenta, the "other" is often a fantasy-companion or imagined ally. The question is: can symbolic cognition function in relational space?
>
> **Why this axis for Cognitive/Magenta:** Symbols at Magenta are shared through RITUAL — the first communal imagery. Two beings performing the same gesture, tracing the same rune, holding the same symbol. This modality tests whether cognitive capacity extends to shared symbolic space or remains private.

---

## 1. Game Identity

- **Title:** "The Rune-Sharing"
- **Core mechanic:** The player engages in shared symbolic activity with a companion (NPC or co-player) — matching runes together, coordinating symbol-gestures, building shared symbolic meaning. Cognitive capacity in relational context.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Shared Rune → The Matched Pair → The Coordinated Cast → The Symbol-Gift → The Living Ritual

---

## 2. Catalyst Delivery

**Catalyst:** "Your companion shows you a rune. Can you hold it? Can you show one back? Can you cast together?" The contact boundary is: "Can your symbolic thinking include another?"

**Unconscious response:**
- *Submergent:* How does the player's symbolic capacity function in social context? The Magical Thinker demands the companion accept their symbols. The Concrete-Bound can't share symbols (they're "just shapes"). The Premature Reasoner tries to teach the companion logic. The Wonder-Refuser won't share (sharing makes symbols too real).
- *Emergent:* Can they hold a symbol received from another? Can they coordinate symbolic action?

**Integration path:** Rewards SHARED symbolic engagement — receiving symbols from others, holding them, coordinating symbolic action, and building shared meaning. Not domination, not isolation, not over-teaching, not withdrawal.

**Successful integration:** The player receives, holds, and coordinates symbols with a companion — shared symbolic cognition functioning healthily.

---

## 3. Game Design

### Setup
The Rune-Sharing: a shared symbolic space where player and companion engage in coordinated symbolic activity. The aesthetic: Magenta-stage ritual-circle — two beings around a fire, sharing runes, tracing symbols together, building shared meaning in the flickering light.

### Interaction
- **The Shared Rune (1-5):** Companion shows a rune; player recognises it. Simple shared recognition.
- **The Matched Pair (5-15):** Both hold the same rune simultaneously. Coordinated symbol-holding.
- **The Coordinated Cast (15-30):** Cast together — timing and symbol must match. Shared execution.
- **The Symbol-Gift (30-50):** Exchange runes — give one, receive one. Shared symbolic economy.
- **The Living Ritual (50+):** Full shared symbolic activity — recognition, holding, casting, gifting, all coordinated.

### Feedback
- Successful coordination → "Together, the rune shines brighter. Shared magic is stronger."
- Domination attempt → "They have their own rune. It's different. Both are real."
- No engagement → "They're offering you a symbol. Just look. What do you see?"
- Teaching instead of sharing → "Don't explain. Just do it together. Play."
- Withdrawal → "They're gentle. They just want to share. Whenever you're ready."

### Difficulty Adaptation
- Coordination complexity: recognition → simultaneous holding → timed casting → exchange
- Companion behaviour: predictable → varied → responsive
- Shared task complexity: single rune → paired runes → sequences
- Social demand: passive sharing → active coordination → mutual creation

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Shared Rune | 1-5 | Recognise companion's symbol |
| The Matched Pair | 5-15 | Hold same symbol simultaneously |
| The Coordinated Cast | 15-30 | Timed shared execution |
| The Symbol-Gift | 30-50 | Exchange symbols; shared economy |
| The Living Ritual | 50+ | Full shared symbolic activity |

---

## 4. Item Pool Specification

### Item types
- **Recognition items:** Companion shows symbol; player identifies
- **Coordination items:** Simultaneous symbol-holding tasks
- **Timed casting items:** Shared execution with timing requirements
- **Exchange items:** Give-and-receive symbolic exchanges
- **Ritual sequences:** Multi-step shared symbolic activities

### Minimum pool size
- 25+ recognition, 20+ coordination, 15+ timed, 15+ exchange, 10+ ritual

### Drive/shadow mapping
- Symbol-hoarding/domination → dark-addiction; zero shared engagement → dark-allergy
- Teaching instead of sharing → golden-addiction; withdrawal from shared space → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap (respond to companion's symbol); simultaneous hold (coordinated holding); timed tap (shared casting); drag (symbol exchange)

### Timing requirements
- Coordination timing at ±200ms (generous for Magenta); simultaneous-hold detection; exchange timing tracked

### NPC/AI requirements
- Companion NPC with symbolic behaviour (shows runes, holds symbols, casts, exchanges)
- Companion adapts to player's pace and style
- Companion has own symbol-system (different but compatible)
- Companion responds to player's sharing/hoarding/withdrawal patterns

### LLM requirements
- **Medium:** Companion behaviour, social scenario generation, coordination evaluation. Core timing algorithmic.

### State persistence
- Shared recognition accuracy; coordination quality scores; timing accuracy; exchange quality; engagement rates; domination/hoarding indicators; withdrawal indicators; teaching indicators; drive/shadow signals; companion relationship state; fatigue state; checkpoint position
