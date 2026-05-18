# Somatic / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of somatic-relational experience as a window into genuine vs. performed sensitivity.  **Why this axis for this module:** How a player TALKS about body-knowledge reveals whether sensitivity is lived or borrowed — Green somatic depth shows in language that is specific, embodied, and relational rather than abstract or formulaic.

---

## 1. Game Identity

**Name:** Body Words
**Core loop:** Player is prompted to describe somatic-relational experiences in their own words. LLM evaluates depth, specificity, embodiment, and relational quality of language.
**Feel:** A contemplative journal — intimate, unhurried, reflective. The game listens to how you speak about your body-in-relation.
**Session length:** 3–6 minutes per prompt cluster. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst type:** Reflective prompts that invite articulation of somatic experience — the act of finding words for body-knowledge IS the developmental practice.
**Shadow surfacing:** GA surfaces as abstract/cosmic language without embodied specificity ("I feel the universal energy" with no body-detail). DAll surfaces as mechanical/instrumental language ("my heart rate was elevated" with no felt-sense). DA surfaces as merged language with no self/other distinction ("we were one body"). GAll surfaces as precise relational language that stops at a boundary ("I felt them but I stayed here").
**Drive probing:** Agency = linguistic self/other distinction. Communion = relational language richness. Eros = willingness to articulate edge-experiences. Agape = grounded return-language after relational description.

## 3. Game Design

**Mechanic 1 — Somatic Narration:** Player describes a presented somatic-relational scenario in free text. LLM scores for: embodied specificity (vs. abstraction), relational quality (vs. isolation), boundary clarity (vs. merger), depth (vs. surface).
**Mechanic 2 — Discrimination Prompts:** Two somatic experiences presented; player must articulate the DIFFERENCE in body-language. Reveals whether felt-sense vocabulary exists or is performed.
**Mechanic 3 — Relational Reflection:** After a co-regulation scenario (from other modalities), player reflects: "What did you feel in YOUR body? What do you think THEY felt?" Scoring compares self/other linguistic differentiation.
**Progression:** Simple body-description → relational narration → boundary articulation → edge-experience language → integration reflection.
**Rubric (LLM-scored):**
- Embodied specificity (0–4): vague → precise body-location and quality
- Relational depth (0–4): isolated → genuinely inter-subjective
- Boundary clarity (0–4): merged → differentiated-yet-connected
- Authenticity (0–4): formulaic/borrowed → lived/original

## 4. Item Pool

| Prompt type | Example | Shadow targeted |
|---|---|---|
| Body-description | "Describe what happens in your chest when someone near you is anxious" | DAll (instrumental) vs. DA (merged) |
| Discrimination | "How does YOUR tension differ from tension you pick up from others?" | DA (cannot distinguish) |
| Edge-articulation | "Describe a moment your body-sense extended beyond your skin" | GAll (refuses) vs. GA (performs) |
| Return-language | "After feeling another's state, how do you come back to yourself?" | DA (cannot return) |
| Relational-movement | "Describe moving WITH someone vs. moving FOR someone" | DAll (only 'for') |

Minimum pool: 60 prompts across 5 types, 3 difficulty tiers. LLM generates adaptive follow-ups based on player responses.

## 5. Technical Requirements

**Input:** Free-text entry (minimum 20 words, soft maximum 150 words per prompt).
**LLM integration:** Rubric-based scoring with 4 dimensions × 5-point scale. LLM receives prompt + response + rubric; returns scores + brief rationale (internal only).
**Telemetry:** Per-dimension scores, vocabulary richness index, self/other pronoun ratio, embodiment-word frequency, abstraction-word frequency.
**Scoring output:** Agency ← boundary-clarity score, Communion ← relational-depth score, Eros ← edge-articulation willingness, Agape ← embodied-specificity + return-language.
**Session data:** 4–6 prompts per session. Longitudinal vocabulary tracking across sessions.
**Privacy:** Player text stored locally only; LLM receives anonymised prompt-response pairs.
