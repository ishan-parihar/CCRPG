# Cognitive / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes cognitive capacity through SPONTANEOUS BEHAVIOUR in an open game world — not structured tasks but free interaction with an environment that demands cognitive engagement. This modality accesses the ECOLOGICAL dimension of cognition: not "can you solve a test" but "how do you THINK when nobody's testing you."
>
> **Why this axis for Cognitive/Red:** The other 6 modalities probe cognitive capacity through structured challenges. This one observes it in the wild. At Red, the player navigates a power-world: fortresses, rivals, resources, territory. Their SPONTANEOUS cognitive behaviour — how they explore, plan raids, manage resources, navigate threats — reveals their genuine cognitive structure without the "test" framing. This is the most valid ecological assessment.

---

## 1. Game Identity

- **Title:** "The Red Dominion"
- **Core mechanic:** An open-world Red-stage environment where the player freely explores, conquers, manages, and navigates — with cognitive capacity assessed through the QUALITY of their spontaneous behaviour rather than through explicit tasks.
- **Duration:** 5-15 minutes per session (infinite checkpoints, player-determined)
- **Internal progression:** Exploration → Conquest → Management → Expansion → Dominion

---

## 2. Catalyst Delivery

**Catalyst:** The game world itself IS the catalyst. It presents cognitive demands implicitly: navigation requires spatial memory, resource management requires planning, combat requires pattern-tracking, social dynamics require modelling. The player is never told "this is a cognitive test" — they're just LIVING in the world.

**Unconscious response:**
- *Submergent:* The player's NATURAL cognitive style surfaces without test-anxiety or performance pressure. How do they actually think when they're just playing? Do they plan spontaneously? Do they track patterns naturally? Do they model others without being asked to?
- *Emergent:* The pull toward more sophisticated engagement with the world — can they see deeper patterns? Can they plan further ahead? Can they manage more complexity?

**Integration path:** The world rewards cognitive engagement NATURALLY. Players who plan raids succeed more. Players who track patterns avoid traps. Players who model NPCs negotiate better. The reward is POWER (Red-resonant) — not "good score."

**Successful integration:** The player demonstrates cognitive capacity SPONTANEOUSLY — planning without being asked to plan, tracking without being told to track, modelling without being prompted to model. Cognition is integrated into their way-of-being-in-the-world.

---

## 3. Game Design

### Setup
An open Red-stage world: fortresses, war-camps, resource nodes, rival territories, uncharted wilderness. The player has a home base and can explore in any direction. No explicit objectives — the world presents opportunities and threats. The player's BEHAVIOUR is the assessment.

### Interaction
- **Exploration:** Navigate the world freely. Spatial memory, route planning, landmark recognition.
- **Combat:** Encounter enemies. Pattern-tracking, inhibition, timing (draws on deterministic axis skills).
- **Resource management:** Gather, store, allocate resources. Planning, prioritisation, delayed gratification.
- **Territory management:** Conquer, defend, maintain areas. Multi-step planning, maintenance behaviour.
- **NPC interaction:** Negotiate, ally, trade, betray. Social modelling, prediction, coordination.

### Feedback
- Natural consequences: good planning → successful raids → more territory → more power
- Natural consequences: poor planning → failed raids → lost resources → vulnerability
- No explicit "you scored X" — the world IS the feedback
- Implicit progression: the player's territory grows, their influence expands, their options multiply

### Difficulty Adaptation
- World complexity scales with demonstrated capacity (not explicit difficulty setting)
- New areas unlock based on behaviour quality (not just time spent)
- Threats scale with territory size (more territory = more to defend = more cognitive demand)
- NPC complexity scales with demonstrated social-cognitive capacity

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Exploration | 1-5 | Small territory, few threats, simple resources, transparent NPCs |
| Conquest | 5-15 | Expanding territory, combat encounters, resource management begins |
| Management | 15-30 | Multiple territories, maintenance demands, ally management |
| Expansion | 30-50 | Complex territory networks, rival factions, strategic planning required |
| Dominion | 50+ | Full world management, political dynamics, long-term strategy |

---

## 4. Item Pool

### Item types
- **World areas:** Procedurally generated territories with varied cognitive demands
- **Encounter types:** Combat, social, resource, exploration — each probing different EF components
- **NPC personalities:** Varied motivations, reliability, and complexity levels
- **Resource systems:** Multiple resource types with different management requirements
- **Threat patterns:** Varied enemy behaviours requiring different cognitive responses

### Minimum pool size
- 20+ distinct world areas (varied terrain, resources, threats)
- 50+ encounter types (combat, social, resource, exploration variants)
- 15+ NPC personality templates (varied motivations and complexity)
- 5+ resource types with distinct management requirements
- 20+ threat patterns (varied enemy behaviours)

### Generation rules
- LLM generates world content within Red-stage constraints
- World areas have consistent internal logic (resources match terrain, threats match territory)
- NPC behaviour is consistent with stated motivations (modelable)
- Difficulty emerges from world complexity, not artificial scaling
- Shadow-probing situations arise naturally from world dynamics (not inserted artificially)

### Drive/shadow mapping
- Information-gathering vs. charging behaviour → Agency probing
- Advice integration quality → Communion probing
- Territory-seeking patterns → Eros probing
- Maintenance behaviour → Agape probing
- Over-cautious behaviour in safe areas → dark-addiction signal
- Charging into visible dangers → dark-allergy signal
- Claiming mastery without demonstration → golden-addiction signal
- Staying in starting area indefinitely → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Tap (interact with world objects, NPCs, resources)
- Swipe (navigate, explore)
- Hold (sustained actions — mining, building, defending)
- Drag-and-drop (resource allocation, territory management)
- Text input (optional: NPC dialogue for social modelling)

### Timing requirements
- Combat timing (draws on deterministic axis — RT measurement)
- No explicit timing for exploration/management (player-paced)
- Session length is entirely player-determined

### NPC/AI requirements
- **Critical:** Multiple NPCs with persistent personalities, motivations, and behaviour patterns
- World must be CONSISTENT — same NPC behaves the same way across sessions
- Enemy AI must be MODELABLE — patterns the player can learn to predict
- Ally AI must be RELIABLE — consistent with stated motivations

### LLM requirements
- **Very High:** This is the most LLM-intensive modality
- World generation and maintenance
- NPC dialogue and behaviour
- Consequence narration
- Ecological assessment (interpreting spontaneous behaviour)
- Adaptive world complexity

### State persistence
- Full world state (territory, resources, NPCs, threats)
- Player behaviour history (exploration patterns, decision patterns, combat patterns)
- Ecological cognitive assessment (running estimate from spontaneous behaviour)
- Drive-health signals from world engagement patterns
- Shadow signals from behavioural patterns
- Checkpoint position (world state at each save point)
- NPC relationship states (trust, alliance, rivalry)
