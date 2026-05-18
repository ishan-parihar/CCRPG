# Moral / Orange — Social-Cooperative Game Concept

> **Axis:** Shared moral reasoning — group ethical deliberation and responding to others' moral claims.  **Why this axis for this module:** Orange principled reasoning must survive contact with other reasoners; the social dimension tests whether principles hold under challenge, persuasion, and the moral claims of others.

---

## 1. Game Identity

**Title:** The Moral Commons  
**Genre:** Cooperative moral deliberation with AI interlocutors  
**Session length:** 5–10 minutes (infinite checkpoint)  
**Core loop:** Moral issue presented → AI interlocutors offer competing positions → player engages in deliberation → group resolution attempted → reasoning quality scored

The player engages in moral deliberation with AI-driven interlocutors who hold different principled positions. The game tests whether the player can maintain principled reasoning under social pressure, respond to legitimate moral claims, and participate in genuine ethical discourse rather than dominating or capitulating.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange moral — principled reasoning in social context  
**Shadow surfacing:** GAll (fortress) surfaces when player refuses to engage with others' moral claims — "I'm right, discussion over." GA (relativist) surfaces when player capitulates to social pressure without principled resistance.  
**Progression:** Diagnosis (sessions 1–3) → Healing (4–8) → Evolution (9+)

Healing catalyst: for the fortress, interlocutors present genuinely strong counter-principles that cannot be dismissed — forcing engagement. For the relativist, interlocutors challenge capitulation — "you just agreed with me, but WHY?" Evolution catalyst: deliberation scenarios where genuine moral synthesis is possible through collaborative reasoning.

## 3. Game Design

**Mechanics:**
- 3–4 AI interlocutors with distinct moral positions (utilitarian, deontological, care-based, rights-based)
- Turn-based deliberation: each round, one interlocutor presents a claim; player responds
- Player responses scored on: engagement quality, principled grounding, responsiveness to others' claims, resistance to illegitimate pressure
- Group resolution phase: player proposes synthesis or maintains position with justification
- Social-pressure mechanics: interlocutors may form coalitions, appeal to emotion, or challenge consistency

**Difficulty staircase:**
- Level 1: One interlocutor with clearly weaker position — player practices principled engagement
- Level 2: Two interlocutors with equally strong positions — player must genuinely deliberate
- Level 3: Interlocutors challenge player's consistency using prior statements
- Level 4: Social-pressure tactics (coalition, emotional appeal, authority citation)
- Level 5: Genuine moral synthesis required — no single position is adequate alone

**Shadow-specific mechanics:**
- GAll probe: interlocutor presents legitimate exception to player's principle — does player engage or dismiss?
- GA probe: majority of interlocutors agree on position — does player capitulate or reason?
- DA probe: interlocutor presents individual suffering case — does player engage emotionally or calculate?
- DAll probe: interlocutor challenges "the rule" — does player defend with principle or authority?

## 4. Item Pool

- 40 deliberation scenarios across moral domains
- 12 AI interlocutor archetypes (3 per moral framework × 4 frameworks)
- 80 interlocutor claims with varying strength and legitimacy
- 30 social-pressure tactics (coalition, emotional appeal, authority, consistency challenge)
- 20 synthesis opportunities (scenarios where collaborative reasoning yields better outcomes)
- Adaptive interlocutor behaviour: responds to player's shadow profile

## 5. Technical Requirements

- LLM-driven interlocutor engine: generates contextually appropriate moral claims
- Deliberation-quality scorer: evaluates engagement, grounding, responsiveness
- Social-pressure calibration: adjusts intensity based on player's current capacity
- Consistency tracker: interlocutors reference player's prior positions across sessions
- Synthesis detector: identifies genuine integration vs. compromise
- Drive-health mapping: dismiss-all → GAll; capitulate → GA; calculate-response → DA; cite-authority → DAll
- Turn-management system: ensures balanced deliberation pacing
