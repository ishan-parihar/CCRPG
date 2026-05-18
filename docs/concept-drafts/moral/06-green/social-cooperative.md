# Moral / Green — Social-Cooperative Game Concept

> **Axis:** Shared moral reasoning — group ethical deliberation across different moral frameworks.  **Why this axis for this module:** Green moral capacity is inherently relational; genuine pluralism requires holding multiple moral voices in dialogue, not just internally but with actual others.

---

## 1. Game Identity

**Name:** The Ethics Circle
**Core loop:** Player participates in group moral deliberation with AI-simulated co-participants who embody different moral frameworks (care-oriented, justice-oriented, contextual, principled). Player must facilitate or contribute to genuine ethical dialogue that honours multiple perspectives without collapsing into relativism or domination.
**Session length:** 8–12 minutes (1 deliberation round per session).
**Infinite checkpoint:** Save between deliberation phases; resume at next phase.

## 2. Catalyst Delivery

**Catalyst frequency:** Green moral — relational contextual ethics.
**Shadow provocation:** DA surfaces as excessive deference to group — "everyone's perspective is equally valid," refuses to contribute own moral voice. DAll surfaces as domination — insists on universal principles, dismisses care-oriented participants, cannot genuinely hear contextual reasoning. GA surfaces as premature synthesis — "I can see how all of you are right at your level" without genuine engagement. GAll surfaces as blocking consensus — refuses to acknowledge that the group might reach a better moral position than any individual.
**Drive probing:** Eros — contributing ideas that elevate the group's moral reasoning. Agape — returning to care for specific participants' perspectives. Agency — maintaining sovereign moral voice within group. Communion — genuinely joining others' moral worlds.
**Integration path:** Diagnosis (baseline group-deliberation patterns) → Healing (group dynamics that make shadow-patterns socially costly) → Evolution (deliberations requiring genuine care-justice synthesis through dialogue).

## 3. Game Design

**Mechanic:** Deliberation unfolds in phases: (a) Scenario presented to group. (b) Each AI-participant offers initial moral response from their framework. (c) Player responds — can agree, challenge, synthesise, or offer new perspective. (d) AI-participants react to player's contribution. (e) Group moves toward (or fails to reach) shared moral understanding. Player's contribution quality scored on: genuine engagement, framework flexibility, commitment maintenance, care for other voices.
**Adaptive difficulty:** Early deliberations have clear synthesis paths; later ones introduce: (a) genuinely irreconcilable moral positions, (b) participants who embody the player's shadow, (c) group pressure toward the player's shadow-pattern, (d) deliberations where the "right" move is to disagree with the group.
**AI participants:** Each embodies a consistent moral framework with genuine depth — not strawmen. Care-ethicist, justice-theorist, contextual pragmatist, principled universalist. Their responses adapt to player's contributions.
**Shadow confrontation:** System occasionally introduces a participant who mirrors the player's detected shadow — forcing the player to see their pattern from outside.

## 4. Item Pool

**Pool structure:** 60+ group-deliberation scenarios across ethical domains. Each scenario has pre-scripted AI-participant opening positions and adaptive response trees.
**Scenario types:** (a) Community dilemmas — competing care-claims within a group. (b) Institutional ethics — justice vs. care at systemic level. (c) Cross-cultural deliberation — frameworks from different traditions. (d) Developmental provocations — scenarios where one framework is clearly more adequate.
**AI-participant archetypes:** 8 distinct moral voices, each with 3 depth-levels (surface, engaged, sophisticated). Participant selection adapts to player's shadow profile.
**Rotation:** Scenarios cycle; no repeat within 30 days. AI-participant combinations vary.

## 5. Technical Requirements

**Input:** Text selection from response options (3–5 per phase) or brief free-text contribution (≤100 chars) scored by LLM.
**Timing:** Deliberation phases have soft time-limits (90s per phase) to maintain conversational rhythm. No hard timeout.
**Telemetry:** Per-phase contribution type (agree/challenge/synthesise/defer), engagement depth score, framework flexibility across deliberations, shadow-flag activations, group-outcome quality.
**Adaptive engine:** Deliberation-pattern analysis across 3+ sessions detects shadow orientation. Scenario and participant selection targets detected shadow. Group dynamics adapt to increase shadow-provocation gradually.
**Accessibility:** All dialogue available as text; response options clearly labelled; no reliance on social cues beyond text content; extended time mode available.
