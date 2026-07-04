# Emotional / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes emotional intelligence through MULTI-STEP EMOTIONAL SEQUENCING — planning how to manage emotions across a sequence of events, anticipating emotional reactions, and preparing emotional responses in advance.
>
> **Why this axis for Emotional/Red:** At Red, emotional planning is 2-step: "First I'll use my rage to attack, THEN I'll contain it to negotiate." The player can sequence 2 emotional states but cannot yet manage complex emotional portfolios. This axis isolates the PLANNING component of emotional intelligence.

---

## 1. Game Identity

- **Title:** "The Wroth-Strategist"
- **Core mechanic:** The player plans emotional sequences — which emotions to deploy when, how to transition between states, and how to manage emotional resources across a multi-step challenge.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** 2-Emotion Sequences → 3-Emotion Sequences → Emotional Budgeting → Adaptive Sequences → Contested Emotions

---

## 2. Catalyst Delivery

**Catalyst:** Challenges that require SEQUENTIAL emotional management — "First feel rage (to break through), THEN feel calm (to negotiate), THEN feel pride (to hold the gain)." The contact boundary is: "Can you PLAN your emotional states?"

**Unconscious response:**
- *Submergent:* Do they plan at all (or just react)? Do they over-plan (golden-addiction)? Refuse to sequence (golden-allergy)? Get stuck in one emotion (dark-addiction)? Cannot access any to plan with (dark-allergy)?
- *Emergent:* Can they hold one more emotional transition? Can they anticipate emotional needs?

**Integration path:** Rewards EXECUTED emotional sequences (not just conceived). A simple 2-emotion sequence kept cleanly scores higher than a complex sequence that collapses.

**Successful integration:** The player conceives and executes 2-3 step emotional sequences appropriate to Red capacity.

---

## 3. Game Design

### Setup
A sequence of challenges requiring different emotional states. The player must PLAN which emotions to deploy in which order, then EXECUTE the plan. The aesthetic: Red-stage war-planning, emotional preparation before battle, the warrior's inner strategy.

### Interaction
- **2-Emotion Sequences:** "Rage to break, calm to hold." Plan two emotional states in order, execute.
- **3-Emotion Sequences:** "Fear to scout, rage to strike, pride to claim." Three sequential emotions.
- **Emotional Budgeting:** "You have energy for 2 intense emotions. Allocate wisely across 3 challenges."
- **Adaptive Sequences:** Mid-challenge, conditions change. Emotional plan must adapt.
- **Contested Emotions:** Enemy has their own emotional strategy. Anticipate and counter.

### Feedback
- Sequence completed → "Your emotional plan held. Each feeling served its moment."
- Stuck in one emotion → "You planned the shift but couldn't make it. What held you?"
- Over-complex plan → "Three emotions would have done it. You planned five. Simpler is stronger."

### Difficulty Adaptation
- Sequence length: 2 → 3 → 4; transition speed: slow → moderate → rapid
- Budget constraints: unlimited → limited → scarce
- Adaptivity: static → changing → adversarial

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| 2-Emotion Sequences | 1-5 | Simple two-emotion plans; generous timing |
| 3-Emotion Sequences | 5-15 | Longer sequences; timing constraints |
| Emotional Budgeting | 15-30 | Limited emotional energy; must allocate |
| Adaptive Sequences | 30-50 | Conditions change; must revise emotional plan |
| Contested Emotions | 50+ | Adversarial emotional strategy; anticipation |

---

## 4. Item Pool

### Item types
- **Sequence challenges:** Multi-step situations requiring planned emotional responses
- **Budget scenarios:** Limited-resource emotional allocation problems
- **Adaptation triggers:** Mid-sequence changes requiring emotional revision
- **Enemy emotional strategies:** Adversarial emotional patterns to counter

### Minimum pool size
- 30+ 2-emotion, 25+ 3-emotion, 20+ budget, 15+ adaptive, 10+ contested

### Drive/shadow mapping
- Stuck-in-one-emotion → dark-addiction; cannot-initiate → dark-allergy
- Over-complex plans → golden-addiction; vulnerability-avoidance in sequences → golden-allergy

---

## 5. Technical Requirements

### Input types
- Sequence input (order emotions in a queue); sustained expression (execute each emotion with intensity); revision input (modify plan mid-execution)

### Timing requirements
- Transition timing measured; execution quality per emotion in sequence; no millisecond precision needed for planning phase

### NPC/AI requirements
- Strategist NPC: suggests plans, provides feedback; Ally NPC: coordinates joint sequences; Enemy AI: executes counter-strategies

### LLM requirements
- **Medium:** Scenario generation, outcome narration, adaptive difficulty. Core scoring algorithmic.

### State persistence
- Maximum sequence-length; transition quality history; budget management patterns; adaptation speed; stuck-patterns; drive/shadow signals; fatigue state; checkpoint position
