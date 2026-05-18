# Cognitive / Orange — Scenario-Choice Game Concept

> **Axis:** Cognitive dilemmas requiring hypothetical-deductive reasoning under pressure — branching problems where the player must reason about possibilities.  **Why this axis for this module:** Orange cognition's signature is reasoning about what COULD be, not just what IS; scenario-choice forces the player to generate and evaluate hypotheticals under consequence.

---

## 1. Game Identity

**Title:** The Hypothesis Engine  
**Core Mechanic:** Branching scenario problems where the player must form hypotheses, design tests, interpret evidence, and commit to conclusions — each choice narrows or expands the possibility space. Wrong hypotheses have visible consequences.  
**Duration:** 6–12 minutes per scenario, infinite checkpoint between scenarios.  
**Internal Progression:** Observer → Hypothesiser → Experimenter → Theorist (generates novel hypotheses the system hasn't prompted).

## 2. Catalyst Delivery

**Unique Presentation:** Mystery-investigation scenarios — strange phenomena in a world that operates on discoverable rules. The player is a rational investigator. No correct answer is given; the player must DEDUCE it.  
**Differs from others:** Not measuring raw cognitive speed (deterministic), not measuring self-awareness (language-reflective), not measuring body (embodied), not measuring planning over time (strategic), not measuring collaboration (social), not measuring ecological spontaneity (immersive). This is pure hypothetical-deductive reasoning under branching consequence.  
**Uniquely Surfaces:** GAll (the player who insists on ONE hypothesis and refuses to consider alternatives — "I know the answer" before evidence is complete) and DAll (the player who refuses to form hypotheses at all — "just tell me what to do").  
**Successful Integration:** Player generates multiple hypotheses, designs discriminating tests, updates beliefs on evidence, and commits to conclusions while holding them as revisable.

## 3. Game Design

**Setup:** A scenario presents an anomaly — something that doesn't fit known rules. The player must investigate by choosing actions that generate evidence.

**Interaction Phases:**
1. **Anomaly Presentation** — The phenomenon is described; player observes initial conditions
2. **Hypothesis Generation** — Player selects or generates 2–4 possible explanations
3. **Test Design** — Player chooses actions that would discriminate between hypotheses
4. **Evidence Interpretation** — Results arrive; player must update probability assignments
5. **Commitment** — Player commits to a conclusion and acts on it; consequences reveal accuracy

**Feedback Examples:**
1. Hypothesis confirmed by evidence: world responds coherently, new anomaly unlocked
2. Hypothesis disconfirmed: visible consequence (not punitive — informative), player must revise
3. Premature commitment (GAll): consequence reveals unconsidered alternative
4. Refusal to hypothesise (DAll): scenario stalls, gentle prompt — "What MIGHT explain this?"
5. Elegant deduction: scenario resolves with narrative satisfaction, efficiency bonus

**Difficulty Adaptation:** Number of plausible hypotheses (2→5), evidence ambiguity (clear→noisy), red herrings (0→3), time pressure (none→moderate), causal chain length (1→4 steps).

**Internal Progression Table:**

| Level | Hypotheses | Evidence Quality | Red Herrings | Chain Length | Time Pressure |
|---|---|---|---|---|---|
| Observer | 2 (given) | Clear | 0 | 1 step | None |
| Hypothesiser | 3 (given) | Moderate noise | 1 | 2 steps | Light |
| Experimenter | 3–4 (player-generated) | Noisy | 2 | 3 steps | Moderate |
| Theorist | 4–5 (player-generated) | Ambiguous | 3 | 4 steps | Moderate |

## 4. Item Pool

**Anomaly Scenarios (25+):** Mechanical failures, ecological mysteries, social puzzles, physical phenomena, logical paradoxes — all solvable via formal-operational deduction, none requiring domain expertise.  
**Hypothesis Templates (20+):** Causal ("X causes Y"), correlational ("X and Y share cause Z"), conditional ("If A then B, unless C"), eliminative ("Not X, not Y, therefore Z"), analogical ("Like W, so probably V").  
**Test Actions (30+):** Observe variable in isolation, introduce perturbation, measure correlation, seek counter-example, replicate under different conditions, control for confound.  
**Evidence Types (15+):** Confirming, disconfirming, ambiguous, misleading, partial, delayed, contradictory, converging, diverging.  
**Consequence Scenarios (20+):** Correct deduction → world responds coherently; premature commitment → unexpected failure; over-caution → opportunity cost; elegant solution → narrative reward.

## 5. Technical Requirements

**Input Types:** Multiple-choice for hypothesis selection, drag-to-rank for probability assignment, tap-to-choose for test actions, free-text for player-generated hypotheses (advanced levels).  
**Timing:** No hard time limit on reasoning phases. Soft pressure via narrative urgency at higher levels. Evidence-gathering actions consume in-game resources.  
**NPC/AI:** Scenario narrator — presents anomalies and consequences. Not Socratic (that's language-reflective) but responsive to player choices.  
**LLM:** At advanced levels, evaluates player-generated hypotheses for logical validity and novelty. Generates adaptive scenario branches based on player's reasoning pattern.  
**State Persistence:** Hypothesis accuracy rate, evidence-utilisation efficiency, premature-commitment frequency, hypothesis-revision willingness, GAll/DAll pattern tracking across scenarios.
