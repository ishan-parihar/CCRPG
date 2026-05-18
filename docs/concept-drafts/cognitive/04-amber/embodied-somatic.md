# Cognitive / Amber — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes cognitive intelligence through THE BODY THAT FOLLOWS RULES — disciplined movement, kata, drill, liturgical form. At Amber, this is: "Can your body follow a rule? Can your body reproduce a sequence? Can your body SHIFT when the form changes?"
>
> **Why this axis for Cognitive/Amber:** Concrete operational thinking lives in the body as DISCIPLINED FORM — the kata, the drill, the liturgical gesture. The body that can follow a 3-step sequence, maintain a pattern, and shift when the form changes demonstrates cognitive capacity somatically. This modality tests whether rule-following is EMBODIED, not just mental.

---

## 1. Game Identity

- **Title:** "The Form-Keeper"
- **Core mechanic:** Rule-governed body sequences — follow the form, maintain the pattern, reproduce the drill, shift when the form changes. Not free movement but DISCIPLINED movement.
- **Duration:** 2-4 minutes per session (infinite checkpoints; body-fatigue monitored)
- **Internal progression:** The First Form → The Held Pattern → The Living Drill → The Shifting Form → The Master Keeper

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** "Here is the form. Your body must follow. Not once — CONSISTENTLY. The same sequence. The same timing. And when the form changes — your body must change too." The contact boundary is: "Can your body follow rules reliably?"

**How it differs from the other 6:** Other modalities test rule-following mentally (puzzle), socially (narrative), or perceptually (pattern). This modality tests whether concrete operational capacity is EMBODIED — whether the body itself can be systematic, disciplined, and flexible. The body is the medium of assessment.

**What it uniquely surfaces:** Embodied perseveration (body locked in old form), embodied chaos (body refuses discipline), embodied overreach (body attempts beyond capacity), embodied freeze (body stops at novelty). These are somatic signatures invisible to purely mental modalities.

**Successful integration:** The player's body demonstrates concrete operational mastery — disciplined, flexible, systematic movement. Consistent form WITH shift-capacity.

---

## 3. Game Design

### Setup
A training-hall where body-forms are demonstrated and the player must reproduce them. Aesthetic: Amber-stage dojo/monastery — disciplined space, clean lines, a master-figure demonstrating, the player's body-outline following.

### Interaction Phases
- **The First Form (1-5):** 2-step body sequence. "Left-right. Again. Again." Simple repetition.
- **The Held Pattern (5-15):** 3-step sequence maintained over time. "Left-right-hold. Ten times. Consistent."
- **The Living Drill (15-30):** Multiple forms; switch between them on cue. "Form A. Form B. Form A. Which one now?"
- **The Shifting Form (30-50):** Form changes WITHOUT cue. Detect and adapt. Body-WCST.
- **The Master Keeper (50+):** Full integration: stable forms + flexible switching + shift-detection + coordination.

### Feedback
- Accurate form → "The form holds. Your body serves the code. Clean. Disciplined. Good."
- Perseveration → "The form changed. Your body is still in the old pattern. Let go. Feel the new form."
- Chaotic movement → "Simpler. Just two moves. Left-right. That's the form. Your body can do this."
- Overreaching → "Not yet. Master THIS form first. Three steps. Perfect. Then four."
- Frozen at shift → "The form changed slightly. That's okay. Your body noticed. Now follow. Gently."

### Difficulty Adaptation
- Sequence length: 2-step → 3-step → 3-step under load
- Repetitions: few → many (sustained accuracy)
- Forms available: 1 → 2-3 → multiple (switching)
- Shift frequency: rare → occasional → moderate
- Coordination: solo → with rhythm → with companion

### Progression Table
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Form | 1-5 | 2-step body sequence |
| The Held Pattern | 5-15 | 3-step sustained accuracy |
| The Living Drill | 15-30 | Multiple forms, cued switching |
| The Shifting Form | 30-50 | Uncued form-change detection |
| The Master Keeper | 50+ | Full embodied cognitive integration |

---

## 4. Item Pool

- **Simple forms** (20+): 2-3 step body sequences (warm-up)
- **Sustained forms** (20+): 3-step sequences requiring extended repetition
- **Switching forms** (15+): Multiple forms with cued transitions
- **Shifting forms** (10+): Forms that change without cue (body-WCST)
- **Coordinated forms** (10+): Forms requiring synchrony with external rhythm

---

## 5. Technical Requirements

- **Inputs:** Gesture/tap sequences (body-form execution); rhythm-tap (coordination); swipe-direction (movement direction)
- **Timing:** Sequence timing tracked (ms precision); rhythm synchrony measured; inter-form intervals standardised
- **NPC/AI:** Form-demonstration system; accuracy tracking (sequence correctness, timing precision); perseveration detection; fatigue detection (accuracy degradation); adaptive difficulty (sequence length, shift frequency, coordination demand)
- **LLM level:** None — fully deterministic. Body-form accuracy is binary (correct/incorrect sequence and timing).
- **State persistence:** Form accuracy history; sustained accuracy metrics; switching accuracy; shift-detection latency; coordination quality; perseveration counts; body-fatigue state; checkpoint position
