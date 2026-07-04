# Spiritual / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes spiritual intelligence through VALUE-DILEMMAS — situations where values compete and the player must CHOOSE which matters more. At Red, this is concrete: "Power or loyalty? Victory or honour? Safety or glory?"
>
> **Why this axis for Spiritual/Red:** Spiritual intelligence is revealed most clearly when values COMPETE. Anyone can hold a value when it costs nothing. The dilemma forces priority — and priority reveals the actual value-hierarchy, not the performed one.

---

## 1. Game Identity

- **Title:** "The Power-Priest's Trial"
- **Core mechanic:** The player faces dilemmas where their stated values compete with each other or with immediate reward. The game measures the QUALITY of value-prioritisation — not which value they choose, but whether the choice is consistent, coherent, and genuinely held.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Simple Priority → Costly Priority → Competing Sacred → The Temptation → The Power-Priest's Trial

---

## 2. Catalyst Delivery

**Catalyst:** "You said X matters most. But choosing X costs you Y, which also matters. What do you choose — and can you live with it?" The contact boundary is: "What happens when your values fight each other?"

**Unconscious response:**
- *Submergent:* How does the player handle value-conflict? The Zealot always chooses the weaponisable value. The Nihilist can't choose (nothing matters). The Premature Mystic claims "both are one" without choosing. The Sacred-Refuser chooses then immediately regrets.
- *Emergent:* Can they hold value-conflict without collapse? Can they prioritise clearly and hold the priority?

**Integration path:** Rewards CLEAR, CONSISTENT, HELD prioritisation. Not which value wins — but whether the choice is genuine, consistent across similar dilemmas, and held without immediate regret.

**Successful integration:** The player demonstrates a stable value-hierarchy that guides choice under pressure — choosing clearly, holding the choice, and maintaining consistency.

---

## 3. Game Design

### Setup
The Power-Priest's Trial: a series of value-dilemmas where the player must prioritise. Each dilemma pits values against each other with real consequences. The aesthetic: Red-stage temple trial — the power-priest demands the warrior choose which offering to make, which god to serve, which oath to keep when oaths conflict.

### Interaction
- **Simple Priority (1-5):** "X or Y? Which matters more?" Low-cost, obvious priority.
- **Costly Priority (5-15):** "X costs you Z. Y costs you W. Which sacrifice do you make?"
- **Competing Sacred (15-30):** "Both are sacred to you. But you can only protect one. Which?"
- **The Temptation (30-50):** "Abandon your value and gain enormous reward. Hold your value and gain nothing. Choose."
- **The Power-Priest's Trial (50+):** Complex multi-value dilemmas with cascading consequences.

### Feedback
- Clear, held priority → "You chose. You held. The oath stands. That's spiritual strength."
- Power-only → "You chose power again. Is power your ONLY value? Or are you afraid of the others?"
- Cannot choose → "The priest waits. The offering must be made. One or the other. Choose."
- Chose then regretted → "You chose X. Then you wavered. The oath is weakened. Next time: choose and HOLD."

### Difficulty Adaptation
- Dilemma complexity: binary → multi-value → cascading
- Cost level: low → moderate → high → extreme
- Priority clarity: obvious → ambiguous → genuinely difficult
- Commitment duration: 1 decision → 3 → 5 → session-long

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Simple Priority | 1-5 | Obvious priority; low cost |
| Costly Priority | 5-15 | Priority with sacrifice |
| Competing Sacred | 15-30 | Both values sacred; must choose |
| The Temptation | 30-50 | Enormous reward for value-violation |
| The Power-Priest's Trial | 50+ | Full value-dilemma ecology |

---

## 4. Item Pool

### Item types
- **Simple priority dilemmas:** Obvious which matters more
- **Costly priority dilemmas:** Both options have significant cost
- **Competing-sacred dilemmas:** Both values are declared sacred
- **Temptation scenarios:** High reward for value-violation
- **Cascading dilemmas:** Choice affects future dilemma options

### Minimum pool size
- 25+ simple, 20+ costly, 20+ competing-sacred, 15+ temptation, 10+ cascading

### Drive/shadow mapping
- Always chooses power → dark-addiction; cannot choose → dark-allergy
- Refuses binary choice → golden-addiction; chooses then regrets → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (binary/multi choice); timing (deliberation duration); commitment tracking (hold duration)

### Timing requirements
- Deliberation time tracked (diagnostic); no punishing time pressure at early levels
- Cross-session tracking for consistency

### NPC/AI requirements
- Power-Priest NPC who presents dilemmas and demands choice
- Consequence system that makes choices REAL (affect subsequent options)
- Temptation system with escalating rewards

### LLM requirements
- **High:** Dilemma generation, consequence narration, priority evaluation. Core scoring algorithmic.

### State persistence
- Priority history; consistency scores; cost-tolerance curves; commitment durations; hierarchy coherence; deliberation times; regret patterns; drive/shadow signals; fatigue state; checkpoint position
