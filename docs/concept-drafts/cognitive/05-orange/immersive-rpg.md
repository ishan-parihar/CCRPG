# Cognitive / Orange — Immersive-RPG Game Concept

> **Axis:** Ecological cognition — whether formal-operational reasoning appears spontaneously in free-play without explicit cognitive tasks.  **Why this axis for this module:** The ultimate test of Orange integration is not whether the player CAN reason formally when prompted, but whether they DO so spontaneously when the environment rewards it without instruction.

---

## 1. Game Identity

**Title:** The Uncharted Laboratory  
**Core Mechanic:** An open-world exploration environment governed by hidden formal rules. No instructions, no explicit puzzles, no prompts to reason. The world simply operates on discoverable principles — players who spontaneously deploy hypothetical-deductive reasoning thrive; those who don't, stall.  
**Duration:** 10–20 minutes per session, infinite checkpoint, persistent world state.  
**Internal Progression:** Wanderer → Pattern-Noticer → Rule-Discoverer → World-Theorist (builds and tests comprehensive models of the world's hidden logic).

## 2. Catalyst Delivery

**Unique Presentation:** A mysterious environment — part laboratory, part wilderness, part machine — where objects interact according to consistent but non-obvious rules. The player explores freely. Nothing tells them to "think formally." The environment simply rewards it.  
**Differs from others:** Not structured tasks (deterministic), not reflective conversation (language-reflective), not branching scenarios (scenario-choice), not body-mapped (embodied), not goal-decomposition (strategic), not collaborative (social). This is the ecological validity check — does formal reasoning emerge naturally?  
**Uniquely Surfaces:** All four shadows in ecological context. DA (over-systematises the world — builds elaborate theories about trivial interactions), DAll (wanders without ever forming hypotheses — "I'm just exploring"), GA (talks about the world's "emergent complexity" without testing anything), GAll (finds one rule and insists it explains everything).  
**Successful Integration:** Player naturally forms hypotheses about the world, tests them through interaction, revises when wrong, builds increasingly accurate models, and enjoys the process without compulsion or avoidance.

## 3. Game Design

**Setup:** Player spawns in an environment with interactive objects, environmental phenomena, and hidden rule-systems. No tutorial, no objectives displayed. The world responds to interaction consistently.

**Interaction Phases:**
1. **Free Exploration** — Player interacts with objects and observes results; no guidance
2. **Pattern Emergence** — Repeated interactions reveal regularities; player may or may not notice
3. **Hypothesis Formation** — Player (implicitly) begins testing: "Does X always cause Y?"
4. **Systematic Testing** — Player designs deliberate experiments (observable through interaction patterns)
5. **Model Building** — Player's behaviour shows they've internalised the world's rules; they predict and exploit

**Feedback Examples:**
1. Spontaneous hypothesis-testing detected (repeated controlled interactions): world subtly rewards with new accessible areas
2. Random exploration without pattern-seeking (DAll): world remains static, gently introduces more salient regularities
3. Over-systematisation (DA): world introduces irreducible randomness in non-critical elements — not everything is a pattern
4. Single-rule fixation (GAll): world presents phenomena that contradict the player's model, inviting revision
5. Comprehensive model achieved: deep world layer unlocks, revealing more complex rule-systems

**Difficulty Adaptation:** Rule complexity (single-variable→multi-variable), rule visibility (obvious→subtle), noise level (deterministic→probabilistic), rule-system depth (surface→nested), world size (small→expansive).

**Internal Progression Table:**

| Level | Rule Complexity | Visibility | Noise | Depth | World Size |
|---|---|---|---|---|---|
| Wanderer | Single-variable | Obvious | None | Surface only | Small room |
| Pattern-Noticer | Two-variable | Moderate | Low | 2 layers | Several rooms |
| Rule-Discoverer | Multi-variable | Subtle | Moderate | 3 layers | Complex space |
| World-Theorist | Interacting systems | Hidden | Realistic | 4+ layers | Expansive |

## 4. Item Pool

**Interactive Objects (30+):** Levers, crystals, fluids, plants, machines, light sources, sound emitters, temperature zones, gravity fields, colour-reactive surfaces — each governed by discoverable rules.  
**Rule Systems (20+):** Cause-effect chains, conditional triggers, combinatorial interactions, temporal sequences, spatial relationships, threshold effects, feedback loops, inhibitory relationships.  
**Environmental Phenomena (20+):** Weather patterns, growth cycles, energy flows, resonance effects, decay processes, transformation sequences — all consistent, all discoverable.  
**Exploration Rewards (15+):** New areas unlocked, new object types introduced, deeper rule layers revealed, aesthetic transformations, narrative fragments that hint at underlying logic.  
**Red Herrings (15+):** Coincidental correlations, aesthetic-only effects, random variations, one-time events — teaching that not everything is a pattern (anti-DA calibration).

## 5. Technical Requirements

**Input Types:** Tap/drag to interact with objects, long-press to observe, swipe to navigate, pinch to examine closely. All natural exploration gestures — no "reasoning mode" button.  
**Timing:** Entirely self-paced. No time pressure. Session length is player-determined. World state persists between sessions.  
**NPC/AI:** No NPCs. The world itself is the interlocutor. Environmental responses are the only feedback.  
**LLM:** Minimal — used for behavioural pattern analysis (detecting hypothesis-testing vs. random exploration from interaction logs). Not player-facing.  
**State Persistence:** Full interaction log (every object touched, every sequence attempted), inferred hypothesis-testing episodes, rule-discovery timeline, exploration-vs-exploitation ratio, model-accuracy trajectory (inferred from prediction-consistent behaviour), shadow-pattern flags from ecological behaviour.
