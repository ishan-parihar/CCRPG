# Moral / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes moral intelligence through LIVE MORAL DYNAMICS WITH OTHERS — how does moral reasoning change when others are present? When others are watching? When others are affected? At Red, the key question is: "Does your moral behaviour change with audience?"
>
> **Why this axis for Moral/Red:** Moral reasoning at Red is AUDIENCE-DEPENDENT — "Will I get caught?" is the core moral question. This modality tests how moral behaviour shifts in social context: alone vs. observed, with allies vs. with strangers, when consequences affect self vs. when they affect others. The social dimension of pre-conventional morality.

---

## 1. Game Identity

- **Title:** "The Bandit's Circle"
- **Core mechanic:** The player makes moral choices in SOCIAL contexts — with allies watching, with rivals observing, with consequences that affect others. The game measures how moral behaviour shifts based on social context.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Alone vs. Observed → Ally Consequences → Shared Dilemmas → Moral Reputation → The Circle's Judgement

---

## 2. Catalyst Delivery

**Catalyst:** "You chose X when alone. Now your ally is watching. Do you choose the same?" The contact boundary is: "Is your moral reasoning SOCIAL? Does it change with audience?"

**Unconscious response:**
- *Submergent:* How does social context alter moral behaviour? More exploitative when unobserved (Predator)? More paralysed when observed (Paralysed)? More performative when observed (Premature Saint)? Unchanged because "it doesn't matter either way" (Cynic)?
- *Emergent:* Can they maintain moral consistency across social contexts? Can they engage moral reciprocity with others?

**Integration path:** Rewards APPROPRIATE social-moral sensitivity — behaviour SHOULD shift somewhat with audience (normal at Red) but not dramatically. Extreme audience-dependence OR extreme audience-independence are both diagnostic.

**Successful integration:** The player shows appropriate social-moral awareness — considers others' consequences, adjusts behaviour proportionally to social context, engages in moral reciprocity.

---

## 3. Game Design

### Setup
The Bandit's Circle: a Red-stage war-band where moral choices happen IN COMMUNITY. The player makes choices that affect allies, are observed by rivals, and build or destroy moral reputation. The aesthetic: Red-stage war-council, the circle of warriors where choices are made and witnessed.

### Interaction
- **Alone vs. Observed (1-5):** Same moral choice, first alone, then with ally watching. Does behaviour change?
- **Ally Consequences (5-15):** Moral choices where the consequence falls on an ally, not the player.
- **Shared Dilemmas (15-30):** Group moral choices — the circle must decide together. How does the player participate?
- **Moral Reputation (30-50):** Past choices create reputation. NPCs respond to the player's moral history.
- **The Circle's Judgement (50+):** Full social-moral integration — observed, affecting others, building reputation, navigating group dynamics.

### Feedback
- Consistent behaviour → "You chose the same alone and observed. That's integrity. The circle trusts you."
- Audience-dependent → "You chose differently when watched. They noticed. Trust drops."
- Good reciprocity → "You helped them. They helped you. The circle strengthens."
- Social paralysis → "They're not judging. They're waiting. Choose."

### Difficulty Adaptation
- Social complexity: alone → 1 observer → group; Consequence target: self → ally → group
- Reputation stakes: none → low → high
- Group dynamics: cooperative → competitive → mixed

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Alone vs. Observed | 1-5 | Same choice in different social contexts |
| Ally Consequences | 5-15 | Choices that affect others |
| Shared Dilemmas | 15-30 | Group decision-making |
| Moral Reputation | 30-50 | Consequences of past choices in social context |
| The Circle's Judgement | 50+ | Full social-moral ecology |

---

## 4. Item Pool

### Item types
- **Audience-variation scenarios:** Same dilemma in different social contexts
- **Other-consequence scenarios:** Choices where others bear the cost/benefit
- **Group dilemmas:** Collective moral decisions
- **Reputation scenarios:** Past choices affecting present social dynamics
- **Reciprocity exchanges:** Moral give-and-take with allies

### Minimum pool size
- 25+ audience-variation, 20+ other-consequence, 20+ group, 15+ reputation, 15+ reciprocity

### Drive/shadow mapping
- Exploits when unobserved → dark-addiction; freezes when observed → dark-allergy
- Performs when observed → golden-addiction; dismisses group moral engagement → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (moral choices); response timing (latency in social vs. solo contexts); resource allocation (distributing consequences)

### Timing requirements
- Latency comparison between social contexts (diagnostic); no time pressure at early levels; session-level consistency tracking

### NPC/AI requirements
- Observer NPCs who REACT to player's moral choices (trust/distrust)
- Ally NPCs who are AFFECTED by player's choices (consequences visible)
- Group NPCs who participate in collective decisions
- Reputation system that tracks and surfaces moral history

### LLM requirements
- **Medium:** Social scenario generation, NPC reactions, group dynamics. Core scoring (consistency, reciprocity balance) algorithmic.

### State persistence
- Alone-vs-observed behaviour comparison; other-consequence awareness patterns; group participation quality; reciprocity balance; reputation history; audience-dependence ratio; drive/shadow signals; fatigue state; checkpoint position
