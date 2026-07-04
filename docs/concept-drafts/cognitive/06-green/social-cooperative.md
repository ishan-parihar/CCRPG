# Cognitive / Green — Social-Cooperative Game Concept

> **Axis:** Collaborative multi-perspectival reasoning — group sense-making, distributed cognition across different viewpoints.  **Why this axis for this module:** Green cognition in isolation may be performance; social-cooperative tasks reveal whether multi-perspectival capacity extends to genuine distributed sense-making with others who hold different frameworks.

---

## 1. Game Identity

**Name:** The Perspective Circle
**Core loop:** Player is assigned one of 4 perspectives on a shared problem. Must contribute their viewpoint to a group sense-making process, then help the group reach a contextually-appropriate collective response. AI agents fill other seats when solo; real players when available.
**Session length:** 5-8 minutes (1 group challenge per session, infinite checkpoint).
**Felt experience:** A council fire where each voice carries a different truth — the circle must speak as one without silencing any.

## 2. Catalyst Delivery

**Catalyst type:** Distributed cognition requiring genuine perspective-contribution AND perspective-reception.
**Shadow provocation:** GAll surfaces as refusal to let the group synthesise ("we shouldn't rank these"). DA surfaces as inability to contribute one's own perspective clearly (overwhelmed by others'). DAll surfaces as dominating the group with one's assigned perspective. GA surfaces as premature "I see what we all mean" before genuinely hearing others.
**Drive engagement:** Agency = contributing one's perspective with clarity and conviction. Communion = genuinely receiving and integrating others' perspectives. Eros = reaching toward group synthesis. Agape = ensuring each perspective is fully heard before moving forward.
**Progression:** Diagnosis (contribution/reception balance, synthesis quality) → Healing (role assignments that provoke specific shadows) → Evolution (fluid collaborative sense-making).

## 3. Game Design

**Mechanics:**
- Shared problem presented to all 4 participants simultaneously
- Each player assigned a perspective-role (with brief framework description)
- Round 1: Each player articulates their perspective (text/voice, 60s)
- Round 2: Each player must paraphrase another's perspective accurately (tests reception)
- Round 3: Group proposes collective response (collaborative text construction)
- Scoring: individual contribution quality + reception accuracy + group synthesis quality

**Role dynamics:**
- Perspectives are genuinely incompatible (no easy synthesis)
- Each role has "must-honour" constraints that cannot be dismissed
- Group response must acknowledge all 4 constraints (even if not fully satisfying all)
- Dissent is scored positively when it prevents premature closure

**Shadow-specific role assignments:**
- DA pattern: assign the "decisive" role (must propose action)
- DAll pattern: assign the "listener" role (must paraphrase before contributing)
- GA pattern: assign the "detail" role (must stay granular, no meta-moves)
- GAll pattern: assign the "synthesiser" role (must propose hierarchy/priority)

**AI agent behaviour (solo mode):**
- 3 AI agents play other roles with calibrated sophistication
- AI agents model healthy Green cognition (not perfect — realistic)
- AI agents occasionally exhibit shadow patterns to test player's response

## 4. Item Pool

**Shared problems:** Community decisions, resource conflicts, epistemological disputes, value trade-offs. 10 problems per domain, 40 total.
**Perspective-roles:** 4 per problem, each with framework description, must-honour constraints, and contribution prompts. Roles rotate across sessions.
**Paraphrase targets:** Each perspective has 3 key claims that must appear in accurate paraphrase.
**Group response templates:** Structured format ensuring all perspectives are addressed. Scored on integration quality, not consensus.

## 5. Technical Requirements

**Multiplayer:** WebSocket-based real-time collaboration (2-4 players). Graceful fallback to AI agents for missing seats.
**AI agents:** LLM-powered with perspective-role prompts. Calibrated to player's developmental level. Response latency randomised (2-8s) for naturalism.
**Metrics captured:** Contribution clarity score, paraphrase accuracy, synthesis contribution, role-compliance, shadow probability vector, group outcome quality.
**Turn management:** Timed rounds (60s contribution, 45s paraphrase, 90s synthesis). Visual countdown, gentle audio cues.
**Storage:** ~300 bytes/session (role, contributions hash, paraphrase scores, synthesis contribution, group outcome).
**Accessibility:** Voice input/output for all rounds, visual turn indicators, adjustable round durations.
