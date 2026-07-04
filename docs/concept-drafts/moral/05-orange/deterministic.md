# Moral / Orange — Deterministic Game Concept

> **Axis:** Objective measurement of principled moral reasoning accuracy, justification quality, and consistency.  **Why this axis for this module:** Orange moral capacity IS the ability to reason from principle — deterministic measurement isolates reasoning quality from verbal fluency, social pressure, or embodied response.

---

## 1. Game Identity

**Title:** The Principle Engine  
**Genre:** Timed moral-logic puzzles with branching justification trees  
**Session length:** 4–8 minutes (infinite checkpoint)  
**Core loop:** Receive dilemma → select principle → apply to case → justification chain scored → next dilemma escalates

The player faces moral scenarios stripped to logical structure. No emotional framing, no social pressure, no time for gut-response. Pure: "Given these principles and these facts, what follows?" Consistency across dilemmas is the primary metric.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange moral — principled reasoning under formal-operational logic  
**Shadow surfacing:** DA (calculator) surfaces when player optimises outcomes without principle-reference. DAll (conformist) surfaces when player defaults to "the rule says" without justification.  
**Progression:** Diagnosis (sessions 1–3) → Healing (4–8) → Evolution (9+)

Healing catalyst: dilemmas where pure calculation produces morally repugnant outcomes force the calculator to feel. Dilemmas where "the rule" produces injustice force the conformist to reason. Evolution catalyst: dilemmas where principles genuinely conflict invite contextual reasoning.

## 3. Game Design

**Mechanics:**
- Dilemma cards present facts + stakeholders + competing claims
- Player selects from a principle-bank (social contract, universal rights, utility, duty, fairness)
- Player applies selected principle via a justification chain (3–5 logical steps)
- Scoring: consistency (same principle applied to structurally identical cases), justification depth (valid logical steps), principle-appropriateness (does the principle address the moral dimension at stake?)

**Difficulty staircase:**
- Level 1: Single-principle dilemmas (one principle clearly applies)
- Level 2: Two-principle dilemmas (player must choose and justify)
- Level 3: Hidden-information dilemmas (facts revealed mid-reasoning)
- Level 4: Structurally isomorphic pairs (consistency test)
- Level 5: Principle-conflict dilemmas (genuine Orange ceiling)

**Shadow-specific mechanics:**
- DA probe: dilemmas where utilitarian calculation is available but morally insufficient
- DAll probe: dilemmas where conventional rules exist but produce injustice
- GA probe: options to claim "it depends" without providing principled reasoning
- GAll probe: dilemmas where rigid principle application harms a particular person

## 4. Item Pool

- 120 base dilemmas across 6 moral domains (rights, fairness, care, liberty, authority, sanctity)
- 40 structurally isomorphic pairs for consistency measurement
- 20 hidden-information variants per base dilemma
- 8 principle-bank entries with formal definitions
- Justification-chain templates (deductive, analogical, contractual, consequential)
- Adaptive difficulty parameters: information complexity, stakeholder count, principle-conflict intensity

## 5. Technical Requirements

- Deterministic scoring engine: no LLM in the scoring loop
- Justification-chain validator: formal logic checker for step validity
- Consistency tracker: cross-session pattern matching for structurally similar dilemmas
- Isomorphism detector: ensures player faces matched pairs without recognising the match
- Drive-health scoring: maps reasoning patterns to DA/DAll/GA/GAll signatures
- Theta-decay: 18-day half-life on moral-reasoning scores; neglect degrades capacity rating
