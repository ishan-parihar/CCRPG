# Moral / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes moral intelligence THROUGH THE BODY — gut reactions to moral content, physical hesitation before wrong action, somatic markers of consequence-awareness. At Red, the body KNOWS before the mind: the flinch before stealing, the tension before betrayal, the relaxation after fair exchange.
>
> **Why this axis for Moral/Red:** Damasio's somatic marker hypothesis: the body encodes moral knowledge as physical sensation BEFORE conscious reasoning. At Red, where verbal moral reasoning is primitive, the body may be AHEAD of the mind. This axis tests whether moral intelligence has genuine somatic grounding — does the body signal consequences?

---

## 1. Game Identity

- **Title:** "The Consequence-Body"
- **Core mechanic:** The player's physical responses (timing, force, hesitation, rhythm) during morally-charged actions reveal somatic moral intelligence. The game measures WHETHER the body signals consequences — not whether the player articulates them.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Flinch → The Hesitation → The Gut-Pull → The Body's Choice → The Consequence-Sense

---

## 2. Catalyst Delivery

**Catalyst:** "Your body knows. Before you think, before you speak — your body signals. Can you feel it?" The contact boundary is: "Does your body participate in moral reasoning, or is morality purely cognitive?"

**Unconscious response:**
- *Submergent:* Does the body signal at all? Does it signal only fear (dark-allergy)? Does it signal only excitement-of-exploitation (dark-addiction)? Does it perform signals without genuine somatic engagement (golden-addiction)?
- *Emergent:* Can the body signal more subtle moral distinctions? Can somatic markers guide choice before cognition?

**Integration path:** Rewards GENUINE somatic moral engagement — physical responses that correlate with consequence-awareness. Not performed hesitation but REAL hesitation. Not performed confidence but REAL ease.

**Successful integration:** The player's physical responses correlate with moral content — hesitation before costly actions, ease during fair exchange, tension during exploitation.

---

## 3. Game Design

### Setup
The Consequence-Body: a physical training ground where actions have moral weight. The player executes physical actions (strike, give, take, share, defend) and the game measures HOW the body responds to moral content. The aesthetic: Red-stage sparring ground where every blow has meaning — not just combat but MORAL combat.

### Interaction
- **The Flinch (1-5):** Does the body hesitate before harmful actions? Measure pre-action timing on morally-charged vs. neutral physical tasks.
- **The Hesitation (5-15):** Does hesitation SCALE with moral weight? Bigger consequences = more hesitation?
- **The Gut-Pull (15-30):** Does the body signal BEFORE the mind decides? Somatic markers preceding conscious choice.
- **The Body's Choice (30-50):** Can the body GUIDE moral choice? Physical responses as moral compass.
- **The Consequence-Sense (50+):** Full somatic moral integration — body signals consequences, guides choices, differentiates moral weight automatically.

### Feedback
- Genuine somatic engagement → "Your body knows. The hesitation was real. Trust it."
- Predatory excitement → "Your body speeds up when you take. Notice that. Is that who you want to be?"
- Freeze → "Your body stopped. But nothing bad happened. Try again. Smaller."
- Performed → "You looked careful. But your body didn't feel it. Try again. Slower. Feel it."

### Difficulty Adaptation
- Moral weight: trivial → moderate → significant → severe
- Action complexity: single tap → sequence → coordinated
- Somatic demand: gross motor → fine motor → timing-sensitive
- Differentiation demand: binary (moral/not) → gradient (degrees of moral weight)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Flinch | 1-5 | Binary: does the body respond to moral content at all? |
| The Hesitation | 5-15 | Gradient: does response scale with moral weight? |
| The Gut-Pull | 15-30 | Temporal: does body signal BEFORE conscious decision? |
| The Body's Choice | 30-50 | Functional: can somatic signals guide choice? |
| The Consequence-Sense | 50+ | Integrated: full somatic moral intelligence |

---

## 4. Item Pool Specification

### Item types
- **Moral-physical actions:** Strike/give/take/share/defend with varying moral weight
- **Somatic differentiation tasks:** Same physical action in different moral contexts
- **Pre-decision measurement:** Actions where somatic response is measured before choice
- **Moral-weight gradients:** Actions with scaled moral significance
- **Coordination moral-physical tasks:** Joint actions with moral content

### Minimum pool size
- 30+ moral-physical actions, 25+ differentiation tasks, 20+ pre-decision, 15+ gradient, 10+ coordination

### Drive/shadow mapping
- Excitement during exploitation → dark-addiction; freeze at all moral content → dark-allergy
- Performed without genuine somatic engagement → golden-addiction; no somatic differentiation → golden-allergy

---

## 5. Technical Requirements

### Input types
- Force-sensitive tap/hold (measures intensity); timing-sensitive (measures hesitation/speed); rhythm (measures somatic engagement quality)

### Timing requirements
- Pre-action latency at ≥60Hz sampling (critical for hesitation measurement); force measurement continuous; rhythm analysis at 30Hz+

### NPC/AI requirements
- Minimal. Moral-physical scenarios are environmental, not NPC-driven.
- Some coordination tasks require an ally NPC with consistent timing.

### LLM requirements
- **Low-Medium:** Pattern interpretation across sessions; contextual framing. Core somatic measurement is algorithmic.

### State persistence
- Somatic differentiation coefficients; pre-decision signal patterns; moral-weight scaling curves; force/timing profiles per moral context; excitement-during-exploitation markers; freeze patterns; performed-vs-genuine ratios; drive/shadow signals; fatigue state; checkpoint position
