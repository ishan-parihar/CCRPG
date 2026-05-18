# Cognitive / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes cognitive capacity through MULTI-STEP PLANNING — sequencing actions toward a goal, managing resources over time, and maintaining a plan under changing conditions. This modality accesses the EXECUTIVE dimension of cognition: not "can you react" but "can you PLAN and EXECUTE."
>
> **Why this axis for Cognitive/Red:** At Red, planning is concrete, short-horizon, and power-directed. "I will take that hill in 2 moves." The player can sequence 2-3 actions toward a visible goal but cannot yet plan abstractly or maintain long-term strategies. This axis isolates the PLANNING component of executive function — Tower of London, goal-maintenance, and sequential execution.

---

## 1. Game Identity

- **Title:** "The Siege-Maker"
- **Core mechanic:** The player plans and executes multi-step siege operations — positioning forces, sequencing attacks, managing limited resources — where success requires holding a plan in mind and executing it step-by-step against concrete obstacles.
- **Duration:** 4-10 minutes per session (infinite checkpoints)
- **Internal progression:** 2-move plans → 3-move plans → Resource-constrained plans → Adaptive plans → Contested plans

---

## 2. Catalyst Delivery

**Catalyst:** The game presents goals that CANNOT be achieved in one move — they require sequential thinking. The contact boundary is: "Can you hold a 2-step plan in mind and execute it without losing the thread?"

**Unconscious response:**
- *Submergent:* The player's relationship to sequential thinking surfaces. Do they over-plan (dark-addiction)? Refuse to plan and just act (dark-allergy)? Attempt plans beyond their capacity (golden-addiction)? Refuse to engage with multi-step challenges (golden-allergy)?
- *Emergent:* The pull toward longer planning horizons — can they hold one more step? Can they maintain the plan under pressure?

**Integration path:** The game rewards EXECUTED plans (not just conceived ones). A brilliant plan that falls apart in execution scores lower than a simple plan executed cleanly. This teaches: planning is only valuable when it becomes action.

**Successful integration:** The player conceives plans appropriate to their capacity (2-3 steps at Red), holds them in working memory during execution, and adapts when conditions change — all without over-planning or under-planning.

---

## 3. Game Design

### Setup
The player commands a siege operation from a war-table. A miniature fortress is visible with walls, gates, towers, and defenders. The player has limited siege units (battering rams, ladders, catapults, sappers) that must be deployed in sequence. The aesthetic: Red-stage war-room, brass tokens on a stone map, firelight.

### Interaction
- **2-move sieges:** "Break the gate (ram), then storm the courtyard (infantry)." Two actions in correct sequence.
- **3-move sieges:** "Suppress the archers (catapult), scale the wall (ladders), open the gate from inside (sappers)."
- **Resource-constrained:** "You have 2 rams and 1 catapult. The fortress has 3 gates. Which do you break?"
- **Adaptive plans:** "The enemy moves their archers. Your plan must change. What now?"
- **Contested plans:** "The enemy has a plan too. Anticipate and counter."

### Feedback
- Plan executed → animated siege sequence shows results
- Correct sequence → walls fall, territory gained, power-resonant victory
- Incorrect sequence → visible failure (ram hits reinforced wall, troops exposed)
- Optimal plan → bonus: "The siege-maker's genius!" (minimum moves)
- The game always shows WHY a plan failed (which step was wrong)

### Difficulty Adaptation
- Plan length: 2 → 3 → 4 steps
- Constraints: unlimited resources → limited → scarce
- Adaptivity: static fortress → moving defenders → counter-planning enemy
- Time pressure: unlimited → generous → moderate

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| 2-Move Plans | 1-5 | Simple sequences, clear goals, unlimited resources |
| 3-Move Plans | 5-15 | Longer sequences, some resource constraints |
| Resource-Constrained | 15-30 | Limited units, must choose which goals to pursue |
| Adaptive Plans | 30-50 | Conditions change mid-execution, must re-plan |
| Contested Plans | 50+ | Adversarial planning, anticipation, counter-strategy |

---

## 4. Item Pool Specification

### Item types
- **Fortress configurations:** Wall/gate/tower arrangements (procedurally generated from templates)
- **Unit sets:** Available siege units with different capabilities
- **Defender configurations:** Enemy placement and behaviour patterns
- **Constraint sets:** Resource limitations that force prioritisation
- **Adaptation triggers:** Mid-plan changes that require re-planning

### Minimum pool size
- 30+ fortress configurations (2-move difficulty)
- 25+ fortress configurations (3-move difficulty)
- 20+ resource-constrained scenarios
- 15+ adaptive scenarios (with mid-plan changes)
- 10+ contested scenarios (with adversarial planning)

### Generation rules
- Fortresses generated from modular components (walls, gates, towers, moats)
- Difficulty = minimum optimal plan length (computed algorithmically)
- All problems must have at least one solution within the player's resource set
- Adaptive scenarios: defender movements follow predictable (but not obvious) patterns
- Contested scenarios: enemy plans are 1 step shorter than player's capacity (beatable)

### Drive/shadow mapping
- Advisor acceptance/rejection → Agency probing
- Joint planning quality → Communion probing
- Advancement rate and satisfaction at current level → Eros probing
- Foundation drill quality → Agape probing
- Excessive planning time → dark-addiction signal
- Single-move attempts on multi-step problems → dark-allergy signal
- Over-complex plans for simple problems → golden-addiction signal
- Disengagement at longer plan requirements → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Tap-to-select (choose units and targets)
- Drag-and-drop (position units on map)
- Sequence input (order actions in a queue before execution)
- Swipe (scroll map, adjust view)

### Timing requirements
- Planning time tracked (diagnostic, not punishing at early stages)
- Execution is turn-based (not real-time) — no millisecond precision needed
- Later stages introduce time pressure on re-planning (adaptive scenarios)

### NPC/AI requirements
- Advisor NPC: suggests plans, provides scaffolding
- Ally NPC: coordinates joint plans, has own constraints
- Recruit NPC: receives teaching, asks questions about planning
- Enemy AI: executes counter-plans in contested scenarios (simple rule-based at Red)

### LLM requirements
- **Medium:** Scenario generation, outcome narration, adaptive difficulty
- Generates fortress configurations within difficulty constraints
- Narrates siege outcomes in Red-stage language
- Adapts enemy behaviour descriptions

### State persistence
- Maximum successful plan-length (running estimate)
- Optimality ratio (running average)
- Resource efficiency (running average)
- Planning-time patterns (for shadow detection)
- Drive-health signals from planning behaviour
- Shadow signals from engagement patterns
- Checkpoint position and phase
- Ongoing siege campaign state (territory gained, resources accumulated)
