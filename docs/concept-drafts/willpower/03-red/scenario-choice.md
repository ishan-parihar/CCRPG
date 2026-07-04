# Willpower / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes willpower capacity through VOLITIONAL DILEMMAS — situations where the player must choose between competing commitments, between short-term and long-term goals, between easy and hard paths. This modality accesses the DECISION dimension of will: not "can you sustain effort" but "can you CHOOSE what to will wisely?"
>
> **Why this axis for Willpower/Red:** At Red, volitional choices are concrete and immediate: "Do I take the easy reward now or hold for the bigger one?" "Do I keep my vow or break it for advantage?" "Do I push through fatigue or rest?" The scenario-choice axis tests whether the player can make WISE decisions about their own will — not just fire it blindly.

---

## 1. Game Identity

- **Title:** "The Vow-Breaker's Trial"
- **Core mechanic:** The player faces volitional dilemmas — situations where two valid commitments conflict, where short-term and long-term goals compete, where the cost of commitment must be weighed against the cost of abandonment — and must choose what to will.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Binary Vows → Weighted Choices → Competing Commitments → Vow-Revision → The Impossible Vow

---

## 2. Catalyst Delivery

**Catalyst:** The game presents situations where WILLING ITSELF is the problem — not "can you will?" but "WHAT should you will?" Two valid goals conflict. A vow becomes costly. A commitment requires revision. The contact boundary is: "Can you make wise decisions about your own will?"

**Unconscious response:**
- *Submergent:* The player's relationship to volitional choice surfaces. Do they cling to every vow regardless of cost (dark-addiction)? Abandon vows at the first difficulty (dark-allergy)? Choose the "disciplined" option regardless of context (golden-addiction)? Refuse to commit to anything that might require revision (golden-allergy)?
- *Emergent:* The pull toward volitional wisdom — can they hold commitment AND flexibility simultaneously?

**Integration path:** The game rewards WISE volitional choices — not always "keep the vow" and not always "break the vow" but the contextually appropriate response. Sometimes keeping is wise. Sometimes breaking is wise. Sometimes revising is wisest. The will learns: wisdom is not rigidity.

**Successful integration:** The player demonstrates volitional wisdom — keeps vows when keeping serves growth, breaks vows when breaking serves growth, and revises vows when conditions change — all with conscious awareness of WHY.

---

## 3. Game Design

### Setup
The Vow-Breaker's Trial: a ritual judgment space where warriors face volitional dilemmas. The War-Sage NPC presents scenarios — two paths, two vows, two commitments — and the player must choose. The aesthetic: Red-stage throne room, judgment seat, two doors/paths/weapons representing choices. Firelight, tension, the weight of decision.

### Interaction
- **Binary Vows:** "Two paths. One easy, one hard. Which do you vow to take?" Simple either/or with clear trade-offs.
- **Weighted Choices:** "Both paths have value. One gives power now, one gives more power later." Delay-of-gratification framing.
- **Competing Commitments:** "You vowed to take the hill AND protect your ally. You cannot do both. Which vow do you keep?"
- **Vow-Revision:** "You vowed to hold for 30 seconds. At 20 seconds, the situation changes. Do you revise or hold?"
- **The Impossible Vow:** "Both options require breaking a vow. Which vow is more important? Why?"

### Feedback
- Wise choice → War-Sage nods: "You chose well. Your will serves you, not the other way around."
- Rigid choice → War-Sage questions: "You kept your vow. But was keeping it wise? Or was it fear of breaking?"
- Avoidant choice → War-Sage challenges: "You chose the easy path. Was that wisdom or weakness?"
- The game ALWAYS explains WHY a choice was wise or unwise (contextual reasoning)

### Difficulty Adaptation
- Choice complexity: binary → weighted → competing → revision → impossible
- Ambiguity: clear right answer → both valid → no right answer
- Cost: low-stakes → moderate-stakes → high-stakes
- Time pressure: unlimited → moderate → urgent
- Emotional loading: neutral → personally relevant → identity-challenging

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Binary Vows | 1-5 | Clear either/or; one option is clearly better; low stakes |
| Weighted Choices | 5-15 | Both options valid; trade-offs visible; delay-of-gratification |
| Competing Commitments | 15-30 | Two vows conflict; must break one; contextual reasoning required |
| Vow-Revision | 30-50 | Conditions change mid-commitment; revision vs. rigidity |
| The Impossible Vow | 50+ | No clean answer; both options cost; wisdom under uncertainty |

---

## 4. Item Pool

### Item types
- **Binary scenarios:** Two-option volitional choices with clear trade-offs
- **Weighted scenarios:** Delay-of-gratification dilemmas (now vs. later)
- **Conflict scenarios:** Two valid commitments that cannot both be honoured
- **Revision scenarios:** Situations where conditions change mid-vow
- **Impossible scenarios:** Dilemmas with no clean resolution

### Minimum pool size
- 30+ binary scenarios (varied domains: combat, alliance, resource, territory)
- 25+ weighted scenarios (varied delay lengths and reward differentials)
- 20+ conflict scenarios (varied commitment types and costs)
- 15+ revision scenarios (varied change-types and revision-costs)
- 10+ impossible scenarios (varied ethical/volitional tensions)

### Generation rules
- Scenarios generated from domain × stakes × ambiguity parameters
- Difficulty = ambiguity × stakes × time-pressure
- All scenarios must have at least one defensible choice (no pure lose-lose at early levels)
- Scenarios must be CONCRETE and RED-STAGE appropriate (power, territory, combat, alliance)
- Revision scenarios must have clear "before" and "after" conditions

### Drive/shadow mapping
- Rigid self-priority in conflict → Agency dark probing
- Decision paralysis on ambiguous choices → Agency golden probing
- Automatic compliance with ally's choice → Communion dark probing
- Self-priority over group-benefit → Communion golden probing
- Compulsive escalation after completion → Eros dark probing
- Grandiose commitment beyond capacity → Eros golden probing
- Dismissal of simple vows → Agape dark probing
- Vow-keeping rate >95% regardless of context → dark-addiction signal
- Decision latency >3× average → dark-allergy signal
- Always choosing structured option → golden-addiction signal
- Always choosing shorter commitment → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Choice selection (tap to choose between options)
- Optional text/voice (explain reasoning — bonus scoring)
- Timed selection (some scenarios have time pressure)
- Revision input (change a previous choice when conditions change)

### Timing requirements
- Decision latency measured (diagnostic — too fast = impulsive; too slow = paralysed)
- Time pressure varies by scenario (some urgent, some reflective)
- No millisecond precision needed (seconds-level measurement)

### NPC/AI requirements
- War-Sage NPC: presents scenarios, evaluates choices, provides wisdom
- Must respond to player's ACTUAL choice with contextual feedback
- Must detect shadow-patterns across choices and adjust scenarios
- Ally NPCs: appear in relational scenarios (have their own goals/vows)

### LLM requirements
- **High:** Scenario generation, choice evaluation, feedback generation
- Generates volitional dilemmas appropriate to Red-stage (concrete, power-framed)
- Evaluates contextual wisdom of choices (not binary right/wrong)
- Provides feedback that explains WHY a choice was wise or unwise
- Adapts scenario difficulty and type to player's demonstrated patterns

### State persistence
- Choice history (all decisions with context and reasoning)
- Choice-quality trend (improving, stable, declining)
- Decision-speed patterns (for shadow detection)
- Vow-keeping/breaking ratio (for dark-addiction detection)
- Commitment-duration preferences (for golden-allergy detection)
- Structure-preference patterns (for golden-addiction detection)
- Drive-health signals from choice patterns
- Shadow signals from decision patterns
- Checkpoint position and phase
