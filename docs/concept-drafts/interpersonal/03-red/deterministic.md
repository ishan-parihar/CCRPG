# Interpersonal / Red — Deterministic Game Concept

> **Axis:** The deterministic axis probes interpersonal intelligence through OBJECTIVE, MEASURABLE tasks — intent-reading accuracy, coordination timing, betrayal-detection speed. No LLM interpretation needed; ground truth exists. This provides the baseline against which all other modalities are cross-validated.
>
> **Why this axis for Interpersonal/Red:** At Red, interpersonal intelligence is CONCRETE: "What does this person want? Help me, harm me, or trade with me?" The deterministic axis measures whether the player can accurately read behavioural cues that signal intent, coordinate timed actions with an ally, and detect when an ally's behaviour shifts.

---

## 1. Game Identity

- **Title:** "The Intent-Reader"
- **Core mechanic:** NPCs display behavioural cues (body language, action patterns, resource movements) that signal their intent. The player must read the intent correctly and respond appropriately — ally with helpers, defend against harmers, negotiate with traders.
- **Duration:** 2-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Glance → The Pattern → The Pair → The Shift → The War-Band's Eye

---

## 2. Catalyst Delivery

**Catalyst:** NPCs behave. Their behaviour signals intent. The game asks: "What do they want?" The contact boundary is: "Can you read another agent's intent from their behaviour alone?"

**Unconscious response:**
- *Submergent:* Do they read at all (or project)? Do they read only to manipulate (dark-addiction)? Refuse to read (dark-allergy)? Over-interpret (golden-addiction)?
- *Emergent:* Can they read more agents? Subtler cues? Shifting intents?

**Integration path:** Rewards ACCURATE reading + APPROPRIATE response. Reading correctly but responding manipulatively scores lower on drive-health. Reading correctly and coordinating appropriately scores highest.

**Successful integration:** The player reads 2-3 NPCs' intents accurately from behavioural cues and responds with contextually appropriate action.

---

## 3. Game Design

### Setup
The Intent-Reader: a war-camp where NPCs arrive with intentions. Some want to help (join the war-band). Some want to harm (spies, assassins). Some want to trade (merchants, mercenaries). The player must read their intent from behavioural cues and respond appropriately. The aesthetic: Red-stage war-camp, firelit arrivals, the warlord's judgement seat.

### Interaction
- **The Glance:** Single NPC, single obvious intent. Read and respond. (Checkpoint 1-5)
- **The Pattern:** Single NPC, intent revealed through a 3-action sequence. (Checkpoint 5-15)
- **The Pair:** Two NPCs simultaneously, potentially conflicting intents. (Checkpoint 15-30)
- **The Shift:** NPC whose intent CHANGES mid-interaction (betrayal detection). (Checkpoint 30-50)
- **The War-Band's Eye:** 3 NPCs, shifting intents, coordination required. (Checkpoint 50+)

### Behavioural cues (the "items")
- **Body orientation:** Facing toward (approach) vs. angled away (avoidance/deception)
- **Resource movement:** Offering resources (help) vs. concealing (trade) vs. positioning weapons (harm)
- **Action patterns:** Consistent behaviour (reliable) vs. inconsistent (shifting intent)
- **Proximity patterns:** Approaching openly (help) vs. circling (harm) vs. maintaining distance (trade)
- **Response to player action:** Mirrors (coordination) vs. counters (opposition) vs. ignores (independence)

### Feedback
- Correct reading → "You see their heart. The war-band grows stronger with your eye."
- Incorrect reading → "You misread them. Watch again — what did their body tell you?"
- Exploitative response → "You read them true, but used it as a weapon. Is that all others are to you?"
- Accurate + appropriate → "Read. Responded. The alliance holds. This is the warrior's wisdom."

### Difficulty Adaptation
- Cue clarity: obvious → moderate → subtle → contradictory
- NPC count: 1 → 2 → 3
- Intent stability: fixed → shifting → adversarial
- Response complexity: binary (help/harm) → ternary (help/harm/trade) → nuanced

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Glance | 1-5 | 1 NPC, obvious cues, binary intent |
| The Pattern | 5-15 | 1 NPC, sequential cues, ternary intent |
| The Pair | 15-30 | 2 NPCs, simultaneous reading |
| The Shift | 30-50 | Intent changes; betrayal detection |
| The War-Band's Eye | 50+ | 3 NPCs, shifting, coordination required |

---

## 4. Item Pool

### Item types
- **NPC behavioural profiles:** Defined cue-sets that signal specific intents
- **Intent sequences:** Multi-step behavioural patterns revealing intent over time
- **Shift patterns:** Intent-change sequences (for betrayal detection)
- **Coordination scenarios:** Multi-NPC configurations requiring simultaneous reading

### Minimum pool size
- 40+ single-NPC profiles (varied cue combinations); 25+ intent sequences; 20+ shift patterns; 15+ multi-NPC configurations

### Drive/shadow mapping
- Exploitative response after accurate reading → dark-addiction
- Non-engagement or all-threat projection → dark-allergy
- Over-elaborate reading of simple intent → golden-addiction
- Accurate reading without relationship-building → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (identify intent from options); timed response (coordination); swipe (approach/avoid/negotiate)

### Timing requirements
- Reading speed measured per trial (seconds to correct identification)
- Coordination timing for multi-NPC scenarios (response within window)
- No millisecond precision needed; 0.5-second resolution sufficient

### NPC/AI requirements
- NPCs with defined behavioural profiles (cue-sets mapped to intents)
- NPCs must be CONSISTENT within a session (same cues = same intent)
- Shift-NPCs must have DETECTABLE transition points (not random)

### LLM requirements
- **Low:** NPC description generation, contextual framing. All scoring algorithmic.

### State persistence
- Intent-reading accuracy per cue-type; reading speed history; multi-agent capacity; shift-detection accuracy; response-pattern (exploit vs. coordinate vs. avoid); drive/shadow signals; fatigue state; checkpoint position; NPC relationship history (for loyalty tracking)
