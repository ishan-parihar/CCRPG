# Moral / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of moral reasoning — how the player talks about ethics reveals genuine contextual depth versus performed sophistication or paralytic relativism.  **Why this axis for this module:** Green moral capacity lives in the quality of ethical discourse; language reveals whether pluralism is embodied or merely conceptual.

---

## 1. Game Identity

**Name:** The Moral Voice
**Core loop:** Player responds verbally (text or voice-to-text) to ethical prompts. LLM evaluates moral reasoning quality across care-justice integration, contextual sensitivity, commitment clarity, and framework flexibility. Responses are scored on structural features of moral discourse, not content agreement.
**Session length:** 5–10 minutes (3–5 prompts per session).
**Infinite checkpoint:** Each prompt is self-contained; exit between any two.

## 2. Catalyst Delivery

**Catalyst frequency:** Green moral — articulated contextual ethics.
**Shadow provocation:** DA surfaces as hedging language ("it depends," "who's to say," "all perspectives are valid") without substantive engagement. DAll surfaces as absolutist language ("clearly wrong," "the principle is") without contextual acknowledgement. GA surfaces as meta-ethical jargon without genuine reasoning ("from a developmental perspective," "at this level of consciousness"). GAll surfaces as sophisticated relativism that explicitly refuses moral ranking.
**Drive probing:** Eros — prompts inviting reach toward unfamiliar ethical territory. Agape — prompts requiring return to concrete care. Agency — prompts demanding clear moral stance. Communion — prompts requiring genuine engagement with opposing moral views.
**Integration path:** Diagnosis (baseline moral discourse patterns) → Healing (prompts that make shadow-language visible through contrast) → Evolution (prompts requiring simultaneous care-justice articulation).

## 3. Game Design

**Mechanic:** Each prompt presents a brief ethical situation and asks an open-ended question ("What matters here?" / "What would you do and why?" / "What does this person owe?"). Player responds in 2–6 sentences. LLM rubric scores: (a) contextual acknowledgement, (b) care-orientation markers, (c) justice-orientation markers, (d) commitment language, (e) framework flexibility, (f) shadow-language flags.
**Adaptive difficulty:** Early prompts are culturally familiar; later prompts introduce cross-cultural ethical tensions, care-justice conflicts, and developmental-ranking invitations.
**Feedback:** No explicit scoring shown. Instead, follow-up prompts gently challenge detected shadow patterns — if DA detected, next prompt requires commitment; if DAll detected, next prompt requires contextual sensitivity.
**Progression:** Over sessions, player's moral discourse complexity is tracked. Growth = increasing integration of care+justice language with maintained commitment clarity.

## 4. Item Pool

**Pool structure:** 150+ ethical prompts across domains. Each prompt tagged with: primary shadow it surfaces, care-justice tension level, contextual complexity, cultural domain.
**Prompt types:** (a) Situated dilemmas — "Your friend did X in context Y. What matters?" (b) Framework challenges — "Someone argues Z. How do you respond?" (c) Commitment invitations — "What would YOU do?" (d) Ranking provocations — "Is this moral framework better than that one? Why?"
**LLM rubric:** Validated against expert moral-development raters. Inter-rater reliability ≥ 0.80 on structural features. Content-neutral — scores reasoning structure, not moral conclusions.
**Rotation:** Prompts cycle across domains; no repeat within 21 days.

## 5. Technical Requirements

**Input:** Text field (min 50 chars, max 500 chars) or voice-to-text with confirmation.
**LLM integration:** Rubric-based scoring via structured prompt. Model receives player response + scoring rubric; returns dimensional scores + shadow-flag confidence. No player data stored beyond session.
**Telemetry:** Per-response dimensional scores, shadow-flag activations, response latency, word count, revision behaviour (if text).
**Adaptive engine:** Shadow-detection requires convergent language patterns across 3+ responses. Prompt selection targets detected shadow with increasing directness over sessions.
**Accessibility:** Voice input for motor impairment; dyslexia-friendly fonts; no time pressure on responses.
