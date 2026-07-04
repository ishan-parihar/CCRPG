# Willpower / Amber — Deterministic Game Concept

> **Axis:** Objective measurement of sustained volitional commitment — vow-holding accuracy, duty-persistence under low motivation, temptation-resistance, and fatigue-through capacity.
> **Why this axis for this module:** Duty-will IS measurable. Vow-holding duration, persistence through low-reward periods, and resistance to competing temptations are all binary, objective, and the backbone of Amber willpower assessment.

---

## 1. Game Identity

- **Title:** "The Vigil"
- **Core mechanic:** The player takes a vow at the start of each session and must hold it across a series of challenges that test persistence, temptation-resistance, and fatigue-through. The vow is a concrete, measurable commitment ("I will complete 10 tasks without abandoning any"). The game tracks whether the vow is kept.
- **Duration:** 5-15 minutes per session (vow-length scales with demonstrated capacity)
- **Internal progression:** The First Vow → The Dry Stretch → The Temptation → The Fatigue Wall → The Vigil Complete

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** Pure volitional challenge with no social, verbal, or embodied mediation. The vow is declared; the player holds it or doesn't. Binary. Objective. The contact boundary is engaged directly: "Can your will sustain a commitment when motivation is absent?"

**How this differs from other modalities:** No language required (unlike language-reflective). No decision-making under ambiguity (unlike scenario-choice). No body involvement (unlike embodied-somatic). No coordination (unlike social-cooperative). No free-play (unlike immersive-rpg). JUST: here is the vow. Hold it. Now.

**What it uniquely surfaces:** The RAW capacity — stripped of all compensatory strategies. A player who talks well about commitment (language-reflective) but fails here has golden-addiction. A player who plans well (strategic-planning) but fails here has bypassed duty-will. This is ground truth.

**Successful integration:** The player demonstrates duty-will — sustained, flexible, obligation-grounded — in pure psychophysical terms.

---

## 3. Game Design

### Setup
The Vigil: a monastery-style interface where the player takes a vow before a sacred flame. The flame represents the commitment — it must be kept burning through the session. Aesthetic: Amber-stage order — stone, candlelight, ritual objects, the weight of obligation.

### Interaction
- **The First Vow (1-5):** Simple vow, short duration. "I will complete 5 tasks." Binary: complete or abandon.
- **The Dry Stretch (5-15):** Low-reward tasks. Motivation drops. The vow must hold without external reward. "The flame burns even when no one watches."
- **The Temptation (15-30):** Competing rewards offered. "You could stop now and take this bonus. Or hold the vow." Temptation-resistance scored.
- **The Fatigue Wall (30-50):** Effort-continuation past first fatigue signal. The game makes fatigue visible; the player must choose to continue.
- **The Vigil Complete (50+):** Full integration: vow-holding + dry-stretch + temptation-resistance + fatigue-through simultaneously.

### Feedback
- Vow held → "The flame holds. Your word is your bond. The vigil continues."
- Vow broken → "The flame dims. A vow broken is not failure — it is information. What will you hold next time?"
- Temptation accepted → "The reward was taken. The vow was released. Notice: was this a sovereign choice or an impulse?"
- Fatigue-through → "The body says stop. The will says continue. The vigil honours both — and chooses."
- Compulsive continuation → "The vigil is complete. Rest is not failure. The flame can be set down."

### Difficulty Adaptation
- Vow duration: 5 tasks → 10 tasks → 20 tasks → multi-session vow
- Dry-stretch length: 1 minute → 3 minutes → 7 minutes → 10 minutes
- Temptation magnitude: small bonus → medium bonus → large bonus → identity-level temptation
- Fatigue signals: mild → moderate → strong → overwhelming
- Vow complexity: single commitment → dual commitment → role-consistent commitment

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Vow | 1-5 | Simple vow, short duration, immediate reward |
| The Dry Stretch | 5-15 | Low-reward persistence, motivation-independent holding |
| The Temptation | 15-30 | Competing rewards, temptation-resistance |
| The Fatigue Wall | 30-50 | Effort-continuation past fatigue |
| The Vigil Complete | 50+ | Full duty-will integration |

---

## 4. Item Pool

- **Vow-declaration items:** Concrete commitments of varying duration and complexity — 25+
- **Dry-stretch tasks:** Low-reward, repetitive tasks requiring persistence — 30+
- **Temptation items:** Competing rewards of varying magnitude — 20+
- **Fatigue-through tasks:** Effort-continuation challenges with visible fatigue signals — 20+
- **Role-consistency probes:** Tasks requiring behaviour consistent with declared role — 15+

---

## 5. Technical Requirements

- **Input types:** Tap (task completion); hold (sustained effort); swipe (temptation-resistance); timer-based (vow-duration tracking)
- **Timing:** Vow-duration tracked (ms precision); dry-stretch duration monitored; temptation-response latency measured; fatigue-signal timing recorded
- **NPC/AI:** Adaptive vow-length system; temptation-magnitude calibration; fatigue-signal timing; shadow-signal accumulator; vow-completion rate tracking
- **LLM:** None — fully deterministic scoring
- **State persistence:** Full vow history; completion rates; abandonment patterns; temptation-acceptance rates; fatigue-through rates; dry-stretch duration; cross-session vow-holding; drive/shadow signal accumulation; checkpoint position
