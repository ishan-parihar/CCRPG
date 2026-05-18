# Moral / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes moral intelligence through MULTI-STEP CONSEQUENCE PLANNING — sequencing moral actions across time, managing competing self-interests over multiple moves, and anticipating how today's moral choice affects tomorrow's options.
>
> **Why this axis for Moral/Red:** At Red, moral planning is 2-step and SELF-INTERESTED: "If I take now, what happens next? If I wait, do I get more later?" This axis isolates the TEMPORAL component of moral intelligence — can you think ahead in consequence-space?

---

## 1. Game Identity

- **Title:** "The Consequence-Planner"
- **Core mechanic:** The player plans moral sequences — which actions to take when, how to position for future advantage, and how to manage competing self-interests across a multi-step campaign of choices.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** 2-Step Plans → 3-Step Plans → Competing Timelines → Adaptive Plans → The Long Game

---

## 2. Catalyst Delivery

**Catalyst:** "You can take now. Or wait. Or take some now and some later. Plan your moves." The contact boundary is: "Can you THINK AHEAD in moral-consequence space?"

**Unconscious response:**
- *Submergent:* Do they plan at all (or just react to each consequence)? Do they over-plan (golden-addiction)? Refuse to plan because "consequences are unpredictable" (dark-allergy)? Plan only exploitation sequences (dark-addiction)?
- *Emergent:* Can they hold one more consequence-step in mind? Can they delay gratification for larger reward?

**Integration path:** Rewards EXECUTED moral plans (not just conceived). A simple 2-step plan that works scores higher than a complex 5-step plan that collapses.

**Successful integration:** The player conceives and executes 2-3 step moral-consequence plans appropriate to Red capacity.

---

## 3. Game Design

### Setup
The Consequence-Planner: a campaign of moral choices across time. The player must plan which actions to take when, managing resources, relationships, and consequences across a multi-step sequence. Each step's consequences affect the next step's options. The aesthetic: Red-stage war-campaign where every raid, every trade, every alliance has consequences that ripple forward.

### Interaction
- **2-Step Plans (1-5):** "Take now → lose access later" OR "wait now → gain more later." Simple delayed gratification.
- **3-Step Plans (5-15):** "Take X → use X to get Y → use Y to get Z." Longer consequence-chains.
- **Competing Timelines (15-30):** "Path A gives more in 2 steps; Path B gives more in 4 steps. Which timeline?"
- **Adaptive Plans (30-50):** Mid-plan, consequences shift. Revise the moral strategy.
- **The Long Game (50+):** Complex multi-step moral campaigns with competing timelines, uncertain outcomes, and adaptive demands.

### Feedback
- Plan executed → "Your foresight paid off. Each step served the next."
- Plan collapsed → "The chain broke. What consequence did you miss?"
- Over-complex → "Two steps would have done it. You planned six. Simpler wins."
- Exploitation-only → "You planned to take everything. But the source is gone now. What's your plan for NEXT time?"

### Difficulty Adaptation
- Plan length: 2 → 3 → 4 steps
- Consequence certainty: certain → probable → uncertain
- Competing timelines: none → 2 → 3+
- Adaptation demand: static → changing → adversarial

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| 2-Step Plans | 1-5 | Simple delayed gratification; certain outcomes |
| 3-Step Plans | 5-15 | Longer chains; some uncertainty |
| Competing Timelines | 15-30 | Multiple paths; must choose which timeline |
| Adaptive Plans | 30-50 | Mid-plan changes; must revise |
| The Long Game | 50+ | Full complexity: chains + timelines + adaptation |

---

## 4. Item Pool

### Item types
- **Delayed-gratification sequences:** Now vs. later trade-offs across steps
- **Consequence-chain puzzles:** Multi-step cause→effect requiring planning
- **Timeline comparisons:** Competing paths with different payoff curves
- **Disruption scenarios:** Mid-plan changes requiring revision
- **Sustainability puzzles:** Plans that must account for resource renewal

### Minimum pool size
- 30+ 2-step, 25+ 3-step, 20+ competing-timeline, 15+ adaptive, 10+ long-game

### Drive/shadow mapping
- All-exploitation plans → dark-addiction; never-execute plans → dark-allergy
- Over-complex plans → golden-addiction; single-step-only → golden-allergy

---

## 5. Technical Requirements

### Input types
- Drag-and-drop (arrange moral actions in sequence); tap-to-select (choose timeline); sequence input (order moral moves)

### Timing requirements
- No millisecond precision; planning phase untimed; execution phase has generous windows

### NPC/AI requirements
- Environment with consistent consequence-rules (predictable at early levels)
- Disruption events at advanced levels (mid-plan changes)
- Resource systems that deplete and renew (sustainability testing)

### LLM requirements
- **Medium:** Scenario generation, plan evaluation narration, consequence-chain construction. Core scoring algorithmic.

### State persistence
- Plan completion history; consequence-prediction accuracy; timeline optimisation quality; adaptation speed; sustainability patterns; exploitation/paralysis/over-complexity/single-step patterns; drive/shadow signals; fatigue state; checkpoint position
