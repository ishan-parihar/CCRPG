# Interpersonal / Orange — Social-Cooperative Game Concept

> **Axis:** Live relational coordination — negotiating with NPC partners, maintaining contracts under pressure.  **Why this axis for this module:** Orange contractual capacity is tested in real-time social dynamics — when partners deviate, renegotiate, or pressure the player, the live response reveals whether contracts are genuine or shadow-driven.

---

## 1. Game Identity

**Title:** The Partnership Engine  
**Core loop:** Player coordinates with 2–4 NPC partners on shared objectives. Each partner has their own agenda, communication style, and contract expectations. Player must negotiate terms, maintain agreements under pressure, handle violations, and adapt when circumstances change — all in real-time dialogue.  
**Infinite checkpoint:** Each partnership mission is 5–8 minutes. Dialogue state saves at any exchange. Partnerships persist across missions.

## 2. Catalyst Delivery

**Shadow provocation by design:**
- DA surfaces when player exploits partner contributions without reciprocating, takes credit, or renegotiates terms to maximise personal gain under pressure
- DAll surfaces when player refuses to coordinate — does tasks solo, ignores partner input, or withdraws from negotiation when it gets complex
- GA surfaces when player prioritises "connection" over task clarity — wants to "check in emotionally" instead of establishing who does what
- GAll surfaces when player enforces contract terms rigidly even when partners face genuine difficulty — "we agreed, so deliver"

**Drive probing:** Agency in clear self-advocacy during negotiation. Communion in genuine collaboration and shared ownership. Eros in willingness to deepen partnership beyond transactional. Agape in flexibility and care when partners struggle.

## 3. Game Design

**Mechanics:** Mission briefing establishes shared objective. Player and NPC partners negotiate role allocation via dialogue choices. During execution, partners may: deviate from agreement, request renegotiation, face unexpected obstacles, or attempt exploitation. Player responds in real-time with dialogue options spanning the full drive×shadow space.  
**Difficulty staircase:** Early: cooperative partners, clear objectives, simple contracts. Mid: partners with hidden agendas, conflicting needs, ambiguous situations. Late: partners who test boundaries, violate contracts, or pressure for inappropriate concessions.  
**Feedback:** Mission outcome + partnership health. Partners remember prior interactions. Trust builds or erodes. No explicit shadow scoring visible to player.  
**Progression:** Partner relationships deepen across missions. Early partners become long-term collaborators or adversaries based on player behaviour. New partners introduced with increasing complexity.

## 4. Item Pool

- 8 NPC partner archetypes (the reliable, the exploiter, the avoider, the over-sharer, the rigid, the flexible, the tester, the genuine)
- 24 mission types across 4 complexity tiers
- 60 dialogue-choice sets per mission (4–6 options each, mapped to drive×shadow)
- 12 contract-violation scenarios requiring real-time response
- 8 renegotiation triggers per mission tier
- Partner memory system: 20+ interaction-history variables per NPC

## 5. Technical Requirements

- Dialogue engine with branching responses and NPC personality models
- Partner AI: behaviour driven by archetype + relationship history + mission context
- Contract state machine: tracks active agreements, violations, renegotiations
- Real-time pressure mechanics: time-limited response windows for critical negotiations
- Shadow-signal extraction: dialogue choices and negotiation patterns mapped to drives
- Relationship persistence: partner trust/history carries across all sessions
- No LLM required — pre-authored dialogue trees with adaptive selection
