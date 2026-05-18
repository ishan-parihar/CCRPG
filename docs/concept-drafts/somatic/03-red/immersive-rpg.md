# Somatic / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes somatic capacity through SPONTANEOUS PHYSICAL BEHAVIOUR in an open game world — not structured body-tasks but free physical interaction with an environment that demands embodiment. This modality accesses the ECOLOGICAL dimension of body intelligence: not "can you pass a body-test" but "how does your body LIVE when nobody's testing it?"
>
> **Why this axis for Somatic/Red:** The other 6 modalities probe body intelligence through structured challenges. This one observes it in the wild. At Red, the player navigates a physical world: climbing, fighting, dodging, resting, moving through space. Their SPONTANEOUS physical behaviour — how they move, how they rest, how they engage threats, how they inhabit their body moment-to-moment — reveals their genuine somatic structure without the "test" framing.

---

## 1. Game Identity

- **Title:** "The Flesh Dominion"
- **Core mechanic:** An open-world Red-stage environment where the player freely moves, fights, climbs, rests, and navigates — with somatic capacity assessed through the QUALITY of their spontaneous physical behaviour rather than through explicit body-tasks.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Territory Movement → Physical Challenges → Body-State Management → Sustained Embodiment → The Body's World

---

## 2. Catalyst Delivery

**Catalyst:** The game world itself IS the catalyst. It presents physical demands implicitly: terrain requires movement quality, threats require reaction, distances require stamina management, rest-points require stillness capacity. The player is never told "this is a body test" — they're just MOVING through the world.

**Unconscious response:**
- *Submergent:* The player's NATURAL physical style surfaces without test-anxiety. How do they actually move when they're just playing? Do they rush (dark-addiction)? Float disconnected (dark-allergy)? Move with rigid precision (golden-addiction)? Refuse physical challenges (golden-allergy)?
- *Emergent:* The pull toward deeper embodiment — can they be more present in their movement? More powerful? More alive?

**Integration path:** The world rewards embodied engagement NATURALLY. Players who move with presence navigate better. Players who rest wisely fight stronger. Players who attune to the world's rhythms find hidden paths. The reward is POWER (Red-resonant) — not "good body score."

**Successful integration:** The player demonstrates somatic capacity SPONTANEOUSLY — moving with presence without being asked, resting without being told, attuning to physical rhythms without being prompted. The body is inhabited as a way-of-being-in-the-world.

---

## 3. Game Design

### Setup
An open Red-stage physical world: fortress walls to climb, chasms to cross, enemies to fight, terrain to navigate, rest-points to use (or ignore). The player moves freely. No explicit objectives — the world presents physical opportunities and challenges. The player's BODY-BEHAVIOUR is the assessment.

### Interaction
- **Navigation:** Move through varied terrain. Climbing, jumping, balancing, swimming. Movement quality assessed.
- **Combat:** Encounter physical threats. Reaction, rhythm, power, endurance. All somatic capacities tested in context.
- **Rest management:** Use (or ignore) rest-points. Stamina management. Recovery behaviour.
- **Exploration:** Discover new physical terrain. Novel movement challenges. Body-adaptation.
- **Environmental interaction:** Rhythm-gates, force-barriers, presence-responsive elements. The world demands embodiment.

### Feedback
- Natural consequences: embodied movement → world responds (opens, yields, resonates)
- Natural consequences: disconnected movement → world is inert (doors stay closed, paths stay hidden)
- No explicit "body score" — the world IS the feedback
- Power-resonant rewards for physical engagement (territory gained, enemies defeated, paths opened)

### Difficulty Adaptation
- Terrain complexity scales with demonstrated movement quality
- Combat difficulty scales with demonstrated reaction/rhythm capacity
- Environmental demands scale with demonstrated embodiment quality
- Rest-point spacing scales with demonstrated stamina management
- World responsiveness scales with demonstrated presence

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Territory Movement | 1-5 | Simple terrain, few threats, generous rest-points, basic navigation |
| Physical Challenges | 5-15 | Combat encounters, climbing challenges, stamina demands |
| Body-State Management | 15-30 | Rest-point strategy, fatigue management, recovery timing |
| Sustained Embodiment | 30-50 | Presence-responsive world, embodiment quality matters for navigation |
| The Body's World | 50+ | Full physical world, all somatic capacities tested ecologically |

---

## 4. Item Pool Specification

### Item types
- **Terrain configurations:** Physical environments with varied movement demands
- **Combat encounters:** Enemies with varied physical challenge profiles
- **Environmental elements:** Rhythm-gates, force-barriers, presence-responsive objects
- **Rest-point configurations:** Recovery opportunities with varied accessibility
- **Exploration rewards:** Hidden areas accessible only through specific physical qualities

### Minimum pool size
- 20+ terrain configurations (climbing, balancing, jumping, swimming variants)
- 30+ combat encounter types (reaction, rhythm, power, endurance variants)
- 15+ environmental element types (rhythm-gates, force-barriers, presence-doors)
- 10+ rest-point configurations (varied spacing, accessibility, recovery rate)
- 15+ exploration rewards (hidden paths, secret areas, body-gate treasures)

### Generation rules
- Terrain generated from modular physical components (walls, gaps, slopes, water)
- Combat encounters scaled to demonstrated somatic capacity
- Environmental elements matched to player's current edge (presence-responsive elements at their threshold)
- Rest-points spaced based on demonstrated stamina management
- Exploration rewards placed to encourage physical growth (just beyond current capacity)

### Drive/shadow mapping
- Rest-point usage patterns → Agency probing / dark-addiction detection
- Novel terrain engagement → Agency golden probing
- Physical proximity to NPCs → Communion probing
- Terrain difficulty seeking → Eros probing
- Familiar terrain movement quality → Agape probing
- Movement during safe periods → dark-addiction signal
- Flat/mechanical navigation → dark-allergy signal
- Technique-first on power challenges → golden-addiction signal
- Rhythm-gate resistance → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Tap (interact with world objects, combat, environmental elements)
- Swipe (navigate, climb, dodge)
- Hold (sustain actions — climbing holds, posture, rest)
- Pressure-sensitive (force expression in combat and environmental interaction)
- Rhythm tap (rhythm-gates, combat timing)

### Timing requirements
- Combat timing (RT measurement in context)
- Rhythm-gate timing (synchronisation with environmental beats)
- No explicit timing for exploration/rest (player-paced)
- Fatigue tracking (session duration, input intensity, recovery patterns)

### NPC/AI requirements
- Ally NPCs with physical presence (move through world alongside player)
- Enemy NPCs with varied physical challenge profiles
- Environmental AI (world responds to embodiment quality)
- World must be CONSISTENT — same areas behave the same way

### LLM requirements
- **High:** World generation, combat narration, environmental response
- Generates terrain and challenges adapted to demonstrated capacity
- Narrates physical experiences in embodied language
- Maintains world consistency across sessions
- Evaluates ecological somatic behaviour (interpreting spontaneous physical patterns)

### State persistence
- Full world state (terrain, enemies, environmental elements, rest-points)
- Player physical behaviour history (movement patterns, rest patterns, combat patterns)
- Ecological somatic assessment (running estimate from spontaneous behaviour)
- Drive-health signals from world engagement patterns
- Shadow signals from physical behaviour patterns
- Fatigue state (accumulated somatic load, recovery history)
- Checkpoint position (world state at each save point)
- Territory explored and physical challenges completed
