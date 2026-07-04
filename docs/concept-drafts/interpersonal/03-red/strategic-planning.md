# Interpersonal / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes interpersonal intelligence through MULTI-STEP RELATIONAL PLANNING — sequencing interpersonal actions across time, managing multiple relationships simultaneously, and anticipating others' responses to planned moves.
>
> **Why this axis for Interpersonal/Red:** At Red, interpersonal planning is 2-step and TRANSACTIONAL: "First I'll ally with X to defeat Y, THEN I'll take X's share." The player can plan 2 relational moves ahead but cannot yet manage complex alliance networks. This axis isolates the PLANNING component of interpersonal intelligence.

---

## 1. Game Identity

- **Title:** "The War-Planner"
- **Core mechanic:** The player plans interpersonal sequences — which alliances to form when, how to position relationships for future advantage, and how to manage relational resources across a multi-step campaign.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** 2-Move Plans → 3-Move Plans → Alliance Portfolios → Adaptive Plans → Contested Alliances

---

## 2. Catalyst Delivery

**Catalyst:** "You need X's help to defeat Y. But X wants something from Z. And Z is your enemy. Plan your moves." The contact boundary is: "Can you THINK AHEAD in relational space?"

**Unconscious response:**
- *Submergent:* Do they plan at all (or just react to each relationship)? Do they over-plan (golden-addiction)? Refuse to plan because "others are unpredictable" (dark-allergy)? Plan only domination sequences (dark-addiction)?
- *Emergent:* Can they hold one more relational move in mind? Can they anticipate others' counter-moves?

**Integration path:** Rewards EXECUTED relational plans (not just conceived). A simple 2-move alliance plan that works scores higher than a complex 5-move plan that collapses.

**Successful integration:** The player conceives and executes 2-3 step interpersonal plans appropriate to Red capacity.

---

## 3. Game Design

### Setup
The War-Planner: a campaign map where alliances are MOVES. The player must plan which relationships to form, maintain, or end across a sequence of challenges. Each challenge requires different relational configurations. The aesthetic: Red-stage war-table, alliance tokens, the campaign map of relationships.

### Interaction
- **2-Move Plans:** "Ally with X to defeat Y." Simple sequential relational moves. (1-5)
- **3-Move Plans:** "Ally with X, use X to reach Z, then trade with Z." Longer sequences. (5-15)
- **Alliance Portfolios:** "You can maintain 3 alliances. Which 3? Resources are limited." (15-30)
- **Adaptive Plans:** Mid-campaign, an ally betrays. Revise the relational plan. (30-50)
- **Contested Alliances:** Enemy is also forming alliances. Anticipate and counter their relational strategy. (50+)

### Feedback
- Plan executed → "Your alliances held. Each relationship served its moment in the campaign."
- Plan collapsed → "The alliance broke. What did you miss about their intent?"
- Over-complex → "Three alliances would have done it. You planned seven. Simpler wins wars."
- Domination-only → "You planned to crush them all. But who fights for a chief who betrays everyone?"

### Difficulty Adaptation
- Plan length: 2 → 3 → 4 moves; Alliance slots: unlimited → 3 → 2
- NPC predictability: perfectly predictable → mostly → partially → adversarial
- Adaptation demand: static → changing → contested

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| 2-Move Plans | 1-5 | Simple sequential alliances; predictable NPCs |
| 3-Move Plans | 5-15 | Longer sequences; some unpredictability |
| Alliance Portfolios | 15-30 | Limited slots; must choose which relationships to maintain |
| Adaptive Plans | 30-50 | Betrayals and changes; must revise |
| Contested Alliances | 50+ | Adversarial relational strategy; anticipation required |

---

## 4. Item Pool

### Item types
- **Campaign scenarios:** Multi-step situations requiring planned alliances
- **Alliance configurations:** Different NPC combinations with varied strengths/costs
- **Betrayal triggers:** Mid-plan changes requiring relational revision
- **Enemy strategies:** Adversarial alliance patterns to counter

### Minimum pool size
- 30+ 2-move, 25+ 3-move, 20+ portfolio, 15+ adaptive, 10+ contested

### Drive/shadow mapping
- All-domination plans → dark-addiction; solo-only plans → dark-allergy
- Over-complex plans → golden-addiction; single-interaction-only → golden-allergy

---

## 5. Technical Requirements

### Input types
- Drag-and-drop (arrange alliance tokens on campaign map); tap-to-select (choose allies); sequence input (order relational moves)

### Timing requirements
- No millisecond precision; planning phase is untimed; execution phase has generous windows

### NPC/AI requirements
- NPCs with defined response patterns (predictable at early levels, less so at advanced)
- Enemy AI that forms counter-alliances at advanced levels
- NPCs that remember past interactions and adjust behaviour

### LLM requirements
- **Medium:** Scenario generation, NPC response narration, plan evaluation. Core scoring algorithmic.

### State persistence
- Plan completion history; agent-modelling accuracy; portfolio management patterns; adaptation speed; domination/isolation/over-complexity/commitment-avoidance patterns; drive/shadow signals; fatigue state; checkpoint position
