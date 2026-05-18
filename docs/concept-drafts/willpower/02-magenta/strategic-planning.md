# Willpower / Magenta — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes willpower through WISH-SEQUENCING — can the player plan steps toward a wish? At Magenta, this is proto-planning: "First I wish, THEN I do one thing." The single-step implementation intention. The wish becomes a plan (barely).
>
> **Why this axis for Willpower/Magenta:** Planning at Magenta is almost non-existent — but the SEED exists: "If I want X, I do Y." One step. One connection between wish and action. This modality tests whether the player can form even the simplest wish→action link.

---

## 1. Game Identity

- **Title:** "The Wish-Step"
- **Core mechanic:** The player declares a wish and identifies ONE action that moves toward it. Not multi-step planning — just: "I want X, so I do Y." The proto-implementation-intention. Can the wish produce a plan (even a one-step plan)?
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Wish-Link → The If-Then → The Two-Step → The Wish-Map → The Planning Wish

---

## 2. Catalyst Delivery

**Catalyst:** "You want X. What's ONE thing you could do? Just one step. What would move you closer?" The contact boundary is: "Can your wish produce a plan?"

**Unconscious response:**
- *Submergent:* Can the player link wish to action? The Magical Demander says "Just GIVE it to me" (no plan needed). The Wish-Abandoner can't plan because there's no wish. The Premature Disciplinarian plans without wishing (action without desire). The Effort-Refuser wishes but can't identify a step.
- *Emergent:* Can they form a wish→action link? Can the wish generate even one step?

**Integration path:** Rewards WISH-LINKED PLANNING — identifying an action that serves the wish. Not demanding without planning, not planning without wishing, not refusing to plan.

**Successful integration:** The player forms a wish and identifies one action that moves toward it — the seed of implementation intention.

---

## 3. Game Design

### Setup
The Wish-Step: a planning space where wishes become steps. The aesthetic: Magenta-stage stepping-stones — the wish floats ahead, and stepping-stones appear when the player identifies actions. Each correct step makes a stone appear, creating a path toward the wish.

### Interaction
- **The Wish-Link (1-5):** Wish declared → identify ONE action that helps. Stone appears.
- **The If-Then (5-15):** "If I want X, then I do Y." Explicit wish→action link formation.
- **The Two-Step (15-30):** Two actions in sequence toward the wish. Proto-multi-step.
- **The Wish-Map (30-50):** Multiple possible steps; choose the BEST one for the wish.
- **The Planning Wish (50+):** Full wish→plan integration: wish → identify → choose → sequence.

### Feedback
- Correct wish→action link → "A stepping-stone appears! Your wish is closer."
- No plan (demand) → "Wishing alone won't reach it. One step. What could you DO?"
- No wish (empty plan) → "A step toward WHAT? What's the wish? Name it first."
- Plan without wish → "Good step. But what's it FOR? What do you WANT?"
- Step identified but refused → "You found it! Now just... step. One step. Go."

### Difficulty Adaptation
- Step obviousness: very clear → moderate → requires inference
- Wish→action distance: direct → indirect → requires reasoning
- Number of steps: 1 → 2 → 3 (maximum at Magenta)
- Distractor actions: none → 1 wrong option → multiple wrong options
- Execution requirement: identify only → identify + execute

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Wish-Link | 1-5 | One obvious wish→action link |
| The If-Then | 5-15 | Explicit if-then formation |
| The Two-Step | 15-30 | Two sequential actions |
| The Wish-Map | 30-50 | Choose best step from options |
| The Planning Wish | 50+ | Full wish→plan integration |

---

## 4. Item Pool Specification

### Item types
- **Direct links:** Obvious wish→action connections
- **If-then items:** Explicit conditional planning prompts
- **Sequence items:** Two-step action sequences
- **Choice items:** Multiple possible steps; choose best
- **Execution items:** Identified steps that must be taken

### Minimum pool size
- 25+ direct, 20+ if-then, 15+ sequence, 15+ choice, 10+ execution

### Drive/shadow mapping
- No plan/demand → dark-addiction; no wish to plan toward → dark-allergy
- Plan without wish → golden-addiction; step identified but refused → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (choose action-step from options); verbal (name the step); drag (connect wish to action)

### Timing requirements
- Planning latency tracked; execution timing; no time pressure on planning

### NPC/AI requirements
- Stepping-stone visualization (wish ahead, stones appearing with correct steps)
- Action-option generation (possible steps to choose from)
- Optional: companion who models wish→action planning

### LLM requirements
- **Low-Medium:** Action-step relevance evaluation; wish-connection assessment; scenario generation. Core step-identification partially algorithmic.

### State persistence
- Wish→action link formation rates; link quality scores; wish-connection indicators; sequence capacity; execution rates; demand-without-plan indicators; no-wish indicators; plan-without-wish indicators; step-refusal indicators; drive/shadow signals; fatigue state; checkpoint position
