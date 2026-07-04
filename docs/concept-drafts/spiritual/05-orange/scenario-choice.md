# Spiritual / Orange — Scenario-Choice Game Concept

> **Axis:** Meaning dilemmas where rational examination conflicts with comfort, or achievement-meaning conflicts with deeper purpose.  **Why this axis for this module:** Orange spiritual development is forged in genuine dilemma — moments where rational honesty costs something, where examined meaning conflicts with inherited comfort.

---

## 1. Game Identity

**Title:** The Crucible of Meaning  
**Core loop:** Player faces narrative scenarios where their meaning-framework is tested by genuine dilemmas — situations where rational examination leads somewhere uncomfortable, or where achievement-meaning collides with deeper purpose.  
**Feel:** A philosophical novel you inhabit — each scenario is a lived thought-experiment with real emotional weight. Consequences ripple.  
**Session length:** 5–10 minutes per scenario. Infinite checkpoint between scenarios.

## 2. Catalyst Delivery

**Catalyst type:** Dilemmas that force the player to choose between competing meaning-sources, revealing which shadows govern their meaning-making under pressure.  
**Shadow activation:** DAll surfaces when player chooses comfort over honest examination ("I'd rather not know"). DA surfaces when player eliminates meaning to avoid vulnerability ("None of this matters anyway"). GA surfaces when player resolves dilemma by premature synthesis without genuine engagement. GAll surfaces when player insists on single rational resolution despite genuine ambiguity.  
**Integration path:** Catalyst (dilemma) → experience (felt cost of the choice) → integration (player holds the tension without collapsing into shadow).

## 3. Game Design

**Mechanic 1 — Binary Crucibles:** Two-option dilemmas where each option represents a different meaning-commitment. No "correct" answer — scoring is on consistency with stated values AND willingness to bear the cost.  
**Mechanic 2 — Escalating Stakes:** Initial dilemmas are abstract. Later dilemmas involve characters the player has invested in, raising emotional stakes. Tests whether rational examination persists under affective load.  
**Mechanic 3 — Consequence Revelation:** After choice, the system reveals downstream consequences. Player then faces: do they stand by examined choice, or revise? Scored on appropriate revision (not rigidity, not capitulation).  
**Difficulty staircase:** Level 1: abstract philosophical dilemmas. Level 2: personal-stakes dilemmas. Level 3: dilemmas where all options have genuine cost. Level 4: dilemmas directly targeting the player's detected shadow quadrant.  
**Drive probing:** Agency = standing by examined choice despite social pressure. Communion = acknowledging the validity of the unchosen path. Eros = reaching toward resolution that transcends the binary. Agape = grounding choice in embodied consequence.

## 4. Item Pool

**Category A — Examination vs. Comfort (30%):** Scenarios where honest rational inquiry leads to uncomfortable conclusions. Tests DAll (will player examine?) and DA (will player allow non-rational meaning to survive examination?).  
**Category B — Achievement vs. Purpose (25%):** Scenarios where achievement-meaning ("I matter because I succeed") conflicts with deeper purpose. Tests the Orange trap of meaning-through-accomplishment.  
**Category C — Singular vs. Plural (25%):** Scenarios where multiple valid meaning-frameworks exist. Player must navigate without collapsing into GAll (one answer) or GA (all answers equally valid).  
**Category D — Integration Scenarios (20%):** Complex multi-factor dilemmas requiring all four drives in healthy expression. Only presented after shadow-profile is established.  
**Adaptive selection:** Scenarios selected based on shadow-activation profile. Disruption severity calibrated to current capacity.

## 5. Technical Requirements

**Scoring engine:** Choice-pattern analysis + LLM evaluation of optional free-text justification. Consistency scoring against prior choices and stated values from language-reflective.  
**Response format:** Forced-choice (binary/ternary) + optional free-text justification (LLM-scored for depth).  
**State persistence:** Full choice history, consequence chains, consistency matrix, shadow-activation profile, narrative-state for recurring characters.  
**Cross-modality hooks:** Imports self-authorship score from language-reflective and logical-consistency from deterministic. Exports choice-consistency to strategic-planning and social-cooperative.  
**Performance:** Scenario rendering immediate. LLM justification-scoring async (3s). Consequence calculation deterministic and local.
