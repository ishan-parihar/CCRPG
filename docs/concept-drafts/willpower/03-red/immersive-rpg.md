# Willpower / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes willpower through SPONTANEOUS VOLITIONAL BEHAVIOUR in an open game world — not structured will-tasks but free goal-setting and goal-pursuit in an environment that demands commitment. How does the player's will LIVE when nobody's testing it?
>
> **Why this axis for Willpower/Red:** The other 6 modalities probe will through structured challenges. This one observes it in the wild. At Red, the player navigates a world of opportunities and threats: do they set goals? Do they follow through? Do they rest? Do they persist? Their SPONTANEOUS volitional behaviour reveals their genuine will-structure.

---

## 1. Game Identity

- **Title:** "The Dominion of Vows"
- **Core mechanic:** An open-world Red-stage environment where the player freely sets goals, pursues them, rests, and navigates — with volitional capacity assessed through the QUALITY of their spontaneous goal-setting and goal-keeping rather than through explicit will-tasks.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Territory Claiming → Goal Pursuit → Vow Management → Sustained Campaigns → The Will's World

---

## 2. Catalyst Delivery

**Catalyst:** The world itself IS the catalyst. It presents opportunities that require commitment: territories to claim (requires holding), enemies to defeat (requires sustained effort), resources to gather (requires delayed gratification). The player is never told "this is a will test" — they're just LIVING in the world.

**Unconscious response:**
- *Submergent:* The player's NATURAL volitional style surfaces without test-anxiety. Do they set goals spontaneously? Do they follow through? Do they rest wisely? Do they over-commit? Under-commit?
- *Emergent:* The pull toward deeper volitional engagement — can they commit to harder goals? Hold longer campaigns?

**Integration path:** The world rewards volitional engagement NATURALLY. Players who set and keep goals gain territory. Players who rest wisely fight stronger. Players who persist through difficulty unlock deeper content. The reward is POWER (Red-resonant).

**Successful integration:** The player demonstrates volitional capacity SPONTANEOUSLY — setting goals without being asked, persisting without being told, resting without being prompted. Will is a way-of-being-in-the-world.

---

## 3. Game Design

### Setup
An open Red-stage world: territories to claim, enemies to defeat, resources to gather, allies to coordinate with. The player moves freely. No explicit objectives — the world presents volitional opportunities. The player's GOAL-SETTING AND GOAL-KEEPING BEHAVIOUR is the assessment.

### Interaction
- **Territory claiming:** Commit to holding an area (sustained presence = ownership)
- **Enemy engagement:** Choose to fight (requires commitment to finish)
- **Resource gathering:** Delayed-gratification opportunities (wait for better, or take now?)
- **Rest management:** Use (or ignore) recovery opportunities
- **Campaign building:** Multi-session territory expansion (optional, rewarded)

### Feedback
- Natural consequences: commitment → territory gained, power accumulated
- Natural consequences: abandonment → territory lost, power stagnant
- No explicit "will score" — the world IS the feedback
- Power-resonant rewards for volitional engagement

### Difficulty Adaptation
- Opportunity complexity scales with demonstrated goal-completion rate
- Enemy difficulty scales with demonstrated persistence
- Territory requirements scale with demonstrated commitment duration
- Campaign length scales with demonstrated sustained engagement

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Territory Claiming | 1-5 | Simple claims, brief holds, obvious rewards |
| Goal Pursuit | 5-15 | Enemies, resources, delayed gratification |
| Vow Management | 15-30 | Multiple active goals, rest strategy, prioritisation |
| Sustained Campaigns | 30-50 | Multi-visit territories, long-term commitment |
| The Will's World | 50+ | Full volitional world, all capacities tested ecologically |

---

## 4. Item Pool Specification

### Item types
- **Territory configurations:** Areas requiring varied commitment levels
- **Enemy encounters:** Challenges requiring varied persistence
- **Resource opportunities:** Delayed-gratification scenarios
- **Rest-point configurations:** Recovery opportunities with varied accessibility
- **Campaign territories:** Multi-visit areas with escalating rewards

### Minimum pool size
- 20+ territory configs, 30+ enemy encounters, 15+ resource opportunities, 10+ rest configs, 15+ campaign territories

### Drive/shadow mapping
- Rest-point usage → Agency/dark-addiction; spontaneous goal-setting → Agency golden/dark-allergy
- Ally coordination → Communion; difficulty-seeking → Eros; familiar territory quality → Agape
- Rest avoidance → dark-addiction; aimless wandering → dark-allergy; systematic-but-weak → golden-addiction; burst-only engagement → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap (interact, claim, engage); Hold (sustain commitment, hold territory); Swipe (navigate, explore)

### Timing requirements
- Session-level tracking (goal-setting patterns, rest patterns, engagement duration)
- No millisecond precision needed; seconds/minutes-level measurement

### NPC/AI requirements
- Ally NPCs with own goals; Enemy NPCs with varied challenge profiles
- World must be CONSISTENT across sessions

### LLM requirements
- **High:** World generation, ecological will-assessment, narrative adaptation
- Detects spontaneous goal-setting from behaviour patterns
- Evaluates volitional quality without explicit tasks

### State persistence
- Full world state; goal-setting history; goal-completion history; rest patterns; campaign progress; territory ownership; drive/shadow signals; fatigue state; checkpoint position
