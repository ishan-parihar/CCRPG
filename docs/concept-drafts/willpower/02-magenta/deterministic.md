# Willpower / Magenta — Deterministic Game Concept

> **Axis:** The deterministic axis probes willpower through OBJECTIVE MEASUREMENT — can the player hold a wish, tolerate delay, exert minimal effort? At Magenta, this is the proto-marshmallow test: "Can you wait? Can you hold your wish? Can you do one small thing toward it?"
>
> **Why this axis for Willpower/Magenta:** Pure measurement of wish-holding capacity. No narrative, no language, no social context — just: how long can you hold a wish? How much delay can you tolerate? Can you take one step? The ground-truth for all other modalities.

---

## 1. Game Identity

- **Title:** "The Wish-Holder"
- **Core mechanic:** The player declares a wish (chooses a desired outcome) and must HOLD it — maintain intention across delay, distraction, and minimal effort-demands. Objective measurement of pre-volitional capacity.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware; very short due to Magenta willpower fragility)
- **Internal progression:** The First Wish → The Waiting → The First Step → The Obstacle → The Held Wish

---

## 2. Catalyst Delivery

**Catalyst:** "Choose what you want. Now hold it. Wait. Take one step toward it." The contact boundary is: "Can your wish survive?"

**Unconscious response:**
- *Submergent:* What happens to the wish? The Magical Demander generates wishes compulsively but can't hold any. The Wish-Abandoner can't form one. The Premature Disciplinarian skips wishing and forces action. The Effort-Refuser wishes but won't step.
- *Emergent:* Can they hold the wish? Wait? Step?

**Integration path:** Rewards STABLE WISH-HOLDING — the wish persists through delay and minimal effort. Not compulsive wishing, not wish-absence, not forced effort, not effort-refusal.

**Successful integration:** The player holds a wish stably, tolerates delay, and takes one minimal step toward it.

---

## 3. Game Design

### Setup
The Wish-Holder: a wish-holding space where the player chooses a desired outcome and holds it across time. The aesthetic: Magenta-stage wishing-well — a glowing wish that the player holds in their hands. It pulses when held stably, dims when attention drifts, shatters when abandoned.

### Interaction
- **The First Wish (1-5):** Choose a wish. Hold it for 3 seconds. That's all.
- **The Waiting (5-15):** Hold the wish across a delay (5-10 seconds). Distractors appear.
- **The First Step (15-30):** Hold the wish AND take one minimal action toward it.
- **The Obstacle (30-50):** Hold the wish when the first obstacle appears. Does it survive?
- **The Held Wish (50+):** Full wish-holding: form → hold → wait → step → persist.

### Feedback
- Wish held stably → "Your wish glows. You're holding it. Beautiful."
- Wish abandoned → "The wish dimmed. It's still there. Can you find it again?"
- Compulsive switching → "Too many wishes. Pick ONE. Hold it. Just one."
- No wish formed → "Something here calls to you. What is it? Even something tiny."
- Effort refused → "Your wish is strong. Now just touch it. One tiny step."
- Effort forced → "Wait. What do you WANT? Wish first. Then step."

### Difficulty Adaptation
- Wish-hold duration: 3s → 5s → 8s → 12s → 20s
- Delay before reward: 2s → 5s → 8s → 12s
- Distractor intensity: none → mild → moderate
- Effort-step size: touch → tap → hold → sequence
- Obstacle severity: none → mild → moderate

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Wish | 1-5 | Form and hold a wish (3s) |
| The Waiting | 5-15 | Hold across delay with distractors |
| The First Step | 15-30 | Hold + one minimal effort-step |
| The Obstacle | 30-50 | Hold through first frustration |
| The Held Wish | 50+ | Full wish-holding integration |

---

## 4. Item Pool

### Item types
- **Wish options:** Attractive outcomes to choose between (visual, tangible)
- **Delay intervals:** Various wait-durations with different distractors
- **Effort-steps:** Minimal actions of varying size
- **Obstacles:** Frustrations of varying severity
- **Distractor items:** Competing stimuli during wish-holding

### Minimum pool size
- 20+ wish options, 15+ delay intervals, 15+ effort-steps, 10+ obstacles, 15+ distractors

### Drive/shadow mapping
- Rapid switching/tantrum → dark-addiction; no wish/random choice → dark-allergy
- Action-without-wish → golden-addiction; wish-without-action → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (wish choice); sustained touch (wish-holding); tap (effort-step); hold-through-distraction

### Timing requirements
- Wish-hold duration at ≥10Hz; delay measurement at ±100ms; effort-step timing tracked

### NPC/AI requirements
- Wish visualization (glowing object that responds to holding)
- Distractor system (competing stimuli during delay)
- Obstacle system (frustrations that test wish-persistence)
- Optional: companion who models wish-holding

### LLM requirements
- **Low:** Wish-option generation; contextual feedback text. Core measurement entirely algorithmic.

### State persistence
- Wish-hold durations; delay-tolerance scores; effort-step completion rates; frustration-tolerance; goal-memory accuracy; wish-switching rate; demand-escalation indicators; wish-absence indicators; action-without-wish indicators; wish-without-action indicators; drive/shadow signals; fatigue state; checkpoint position
