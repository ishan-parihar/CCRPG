# Emotional / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes emotional intelligence through SPONTANEOUS EMOTIONAL BEHAVIOUR in an open game world — not structured emotion-tasks but free emotional engagement in an environment that provokes, rewards, and challenges emotional capacity. How does the player's emotional life LIVE when nobody's testing it?
>
> **Why this axis for Emotional/Red:** The other 6 modalities probe emotion through structured challenges. This one observes it in the wild. At Red, the player navigates a world of emotional provocations: do they read others spontaneously? Do they channel emotion naturally? Do they regulate without being asked? Their SPONTANEOUS emotional behaviour reveals their genuine emotional structure.

---

## 1. Game Identity

- **Title:** "The Wroth-World"
- **Core mechanic:** An open-world Red-stage environment where emotional intelligence is assessed through the QUALITY of spontaneous emotional engagement — reading NPCs without being asked, channelling emotion naturally in combat, regulating without prompts, and navigating the emotional landscape of a living world.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Emotional Awareness → Emotional Navigation → Emotional Mastery → Emotional Leadership → The Feeling World

---

## 2. Catalyst Delivery

**Catalyst:** The world itself IS emotionally alive. NPCs have emotions that affect their behaviour. Situations provoke the player's emotions. The emotional landscape shifts. The player is never told "read this emotion" — they must NOTICE, RESPOND, and NAVIGATE spontaneously.

**Unconscious response:**
- *Submergent:* The player's NATURAL emotional style surfaces. Do they notice others' emotions? Do they regulate their own? Do they use emotion strategically? Do they get overwhelmed? Shut down?
- *Emergent:* Can they engage more of the emotional world? Read subtler signals? Navigate more complex emotional terrain?

**Integration path:** The world rewards emotional intelligence NATURALLY. Players who read NPCs gain tactical advantage. Players who regulate gain combat effectiveness. Players who channel gain power. The reward is POWER (Red-resonant).

**Successful integration:** The player demonstrates emotional intelligence SPONTANEOUSLY — reading, channelling, regulating, and navigating without being prompted.

---

## 3. Game Design

### Setup
An open Red-stage world where emotions are ALIVE. NPCs have emotional states that affect their behaviour, availability, and responses. The environment has emotional zones (calm, intense, mixed). Combat is emotionally influenced (reading enemy emotion = tactical advantage). The player navigates freely.

### Interaction
- **Emotional navigation:** Moving through a world where emotional awareness produces advantage
- **NPC emotional reading:** Spontaneously noticing and responding to NPC emotional states
- **Combat emotional channelling:** Using emotion as power in combat encounters
- **Emotional regulation:** Managing own emotional state for optimal performance
- **Relational emotional engagement:** Joining shared emotional experiences with allies

### Feedback
- Natural consequences: emotional intelligence → tactical advantage, better NPC interactions, more power
- Natural consequences: emotional blindness → missed opportunities, worse combat, locked content
- No explicit "emotion score" — the world IS the feedback

### Difficulty Adaptation
- NPC emotional clarity scales with demonstrated reading accuracy
- Provocation intensity scales with demonstrated regulation capacity
- Emotional complexity scales with demonstrated engagement quality
- World emotional density scales with demonstrated navigation capacity

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Emotional Awareness | 1-5 | Obvious NPC emotions; clear provocations; simple navigation |
| Emotional Navigation | 5-15 | Moderate signals; emotional zones; combat channelling |
| Emotional Mastery | 15-30 | Subtle signals; regulation under pressure; complex terrain |
| Emotional Leadership | 30-50 | Multi-NPC reading; group emotional coordination |
| The Feeling World | 50+ | Full emotional ecology; all capacities tested spontaneously |

---

## 4. Item Pool

### Item types
- **NPC emotional configurations:** Characters with varied emotional states and behaviours
- **Environmental emotional zones:** Areas with distinct emotional atmospheres
- **Provocation scenarios:** Situations designed to trigger emotional responses
- **Combat emotional contexts:** Fights where emotional reading/channelling matters
- **Relational emotional opportunities:** Shared emotional experiences available

### Minimum pool size
- 20+ NPC configs, 15+ zones, 25+ provocations, 20+ combat contexts, 15+ relational opportunities

### Drive/shadow mapping
- Escalating intensity → dark-addiction; no emotional engagement → dark-allergy
- Performed without accuracy → golden-addiction; vulnerability-avoidance → golden-allergy
- Provocation response proportionality → Agency; NPC-state correlation → Communion; zone-seeking → Eros; familiar engagement → Agape

---

## 5. Technical Requirements

### Input types
- Tap (interact, read, engage); hold (channel, regulate); swipe (navigate)

### Timing requirements
- Session-level tracking (emotional engagement patterns, regulation patterns)
- No millisecond precision needed; seconds/minutes-level measurement

### NPC/AI requirements
- NPCs with persistent emotional states that affect behaviour
- Emotional states must be READABLE through visual/audio signals
- World must be CONSISTENT across sessions

### LLM requirements
- **High:** World generation, ecological assessment, NPC emotional behaviour, narrative adaptation
- Detects spontaneous emotional engagement from behaviour patterns
- Evaluates emotional intelligence quality without explicit tasks

### State persistence
- Full world state; NPC emotional states; reading accuracy history; channelling patterns; regulation patterns; zone-selection patterns; drive/shadow signals; fatigue state; checkpoint position
