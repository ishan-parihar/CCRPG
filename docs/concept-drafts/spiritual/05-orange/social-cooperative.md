# Spiritual / Orange — Social-Cooperative Game Concept

> **Axis:** Shared meaning-making — group philosophical inquiry, responding to others' meaning-claims.  **Why this axis for this module:** Orange rational examination can become solipsistic; this modality tests whether the player can hold their examined meaning in genuine dialogue without collapsing into agreement or retreating into fortress.

---

## 1. Game Identity

**Title:** The Symposium  
**Core loop:** Player engages in simulated philosophical dialogue with AI interlocutors who hold different meaning-frameworks. Must respond to challenges, acknowledge valid points, maintain examined position, and revise when genuinely moved.  
**Feel:** A Socratic circle — intellectually alive, respectful but rigorous. The player is among peers who take meaning seriously.  
**Session length:** 5–8 minutes. Infinite checkpoint between dialogue rounds.

## 2. Catalyst Delivery

**Catalyst type:** Others' meaning-claims that challenge the player's framework — forcing genuine engagement rather than dismissal, agreement, or fortress-defense.  
**Shadow activation:** GA surfaces as premature agreement with every interlocutor ("Yes, that's valid too!") without genuine rational engagement. GAll surfaces as refusal to be moved by any argument ("My position is the rational one, period"). DA surfaces as dismissing all interlocutors' meaning-claims as irrational. DAll surfaces as deferring to the most authoritative-sounding voice.  
**Integration path:** Catalyst (another's meaning-claim) → experience (genuine engagement with the claim) → integration (position refined through dialogue without collapse or rigidity).

## 3. Game Design

**Mechanic 1 — Dialogue Rounds:** AI interlocutors present meaning-claims from different traditions/frameworks. Player must respond: engage, challenge, acknowledge, or integrate. Scored on quality of engagement, not agreement.  
**Mechanic 2 — Position Tracking:** System tracks the player's stated position across rounds. Detects: rigid non-movement (GAll/DA), over-accommodation (GA), authority-deference (DAll), and genuine revision (healthy).  
**Mechanic 3 — Collaborative Synthesis:** After individual dialogue, player must co-construct a shared meaning-statement with interlocutors. Tests whether player can hold their examined position while genuinely incorporating others' insights.  
**Difficulty staircase:** Level 1: interlocutors with clearly different but non-threatening positions. Level 2: interlocutors who directly challenge the player's stated values. Level 3: interlocutors who are partially right in ways that require genuine revision. Level 4: interlocutors who embody the player's shadow (e.g., a DA player faces a deeply rational mystic).  
**Drive probing:** Agency = maintaining examined position under social pressure. Communion = genuine openness to being changed by dialogue. Eros = reaching toward synthesis that transcends individual positions. Agape = grounding dialogue in shared human experience.

## 4. Item Pool

**Category A — Challenge Dialogues (35%):** Interlocutors who directly challenge the player's meaning-framework. Scored on engagement quality — neither dismissal nor capitulation.  
**Category B — Acknowledgment Tasks (25%):** Interlocutors who make valid points the player must acknowledge without abandoning their own position. Tests the Agency-Communion balance.  
**Category C — Authority Resistance (20%):** Interlocutors who speak with great confidence/authority. Tests DAll (will player defer?) and DA (will player dismiss based on tone rather than content?).  
**Category D — Collaborative Construction (20%):** Joint meaning-making tasks requiring genuine synthesis. Tests GA (is synthesis real or performed?) and GAll (can player contribute to shared meaning?).  
**Adaptive selection:** Interlocutor frameworks selected to target detected shadow. DA players face compelling non-rational meaning-makers. GA players face rigorous logicians who demand precision.

## 5. Technical Requirements

**Scoring engine:** LLM-powered dialogue evaluation. Rubric dimensions: engagement depth (0–4), position integrity (0–4), genuine revision (0–4), collaborative capacity (0–4). Shadow indicators from dimensional patterns.  
**Response format:** Free-text dialogue responses. Multiple-choice for quick-response rounds. Synthesis statements for collaborative tasks.  
**State persistence:** Dialogue history, position-evolution tracking, engagement-quality scores, shadow-activation profile, interlocutor-relationship states.  
**Cross-modality hooks:** Imports self-authorship from language-reflective and choice-consistency from scenario-choice. Exports collaborative-capacity to immersive-rpg (does social meaning-making appear spontaneously?).  
**Performance:** LLM dialogue generation <2s. Scoring async (3s). Interlocutor responses feel conversational, not delayed.
