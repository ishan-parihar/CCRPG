# Spiritual / Green — Scenario-Choice Game Concept

> **Axis:** Faith dilemmas where traditions conflict, or pluralism conflicts with commitment to practice.  **Why this axis for this module:** Pluralistic faith is easy when traditions agree — the real test is what happens when they genuinely contradict, or when honoring many paths conflicts with going deep in one.

---

## 1. Game Identity

**Name:** The Crossroads Temple  
**Core loop:** Player encounters narrative scenarios where spiritual traditions conflict, where pluralistic values clash with depth-commitment, or where interfaith appreciation is tested by real-world consequences. Each scenario presents 3–5 response options spanning the shadow spectrum. Choice patterns reveal drive-health and shadow-activation.  
**Session length:** 4–6 minutes (2–3 scenarios per session).  
**Infinite checkpoint:** Scenarios drawn from an expanding pool; narrative threads persist across sessions, with consequences of earlier choices shaping later dilemmas.

## 2. Catalyst Delivery

**Catalyst type:** Moral-spiritual dilemmas that force the player to ACT on their pluralistic faith rather than merely profess it.  
**Shadow surfacing:** DA surfaces when player consistently avoids commitment choices — "I'd explore both" when the scenario demands choosing one. DAll surfaces when player dismisses the spiritual dimension — choosing purely pragmatic options that ignore sacred significance. GA surfaces when player resolves contradictions too quickly — "they're really saying the same thing" when they demonstrably aren't. GAll surfaces when player refuses to acknowledge that one tradition's approach might be more developed.  
**Drive probes:** Eros probed by scenarios offering integral resolution (do you reach for it or stay in plurality?). Agape probed by scenarios requiring return to a single tradition's depth. Agency probed by scenarios requiring personal spiritual stance against social pressure. Communion probed by scenarios requiring genuine interfaith collaboration.

## 3. Game Design

**Scenario types:** (a) Tradition-conflict: two traditions give contradictory guidance on the same life situation (e.g., Buddhist non-attachment vs. Christian sacrificial love regarding a dying parent). (b) Depth-vs-breadth: player must choose between deepening one practice or exploring a new tradition. (c) Social-pressure: community expects single-tradition loyalty; player must navigate pluralistic faith in a mono-faith context. (d) Hierarchy-test: a situation where one tradition's approach is clearly more developed — does the player acknowledge this? (e) Commitment-test: a tradition demands exclusive practice for a period — does the player commit or hedge?  
**Choice architecture:** Each scenario offers options mapping to: healthy pluralism, DA (avoidance-through-sampling), DAll (rational dismissal), GA (premature synthesis), GAll (enforced equality), and integrated response. Options are narratively natural — never labeled.  
**Consequence system:** Choices have downstream effects in future scenarios. Commitment choices open deeper narrative threads. Avoidance choices lead to shallower but broader scenarios. The game mirrors the player's spiritual pattern back through narrative structure.

## 4. Item Pool

**Scenario bank:** 100+ scenarios across 5 types, each with 3–5 response options. Scenarios tagged by: primary shadow-target, drive-probe, difficulty, traditions-involved, and prerequisite-scenarios.  
**Tradition pairs:** Scenarios cover all major tradition-pairings (Buddhist-Christian, Hindu-Islamic, Indigenous-Abrahamic, Taoist-Sufi, etc.) to prevent tradition-bias in assessment.  
**Difficulty progression:** Level 1: obvious pluralism-tests (easy to be tolerant). Level 2: genuine contradictions that resist easy resolution. Level 3: situations where pluralism itself becomes the problem. Level 4: scenarios requiring acknowledgment of depth-hierarchy. Level 5: integration scenarios requiring simultaneous depth, breadth, and hierarchy-tolerance.  
**Narrative threads:** 12 persistent storylines that branch based on choices, each exploring a different facet of pluralistic faith under pressure.

## 5. Technical Requirements

**Choice tracking:** Full decision-tree with branching consequences. Each choice scored on 4 shadow dimensions + 4 drive dimensions simultaneously.  
**Scoring:** Pattern-based rather than per-choice. Single choices are ambiguous; patterns across 10+ scenarios reveal stable shadow-activation. Bayesian updating of shadow-probability after each choice.  
**Adaptive difficulty:** Scenario selection based on current shadow-profile — if DA is dominant, more commitment-demanding scenarios appear. If player is integrated, scenarios increase in subtlety and genuine difficulty.  
**Telemetry:** Choice distributions across shadow-options, response-time per choice (hesitation = conflict = diagnostic signal), narrative-thread depth (how far player goes before abandoning), drive-health composite from choice-patterns.  
**Content generation:** Scenario pool expandable via LLM-assisted authoring with human curation. Core scenarios hand-crafted; variations generated adaptively.
