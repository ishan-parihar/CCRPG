# Willpower × Infrared — Scenario-Choice Game

## 1. Game Identity

**Title:** Which Need First
**Modality:** Scenario-Choice (survival-mobilisation choices)
**Unique Lateral:** Which need to pursue when multiple compete. At Infrared, this is not "planning" — it is the body's triage: when hungry AND cold, which way does the organism turn? Pre-deliberative priority selection.
**Core Loop:** Multiple need-cues present simultaneously → player mobilises toward one → consequence reveals whether body-priority was honoured → next scenario.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Always mobilises toward the same need regardless of urgency. Cannot shift priority. Locked onto one drive-channel.
- **DAll (Drive-Collapse):** Fails to mobilise toward ANY need when multiple compete. Overwhelm → freeze. Choice-paralysis at the survival level.
- **GA (Premature Wishing):** Selects the "easiest" or most distant need — the one requiring least immediate mobilisation. Avoids the urgent-body-now.
- **GAll (Drive Fortress):** Always selects the most survival-critical need even when a slightly novel option would serve equally well. Refuses any choice that edges toward want.

**Drive Probes:**
- Eros: Scenarios where a slightly novel need-source is available alongside familiar. Does the organism reach?
- Agape: Scenarios where the most urgent need is REST. Does the organism honour stillness as a need?
- Agency: Scenarios with no external urgency cue — player must feel which need is primary.
- Communion: Scenarios where another entity's need is visible alongside own. Does shared-need influence priority?

## 3. Game Design

**Mechanics:** Split screen shows 2–3 need-sources (water pool, warm cave, food pile). A creature (avatar) stands at centre. Player swipes/taps toward chosen source. Creature mobilises. Need-meter fills. Simple visual feedback — no text, no numbers.

**Progression:**
- Phase 1: Two needs, one clearly more urgent (creature visibly shivering near water and fire). Baseline triage.
- Phase 2: Two needs of similar urgency. Body-priority emerges.
- Phase 3: Three competing needs. Triage under mild pressure.
- Phase 4: Familiar need vs. novel source. Emergence-willingness measured.

**Infinite Checkpoint:** Each scenario is a checkpoint. 1–30 scenarios per session.

**Adaptive Difficulty:** Need-urgency differences narrow. Number of competing needs increases (max 3). Novel sources introduced gradually.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| WN-01 | Clear priority | One need at 80%, other at 30% | Baseline |
| WN-02 | Equal urgency | Both needs at 60% | DAll detection |
| WN-03 | Repeated same-need | Same high-priority 3× in row, then shift | DA detection |
| WN-04 | Rest-as-need | Stillness option alongside active needs | Agape probe |
| WN-05 | Novel source | Unfamiliar icon satisfies known need | GAll detection |
| WN-06 | Distant-easy option | Far but effortless vs. near but effortful | GA detection |
| WN-07 | Self-sensed priority | No visual urgency cues, body-feel only | Agency probe |
| WN-08 | Shared-need scenario | Another creature's need visible | Communion probe |
| WN-09 | Reaching scenario | Source slightly beyond familiar range | Eros probe |

## 5. Technical Requirements

**Inputs:** Swipe direction or tap on target. Simple directional choice.
**Timing:** Choice latency measured (ms). Hesitation patterns tracked.
**Metrics Captured:** Choice latency, choice consistency (entropy across sessions), priority-shift flexibility, novel-source selection rate, rest-selection rate, shared-need response rate.
**Adaptive Engine:** Urgency differentials calibrate based on player's discrimination threshold. Shadow scores from choice-pattern analysis over rolling 10-scenario window.
**Session Length:** 30–150 seconds. Minimum 6 scenarios for valid scoring.
**Accessibility:** Large touch targets, high-contrast need icons, optional audio urgency cues (heartbeat speed indicates need-level).
