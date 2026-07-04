# Somatic / Magenta — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes somatic intelligence through SHARED BODY-EXPERIENCE — can the player engage body-awareness WITH others? At Magenta, shared somatic experience is RHYTHMIC and PROXIMAL: moving together, breathing together, sharing body-space. The first communal body.
>
> **Why this axis for Somatic/Magenta:** The body at Magenta is not yet isolated (Red) or disciplined (Amber) — it exists in a field of shared feeling-tone. This modality tests whether somatic intelligence extends to relational space: shared rhythm, coordinated movement, body-proximity awareness.

---

## 1. Game Identity

- **Title:** "The Body-Circle"
- **Core mechanic:** The player engages in shared somatic activity with a companion — moving in rhythm together, holding postures together, sensing each other's body-states, and coordinating body-actions. Somatic intelligence in relational space.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Shared Beat → The Matched Hold → The Body-Sense-Other → The Coordinated Move → The Living Circle

---

## 2. Catalyst Delivery

**Catalyst:** "Your companion moves. Can you move with them? Can you feel their rhythm? Can you hold together?" The contact boundary is: "Can your body be WITH another body?"

**Unconscious response:**
- *Submergent:* How does the player's body relate to another? The Body-Magician demands the other match their rhythm. The Disembodied can't sense the other's body. The Premature Athlete competes. The Sensation-Refuser withdraws from body-proximity.
- *Emergent:* Can they synchronise? Can they sense the other? Can they coordinate without losing themselves?

**Integration path:** Rewards SHARED SOMATIC ENGAGEMENT — synchronising with another while maintaining own body-sense. Not domination, not absence, not competition, not withdrawal.

**Successful integration:** The player moves with a companion — synchronised, aware of both bodies, coordinated without fusion or isolation.

---

## 3. Game Design

### Setup
The Body-Circle: a shared somatic space where player and companion move together. The aesthetic: Magenta-stage ritual-circle — two body-outlines moving in rhythm, glowing when synchronised, dimming when disconnected. The first communal body-experience.

### Interaction
- **The Shared Beat (1-5):** Tap in rhythm with companion. Simple synchronisation.
- **The Matched Hold (5-15):** Hold the same posture simultaneously. Shared stability.
- **The Body-Sense-Other (15-30):** Sense companion's body-state. "Are they tense or relaxed?"
- **The Coordinated Move (30-50):** Move together — transitions synchronised.
- **The Living Circle (50+):** Full shared somatic engagement — rhythm, hold, sense, coordinate.

### Feedback
- Synchronised → "Together. Your bodies speak the same language. The circle glows."
- Dominating → "You're leading too hard. Let them move. Match, don't force."
- Disconnected → "They're moving. Can you feel it? Just one beat together."
- Competing → "Not faster. Together. The same speed. The same force."
- Withdrawing → "They're gentle. Safe. Just one movement together. From wherever you are."

### Difficulty Adaptation
- Synchronisation precision: generous (±500ms) → moderate (±200ms) → tight (±100ms)
- Shared task complexity: single beat → hold → sense → coordinate
- Proximity demand: distant → moderate → close
- Companion variability: predictable → varied → responsive

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Shared Beat | 1-5 | Simple rhythm synchronisation |
| The Matched Hold | 5-15 | Simultaneous posture holding |
| The Body-Sense-Other | 15-30 | Sensing companion's body-state |
| The Coordinated Move | 30-50 | Synchronised transitions |
| The Living Circle | 50+ | Full shared somatic engagement |

---

## 4. Item Pool

### Item types
- **Rhythm synchronisation items:** Shared beats at various tempos
- **Matched hold items:** Simultaneous postures at various durations
- **Body-sensing items:** Companion state-identification tasks
- **Coordinated movement items:** Synchronised transitions
- **Full circle items:** Combined rhythm + hold + sense + coordinate

### Minimum pool size
- 25+ rhythm, 20+ hold, 15+ sensing, 15+ coordinated, 10+ full

### Drive/shadow mapping
- Forces own rhythm → dark-addiction; zero synchronisation → dark-allergy
- Competes → golden-addiction; withdraws from proximity → golden-allergy

---

## 5. Technical Requirements

### Input types
- Timed tap (shared rhythm); sustained touch (matched hold); tap-to-select (body-sensing reports); coordinated input (synchronised transitions)

### Timing requirements
- Synchronisation at ±16ms measurement precision; hold matching continuous; coordination timing tracked

### NPC/AI requirements
- Companion NPC with body-behaviour (moves, holds, breathes, has states)
- Companion adapts to player's pace
- Companion has own body-states that player can sense
- Companion responds to player's synchronisation/domination/withdrawal

### LLM requirements
- **Medium:** Companion behaviour, social scenario generation. Core synchronisation scoring algorithmic.

### State persistence
- Synchronisation accuracy history; matched hold quality; other-body-sensing accuracy; coordination smoothness; engagement rates; domination indicators; disconnection indicators; competition indicators; withdrawal indicators; drive/shadow signals; companion relationship state; fatigue state; checkpoint position
