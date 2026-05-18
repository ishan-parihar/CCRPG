# Somatic / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes somatic capacity through MULTI-STEP BODY PLANNING — sequencing physical actions toward a goal, managing body-resources over time, and maintaining a physical plan under changing conditions. This modality accesses the EXECUTIVE dimension of body intelligence: not "can your body react" but "can you PLAN what your body will do?"
>
> **Why this axis for Somatic/Red:** At Red, body-planning is concrete and short-horizon: "First I strike, THEN I dodge." The player can sequence 2 physical actions but cannot yet plan complex movement chains (Amber) or optimise training programs (Orange). This axis isolates the PLANNING component of somatic intelligence — can you think AHEAD through the body?

---

## 1. Game Identity

- **Title:** "The Body's Campaign"
- **Core mechanic:** The player plans and executes multi-step physical sequences — positioning the body, sequencing strikes and defences, managing stamina across a fight — where success requires holding a BODY-PLAN in mind and executing it step-by-step.
- **Duration:** 4-8 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** 2-Step Sequences → 3-Step Sequences → Stamina-Managed Plans → Adaptive Body-Plans → Contested Sequences

---

## 2. Catalyst Delivery

**Catalyst:** The game presents physical goals that CANNOT be achieved in one action — they require sequential body-planning. "Strike high, THEN dodge low, THEN strike again." The contact boundary is: "Can you hold a 2-step body-plan and execute it without losing the thread?"

**Unconscious response:**
- *Submergent:* The player's relationship to body-planning surfaces. Do they over-plan (dark-addiction — planning the body instead of being in it)? Refuse to plan and just react (dark-allergy — body without direction)? Attempt complex sequences beyond capacity (golden-addiction)? Refuse to develop sequential body-intelligence (golden-allergy)?
- *Emergent:* The pull toward longer body-sequences — can they hold one more step? Can they maintain the body-plan under fatigue?

**Integration path:** The game rewards EXECUTED body-plans (not just conceived ones). A simple 2-step sequence executed with power and presence scores higher than a complex sequence that falls apart. Planning through the body, not about the body.

**Successful integration:** The player conceives body-plans appropriate to their capacity (2-3 steps at Red), holds them in body-memory during execution, and adapts when conditions change — all while maintaining physical presence.

---

## 3. Game Design

### Setup
A physical obstacle course — walls to breach, gaps to cross, enemies to defeat — that requires PLANNED sequences of body-actions. Not a reaction-time challenge (that's deterministic) but a PLANNING challenge: "Look at the obstacle. Plan your body's approach. Execute." The aesthetic: Red-stage assault course, stone and iron, firelight.

### Interaction
- **2-Step Sequences:** "The wall has a weak point high and a gap low. Strike high, then roll through." Plan two physical actions in order.
- **3-Step Sequences:** "Dodge the first swing, strike the exposed flank, then hold position." Three actions, correct order, correct timing.
- **Stamina-Managed Plans:** "You have stamina for 3 powerful actions OR 5 moderate ones. The obstacle requires at least 4 actions." Resource-constrained body-planning.
- **Adaptive Body-Plans:** "The enemy shifts stance. Your plan must change. What does your body do NOW?" Mid-execution adaptation.
- **Contested Sequences:** "The enemy is planning too. Anticipate their body and counter." Adversarial physical planning.

### Feedback
- Successful sequence → fluid execution animation, obstacle overcome, power gained
- Failed sequence → visible breakdown point (which step failed and why)
- Optimal sequence (minimum steps) → bonus: "The body's genius — no wasted movement"
- The game always shows WHERE the body-plan broke down (which step, which transition)

### Difficulty Adaptation
- Sequence length: 2 → 3 → 4 steps
- Timing constraints: generous → moderate → tight
- Stamina constraints: unlimited → limited → scarce
- Adaptivity: static obstacles → changing conditions → adversarial
- Transition complexity: simple (strike-dodge) → complex (strike-hold-release-dodge)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| 2-Step Sequences | 1-5 | Simple two-action plans; generous timing; clear obstacles |
| 3-Step Sequences | 5-15 | Longer sequences; some timing constraints; varied actions |
| Stamina-Managed Plans | 15-30 | Limited body-resources; must choose which actions to spend on |
| Adaptive Body-Plans | 30-50 | Conditions change mid-execution; must re-plan physically |
| Contested Sequences | 50+ | Adversarial planning; anticipation; physical counter-strategy |

---

## 4. Item Pool

### Item types
- **Obstacle configurations:** Physical challenges requiring specific action sequences
- **Action vocabularies:** Available body-actions (strike/dodge/hold/roll/jump/climb) with varied properties
- **Stamina configurations:** Resource constraints that force prioritisation
- **Adaptation triggers:** Mid-sequence changes requiring re-planning
- **Enemy body-plans:** Adversarial sequences to anticipate and counter

### Minimum pool size
- 30+ obstacle configurations (2-step difficulty)
- 25+ obstacle configurations (3-step difficulty)
- 20+ stamina-constrained scenarios
- 15+ adaptive scenarios (with mid-plan changes)
- 10+ contested scenarios (with adversarial body-planning)

### Generation rules
- Obstacles generated from modular components (walls, gaps, enemies, holds)
- Difficulty = minimum optimal sequence length (computed algorithmically)
- All problems must have at least one solution within the player's stamina budget
- Adaptive scenarios: condition changes follow predictable physical logic
- Contested scenarios: enemy body-plans are 1 step shorter than player's capacity (beatable)

### Drive/shadow mapping
- Body-advisor acceptance/rejection → Agency probing
- Joint sequence quality → Communion probing
- Advancement rate and satisfaction → Eros probing
- Foundation sequence quality → Agape probing
- Zero planning time before execution → dark-addiction signal
- Cognitive approach to physical problems → dark-allergy signal
- Over-complex sequences for simple problems → golden-addiction signal
- Disengagement at longer sequence requirements → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Sequence input (order actions in a queue before execution)
- Timed execution (execute planned actions with correct timing)
- Tap-to-select (choose actions for the plan)
- Swipe (directional actions — dodge left/right, strike high/low)

### Timing requirements
- Planning time tracked (diagnostic — too fast may indicate impulsivity; too slow may indicate disconnection)
- Execution timing measured (transitions between sequence steps)
- No millisecond precision needed for planning phase
- Moderate precision for execution phase (±100ms windows for transitions)

### NPC/AI requirements
- Body-Advisor NPC: suggests physical sequences, provides scaffolding
- Ally NPC: coordinates joint body-plans, has own physical constraints
- Recruit NPC: receives body-planning teaching
- Enemy AI: executes counter-sequences in contested scenarios

### LLM requirements
- **Medium:** Scenario generation, outcome narration, adaptive difficulty
- Generates obstacle configurations within difficulty constraints
- Narrates physical outcomes in Red-stage body-language
- Adapts enemy behaviour descriptions
- Evaluates execution quality (presence/power) beyond pure accuracy

### State persistence
- Maximum successful sequence-length (running estimate)
- Execution quality history (presence, power, fluidity)
- Transition quality (between-step smoothness)
- Stamina management patterns
- Planning-time patterns (for shadow detection)
- Drive-health signals from body-planning behaviour
- Shadow signals from engagement patterns
- Fatigue state (accumulated somatic load)
- Checkpoint position and phase
