# Moral / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes moral intelligence through SPONTANEOUS MORAL BEHAVIOUR in an open game world — not structured dilemmas but free moral engagement in an environment where consequences are real, others are affected, and nobody is asking "what would you do?" How does the player's moral life LIVE when nobody's testing it?
>
> **Why this axis for Moral/Red:** The other 6 modalities probe moral intelligence through structured challenges. This one observes it in the wild. At Red, the player navigates a world of consequences: do they consider consequences spontaneously? Do they exploit when they can? Do they engage reciprocity naturally? Their SPONTANEOUS moral behaviour reveals their genuine moral structure.

---

## 1. Game Identity

- **Title:** "The Bandit-World"
- **Core mechanic:** An open-world Red-stage environment where moral intelligence is assessed through the QUALITY of spontaneous moral engagement — considering consequences without being asked, engaging reciprocity naturally, managing moral reputation through consistent behaviour, and navigating a world where actions have real consequences.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Consequence Awareness → Moral Navigation → Reciprocity Ecology → Reputation Building → The Living Consequence

---

## 2. Catalyst Delivery

**Catalyst:** The world has consequences. Actions affect others. Resources can be taken or traded. Nobody asks "what's the right thing to do?" — the player simply ACTS, and the world responds.

**Unconscious response:**
- *Submergent:* The player's NATURAL moral style surfaces. Do they exploit everything? Freeze at every choice? Perform virtue? Dismiss all moral content? Their ecological behaviour reveals their genuine structure.
- *Emergent:* Can they engage more of the moral world? Consider more consequences? Navigate more complex moral terrain?

**Integration path:** The world rewards moral intelligence NATURALLY. Players who consider consequences avoid traps. Players who engage reciprocity gain allies. Players who build moral reputation gain trust. The reward is POWER (Red-resonant).

**Successful integration:** The player demonstrates moral intelligence SPONTANEOUSLY — considering consequences, engaging reciprocity, building reputation, and navigating moral terrain without being prompted.

---

## 3. Game Design

### Setup
An open Red-stage world where consequences are REAL. Resources can be taken, traded, or shared. NPCs remember. Reputation builds. The world responds to the player's moral pattern. The aesthetic: Red-stage territory — bandit camps, trading posts, contested resources, the moral ecology of power.

### Interaction
- **Free navigation:** Moving through a world where moral choices arise naturally
- **Spontaneous consequence-awareness:** Noticing that actions have consequences without being told
- **Natural reciprocity:** Trading, sharing, and exchanging without structured prompts
- **Reputation building:** Consistent behaviour creating social identity
- **Moral ecology:** Navigating a world where moral intelligence produces advantage

### Feedback
- Natural consequences: moral intelligence → sustainable resources, allies, reputation, power
- Natural consequences: moral blindness → depletion, isolation, distrust, vulnerability
- No explicit "moral score" — the world IS the feedback

### Difficulty Adaptation
- Consequence visibility scales with demonstrated awareness
- Reciprocity opportunities scale with demonstrated engagement
- Moral complexity scales with demonstrated navigation capacity
- Reputation stakes scale with demonstrated consistency

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Consequence Awareness | 1-5 | Obvious consequences; simple world |
| Moral Navigation | 5-15 | Multiple moral paths; trade-offs visible |
| Reciprocity Ecology | 15-30 | Exchange networks; sustainable vs. exploitative |
| Reputation Building | 30-50 | Past choices shape present options |
| The Living Consequence | 50+ | Full moral ecology; all capacities tested spontaneously |

---

## 4. Item Pool

### Item types
- **Resource configurations:** Takeable, tradeable, shareable resources with varied consequences
- **NPC moral profiles:** Characters with varied moral expectations and memory
- **Consequence zones:** Areas with distinct moral dynamics (safe, risky, reciprocal, exploitative)
- **Reputation events:** Situations where past moral behaviour affects present options
- **Moral ecology dynamics:** Sustainable vs. depleting resource systems

### Minimum pool size
- 20+ resource configs, 15+ NPC profiles, 15+ consequence zones, 15+ reputation events, 10+ ecology dynamics

### Drive/shadow mapping
- All-exploitation → dark-addiction; zero moral engagement → dark-allergy
- Indiscriminate giving → golden-addiction; random/indifferent → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap (interact, take, give, trade); hold (examine consequences); swipe (navigate, avoid)

### Timing requirements
- Session-level tracking (moral engagement patterns, exploitation rates, reciprocity balance)
- No millisecond precision needed; minutes-level measurement of moral patterns

### NPC/AI requirements
- NPCs with moral memory (remember past interactions; adjust trust)
- Resource systems with depletion/renewal dynamics
- Reputation system that affects NPC behaviour toward player
- World must have consistent moral ecology across sessions

### LLM requirements
- **High:** World generation, ecological assessment, NPC moral memory, narrative adaptation
- Detects spontaneous moral engagement from behaviour patterns
- Evaluates moral intelligence quality without explicit tasks

### State persistence
- Full world state; NPC moral memory; resource depletion/renewal state; reputation scores; exploitation rate; reciprocity balance; consequence-awareness patterns; moral consistency across sessions; drive/shadow signals; fatigue state; checkpoint position
