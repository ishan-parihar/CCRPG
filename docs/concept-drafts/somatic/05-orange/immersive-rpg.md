# Somatic / Orange — Immersive-RPG Game Concept

> **Axis:** Ecological physical mastery — whether skilled movement appears spontaneously in free-play without explicit physical tasks.  **Why this axis for this module:** True Orange somatic integration means technique is EMBODIED — it emerges naturally in unstructured contexts, not only when explicitly prompted.

---

## 1. Game Identity

- **Title:** The Living Terrain
- **Core Mechanic:** Open-world exploration where physical challenges emerge organically from the environment. No explicit "training" framing — the world simply demands skilled movement. How the player moves through the world reveals their embodied mastery.
- **Duration:** 8–15 minutes per session, infinite checkpoint.
- **Internal Progression:** Simple environmental navigation → terrain requiring technique → multi-domain physical puzzles → time-pressured ecological challenges → free-form movement expression → spontaneous mastery in novel contexts.

## 2. Catalyst Delivery

- **Unique Presentation:** A rich physical world — cliffs, rivers, forests, structures, weather — that never explicitly asks for "technique." The environment simply IS, and the player's body must navigate it. No training UI, no technique labels.
- **Differs From Others:** No framing as practice, training, or assessment. The player is simply LIVING in a physical world. Mastery (or its absence) reveals itself through ecological behavior.
- **Uniquely Surfaces:** All four shadows in their natural habitat — DA (optimizes routes obsessively, treats world as obstacle course), DAll (avoids physical challenges, takes easiest paths), GA (attempts advanced terrain without skill foundation), GAll (navigates efficiently but never explores, never plays).
- **Successful Integration:** Player moves through the world with competent spontaneity — skilled but not rigid, efficient but not compulsive, exploratory but not reckless, playful but not careless.

## 3. Game Design

- **Setup:** Open terrain with multiple paths, challenges, and opportunities. No explicit objectives — player chooses where to go and how to move.
- **Interaction Phases:**
  1. Exploration — player discovers the terrain and its physical demands
  2. Encounter — environmental challenges require technique (climbing, jumping, balancing, timing)
  3. Adaptation — terrain changes or complications arise requiring technique-switching
  4. Expression — open sections allow free movement choice (efficient vs. playful vs. exploratory)
  5. Integration — complex terrain requiring all domains simultaneously with self-paced engagement
- **Feedback Examples:**
  1. "You optimized every route for speed — the world became a race track" (DA)
  2. "You avoided every challenging path — the world remained unexplored" (DAll)
  3. "You attempted the cliff face without building skill on easier terrain first" (GA)
  4. "You navigated perfectly but never paused, never explored, never played" (GAll)
  5. "You moved through the world with skill and curiosity — efficient when needed, playful when possible" (integration)
- **Difficulty Adaptation:** Terrain complexity scales with demonstrated movement capacity. New areas unlock based on ecological behavior patterns. Shadow-probing environments introduced based on detected patterns.
- **Internal Progression Table:**

| Level | Terrain Type | Shadow Probe |
|---|---|---|
| 1–3 | Gentle terrain with optional challenges | Baseline movement style |
| 4–6 | Moderate terrain requiring technique | DAll: avoids; DA: speed-runs |
| 7–9 | Complex terrain with multiple valid paths | GAll: optimal only; GA: reckless |
| 10–12 | Dynamic terrain with time pressure and choice | Dominant shadow in ecological context |
| 13+ | Open world with full freedom | Integrated spontaneous mastery |

## 4. Item Pool

- **Terrain Types (20):** Cliff faces requiring climbing technique, river crossings demanding balance and timing, forest canopy requiring coordination, narrow ledges demanding precision, unstable ground requiring adaptation, wind-affected paths requiring force management, ice surfaces requiring friction control, sand terrain requiring power adjustment, vertical ascents requiring pacing, descents requiring deceleration, underwater passages requiring breath management, moving platforms requiring timing, obstacle courses requiring sequencing, open fields allowing free movement, weather-affected terrain requiring adaptation, night terrain requiring proprioception, crowded spaces requiring spatial awareness, elevated paths requiring balance, transitional zones requiring technique-switching, rest areas allowing recovery
- **Physical Puzzles (18):** Multi-step climbing routes with technique gates, timed river crossings with current patterns, balance sequences across unstable surfaces, coordination challenges requiring bilateral movement, speed-precision tradeoffs in narrow passages, force-calibration puzzles (too much breaks, too little fails), rhythm-gated passages requiring timing, fatigue-managed long routes, recovery-dependent progression (must rest to proceed), technique-combination locks, environmental adaptation challenges, novel-movement discovery puzzles, efficiency-vs-exploration tradeoffs, risk-reward physical choices, multi-path problems with different skill demands, progressive difficulty chains, optional challenge branches, hidden paths requiring specific techniques
- **Ecological Behaviors Tracked (15):** Path selection patterns (easy vs. challenging), movement efficiency vs. exploration ratio, rest frequency and timing, technique variety vs. repetition, response to failure (retry vs. avoid vs. adapt), engagement with optional challenges, movement quality in low-stakes areas, spontaneous play behavior, route optimization tendency, risk-taking patterns, recovery behavior, curiosity indicators, persistence patterns, adaptation speed in novel terrain, self-pacing quality
- **Environmental Events (15):** Weather shifts requiring technique adaptation, terrain collapse requiring rapid response, animal encounters requiring movement decisions, other NPCs moving through space (social-physical), time-limited opportunities (sunrise viewpoints, tidal windows), seasonal changes affecting terrain, discovery of hidden areas, environmental puzzles revealing new paths, rest spots with recovery bonuses, challenge areas with mastery rewards, free-movement zones for expression, competitive NPCs on parallel paths, cooperative NPCs needing physical help, teaching moments with novice NPCs, celebration spaces after difficult terrain
- **Integration Markers (12):** Spontaneous technique use without prompting, appropriate risk calibration, self-paced engagement with challenge, playful movement in safe terrain, efficient movement under pressure, exploratory behavior in novel areas, voluntary rest before fatigue, technique-switching without hesitation, graceful failure recovery, curiosity-driven path selection, balanced effort distribution, embodied confidence in movement

## 5. Technical Requirements

- **Input Types:** Continuous movement input (swipe, tilt, tap sequences), contextual actions triggered by environment, free-form movement expression, timing-based interactions with terrain.
- **Timing:** Real-time environmental interaction. No explicit time pressure unless terrain creates it naturally. Session length entirely player-determined.
- **NPC/AI:** Environmental AI generates terrain challenges based on player capacity. Other NPCs move through the world creating social-physical opportunities. Difficulty scales invisibly.
- **LLM:** Minimal direct role. May generate environmental narrative or NPC dialogue. Primary assessment is behavioral pattern analysis from movement data.
- **State Persistence:** Movement pattern profiles, terrain preference history, ecological behavior trajectories, shadow indicators from free-play behavior, exploration maps, mastery demonstration in novel contexts, integration markers over time.
