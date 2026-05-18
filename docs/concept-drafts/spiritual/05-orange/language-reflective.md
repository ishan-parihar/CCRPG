# Spiritual / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of meaning-making — how the player talks about purpose/meaning reveals depth vs. performance.  **Why this axis for this module:** Orange spiritual capacity requires self-authored language; borrowed phrases from tradition (DAll) or performed pluralism (GA) are immediately visible in how someone articulates meaning.

---

## 1. Game Identity

**Title:** The Meaning Forge  
**Core loop:** Player responds to open-ended prompts about purpose, meaning, and ultimate concern. LLM evaluates linguistic markers of genuine rational examination vs. borrowed/performed/rigid meaning-language.  
**Feel:** A contemplative journal that responds — intimate, non-judgmental, progressively deeper. The game listens and reflects back what it hears.  
**Session length:** 3–7 minutes. Infinite checkpoint after each prompt-response pair.

## 2. Catalyst Delivery

**Catalyst type:** Prompts that invite articulation of meaning at increasing depth, with follow-up probes that test whether the articulation is genuinely self-authored.  
**Shadow activation:** DAll surfaces as tradition-borrowed language without personal ownership ("God has a plan"). DA surfaces as dismissive reduction ("meaning is a neurochemical illusion"). GA surfaces as performed sophistication ("all traditions point to the same truth") without personal grounding. GAll surfaces as rigid singular conclusions ("reason proves X is the only valid meaning").  
**Integration path:** Catalyst (prompt) → experience (player hears their own language reflected) → integration (player refines articulation toward genuine self-authorship).

## 3. Game Design

**Mechanic 1 — Depth Prompts:** Open-ended questions about meaning/purpose. Scored on linguistic markers: self-referential ownership, logical structure, tolerance of ambiguity, specificity vs. generality.  
**Mechanic 2 — Probe Sequences:** Follow-up questions that test depth of initial responses. "You said X — what do you mean by that?" "What evidence would change your mind?" "Where did that idea come from?"  
**Mechanic 3 — Language Mirror:** System reflects back the player's language patterns (without judgment) and asks if the reflection feels accurate. Surfaces gap between intended meaning and actual articulation.  
**Difficulty staircase:** Early prompts are broad ("What matters to you?"). Later prompts target specific tensions ("How do you hold purpose in a universe without inherent meaning?"). Advanced prompts create direct shadow-confrontation ("Describe a belief you hold that you cannot rationally justify").  
**Drive probing:** Agency = unique personal voice. Communion = acknowledgment of others' meaning-claims. Eros = reaching toward larger frameworks. Agape = grounding in concrete lived experience.

## 4. Item Pool

**Category A — Open Articulation (35%):** Broad meaning-prompts scored on depth, ownership, logical coherence, and specificity.  
**Category B — Probe Chains (30%):** 3–5 follow-up questions testing whether initial articulation has genuine depth or is surface performance.  
**Category C — Tradition Identification (20%):** Prompts surfacing the player's relationship to inherited meaning-frameworks. Scored on capacity to name tradition's influence AND hold it at rational distance.  
**Category D — Contradiction Navigation (15%):** Prompts presenting the player with tensions in their own prior responses. Scored on capacity to hold paradox without collapsing into rigidity or relativism.  
**Adaptive selection:** LLM selects follow-up probes based on linguistic markers detected in prior responses. Shadow-targeted probing when activation threshold is reached.

## 5. Technical Requirements

**Scoring engine:** LLM-powered rubric evaluation. Dimensions: self-authorship (0–4), logical coherence (0–4), ambiguity tolerance (0–4), specificity (0–4), tradition-awareness (0–4). Shadow indicators derived from dimensional patterns.  
**Response format:** Free-text (voice or typed). Minimum 20 words, no maximum.  
**State persistence:** Full response history, running rubric scores, shadow-activation profile, linguistic-marker evolution over sessions.  
**Cross-modality hooks:** Imports logical-consistency theta from deterministic (does language match logic?). Exports self-authorship score to scenario-choice (do choices match articulated values?).  
**Performance:** LLM scoring async — player receives next prompt immediately. Scoring completes within 3s. Fallback to keyword-rubric if LLM unavailable.
