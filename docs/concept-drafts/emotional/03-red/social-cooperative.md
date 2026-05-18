# Emotional / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes emotional intelligence through RELATIONAL EMOTIONAL DYNAMICS — can you read another's emotion accurately? Can you maintain your own emotional state alongside theirs? Can you coordinate emotional responses? Can you use emotional intelligence in service of a shared goal?
>
> **Why this axis for Emotional/Red:** At Red, others' emotions are TACTICAL DATA. "He's angry — he'll charge. She's afraid — she'll run." The social-cooperative axis tests whether emotional intelligence can function RELATIONALLY — reading, coordinating, and maintaining sovereignty in the emotional field of others.

---

## 1. Game Identity

- **Title:** "The Wroth-Pack"
- **Core mechanic:** The player reads NPC allies' and enemies' emotional states, coordinates emotional responses with allies, and maintains own emotional sovereignty in the relational emotional field.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Reading Others → Emotional Coordination → Emotional Lending → Sovereignty Under Pressure → The Pack's Heart

---

## 2. Catalyst Delivery

**Catalyst:** Others have emotions. Those emotions AFFECT the player. The game asks: "Can you read them without absorbing them? Can you coordinate without losing yourself? Can you help without drowning?"

**Unconscious response:**
- *Submergent:* Do they absorb (communion dark)? Dominate (agency dark)? Ignore (golden-allergy)? Perform attunement without genuine reading (golden-addiction)?
- *Emergent:* Can they hold their own emotional state while accurately reading another's?

**Integration path:** Rewards ACCURATE EMPATHIC READING + EMOTIONAL SOVEREIGNTY. The player who reads others accurately WITHOUT losing their own centre scores highest.

**Successful integration:** The player reads others' emotions accurately, coordinates emotional responses with allies, and maintains own emotional sovereignty — neither absorbing nor ignoring the relational emotional field.

---

## 3. Game Design

### Setup
The Wroth-Pack: a war-band where emotional intelligence is TACTICAL. Reading allies' emotions = knowing their readiness. Reading enemies' emotions = predicting their moves. The aesthetic: Red-stage war-band, firelit faces, the intensity of reading friend and foe.

### Interaction
- **Reading Others:** NPC displays emotion; player identifies it. Accuracy = tactical advantage.
- **Emotional Coordination:** Player and ally must achieve complementary emotional states (one rages, one stays calm to cover).
- **Emotional Lending:** Player shares emotional energy with struggling ally (costs own resources).
- **Sovereignty Under Pressure:** Ally is intensely emotional; player must maintain own state while reading theirs.
- **The Pack's Heart:** Full multi-ally emotional coordination — read all, coordinate all, maintain sovereignty.

### Feedback
- Accurate reading → "You see them. Their heart is open to your warrior's eye."
- Contagion detected → "Their rage became yours. Can you hold your own fire while reading theirs?"
- Successful coordination → "The pack moves as one heart. Different feelings, shared purpose."
- Sovereignty maintained → "Their storm didn't move you. Your centre holds."

### Difficulty Adaptation
- NPCs: 1 → 2 → 3; Signal clarity: obvious → moderate → subtle
- Coordination complexity: same emotion → complementary → sequential
- Pressure: mild ally-emotion → intense → multiple intense simultaneously

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Reading Others | 1-5 | 1 NPC, obvious emotions, no pressure |
| Emotional Coordination | 5-15 | Complementary states, timing |
| Emotional Lending | 15-30 | Sharing emotional resources |
| Sovereignty Under Pressure | 30-50 | Maintaining own state under relational pressure |
| The Pack's Heart | 50+ | Full multi-ally coordination |

---

## 4. Item Pool Specification

### Item types
- **Reading scenarios:** NPCs displaying emotions at varied clarity levels
- **Coordination challenges:** Complementary emotional state requirements
- **Lending scenarios:** Ally-in-need situations requiring emotional support
- **Pressure scenarios:** Intense relational emotional fields to maintain sovereignty within
- **Pack challenges:** Multi-ally coordination requiring full relational emotional intelligence

### Minimum pool size
- 30+ reading scenarios, 25+ coordination, 20+ lending, 15+ pressure, 10+ pack challenges

### Drive/shadow mapping
- Projection onto calm others → dark-addiction; cannot read clear signals → dark-allergy
- Over-elaborate readings → golden-addiction; cannot read vulnerability → golden-allergy
- Exploitation of distress → Agency dark; contagion → Communion dark

---

## 5. Technical Requirements

### Input types
- Tap-to-select (identify others' emotions); sustained input (maintain own state); coordination timing (synchronise with ally)

### Timing requirements
- Empathic accuracy measured per trial; sovereignty measured continuously during pressure phases

### NPC/AI requirements
- 2-3 ally NPCs with distinct emotional styles; enemy NPCs with readable emotional states
- NPCs must display emotions CONSISTENTLY (player can learn their patterns)
- NPCs must sometimes be INTENSELY emotional (testing sovereignty)

### LLM requirements
- **Medium:** NPC emotional behaviour generation, coordination feedback. Core scoring algorithmic.

### State persistence
- Empathic accuracy per emotion per NPC; sovereignty maintenance rate; coordination quality; contagion patterns; projection patterns; drive/shadow signals; fatigue state; checkpoint position
