# Cognitive / Infrared — Strategic-Planning Game Concept

> **Axis:** Basic sequencing — 2-step action sequences, cause-effect learning.  **Why this axis for this module:** At Infrared, "planning" is simply cause→effect; this modality probes whether the perceptual system can link two events in time without requiring symbolic reasoning.

---

## 1. Game Identity

**Name:** Chain  
**Core loop:** The player observes a simple cause-effect event (tap circle → circle changes colour). Then they must reproduce the sequence. Sequences grow from 1-step to 2-step to 3-step. No symbols, no instructions — pure observational learning of action→outcome chains.

**Session length:** 30–90 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Discovery. Each successful sequence feels like unlocking a tiny secret. The world becomes predictable — and that predictability is soothing.

## 2. Catalyst Delivery

**DA surfacing:** Sequences are presented rapidly. Shadow response: player taps frantically without observing, tries every action compulsively rather than watching first. Cannot pause to observe.  
**DAll surfacing:** Simple 1-step sequences. Shadow response: player does not attempt reproduction. Observes passively but never acts. The cause-effect link is not tested because action is withheld.  
**GA surfacing:** Player observes a 1-step sequence but attempts a 3-step reproduction — adds steps that weren't demonstrated. "Sees" a longer chain than exists.  
**GAll surfacing:** Clear 2-step sequence demonstrated repeatedly. Shadow response: reproduces step 1 correctly but treats step 2 as unrelated — refuses to link them as a sequence.

**Catalyst → Experience → Integration:** Demonstrated sequence IS catalyst. Reproduction attempt IS experience. Integration = accurate observation + faithful reproduction + appropriate sequence extension.

## 3. Game Design

**Mechanics:**
- Demonstration phase: system performs action sequence (1–3 steps). Player watches.
- Reproduction phase: player attempts to reproduce the sequence. Order and timing matter.
- Observation gate: player MUST watch full demonstration before acting. Early taps = DA flag.
- Extension trials: after mastering a sequence, system adds one step. Measures Eros readiness.
- Reversal trials: established sequence changes. Measures dishabituation.
- Free-exploration: blank field with interactive elements. Does the player discover cause-effect independently?

**Difficulty staircase:** Sequence length (1→2→3), demonstration speed, number of possible actions (2→4), delay between demo and reproduction. Adapts via reproduction accuracy.

**Drive probing:**
- Agency: observation gate — can the player WAIT before acting?
- Communion: reproduction fidelity — can the player match what was shown?
- Eros: extension acceptance — readiness for longer sequences
- Agape: return to 1-step after 3-step — can the player simplify without frustration?

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| C-01 | 1-step demo | Single action→outcome | Baseline |
| C-02 | 2-step demo | Two linked actions | Capacity |
| C-03 | Rapid demo | Fast demonstration | DA (impulsive action) |
| C-04 | Slow gentle | Long pause, soft cue | DAll (non-action) |
| C-05 | 1-step + probe | "How many steps?" (tap 1 or 2) | GA (over-extension) |
| C-06 | Clear 2-step | Repeated × 3, then reproduce | GAll (refuses linking) |
| C-07 | Extension | Mastered sequence + 1 | Eros |
| C-08 | Reversal | Changed sequence | Dishabituation |

**Adaptive selection:** IRT-based. Sequence length and complexity adapt to theta. Shadow probes at 20% rate post-baseline.

## 5. Technical Requirements

**Input:** Tap/swipe on interactive elements. Sequence recorded as ordered action list with timestamps.  
**Rendering:** 2–4 simple interactive objects (circles, squares) that change state on tap. Clear visual feedback for each action→outcome.  
**Scoring engine:** Sequence accuracy (edit distance). Order preservation (Kendall tau). Observation-gate compliance. Extension success rate. Reversal adaptation speed.  
**Data model:** Per-trial action sequence → sequence-theta → drive-health decomposition → shadow flags.  
**Accessibility:** Actions have redundant audio + haptic + visual feedback. Timing tolerance adjustable. Large touch targets.  
**Session persistence:** Checkpoint after every 8 trials. Resume from last checkpoint.
