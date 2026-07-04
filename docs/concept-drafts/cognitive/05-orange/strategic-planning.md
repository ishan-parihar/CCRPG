# Cognitive / Orange — Strategic-Planning Game Concept

> **Axis:** Multi-step planning and execution — structuring complex goals across time, managing cognitive resources.  **Why this axis for this module:** Orange is the first stage capable of genuine multi-step planning; strategic-planning reveals whether the player can hold a goal hierarchy, sequence sub-goals, and adapt when plans fail.

---

## 1. Game Identity

**Title:** The Architect's Table  
**Core Mechanic:** Player receives a complex goal and must decompose it into sub-goals, sequence them optimally, allocate limited resources across steps, execute the plan, and adapt when disruptions occur. Planning IS the game.  
**Duration:** 8–15 minutes per scenario, infinite checkpoint.  
**Internal Progression:** Planner → Sequencer → Resource-Manager → Adaptive Strategist (plans survive contact with disruption).

## 2. Catalyst Delivery

**Unique Presentation:** A construction/engineering metaphor — the player is building something complex (a bridge, a machine, a system) that requires ordered steps, resource management, and contingency planning. Visual, spatial, satisfying.  
**Differs from others:** Not measuring moment-to-moment cognitive speed (deterministic), not measuring self-awareness (language-reflective), not measuring hypothesis-testing (scenario-choice), not measuring body (embodied), not measuring collaboration (social), not measuring ecological spontaneity (immersive). This is sustained multi-step planning specifically.  
**Uniquely Surfaces:** DA (over-planning without execution — the plan becomes infinitely detailed but never enacted) and GAll (rigid plan adherence — refuses to adapt when disruption invalidates the original plan).  
**Successful Integration:** Player creates efficient plans, executes them decisively, adapts fluidly to disruption, and knows when a plan is "good enough" without perfecting it endlessly.

## 3. Game Design

**Setup:** Player receives a construction goal with constraints (limited resources, time budget, dependencies between steps). A workspace shows available materials, the goal state, and a planning interface.

**Interaction Phases:**
1. **Goal Analysis** — Player examines the target state and identifies required components
2. **Decomposition** — Player breaks the goal into 4–8 sub-goals and identifies dependencies
3. **Sequencing** — Player orders sub-goals, respecting dependencies and optimising for resource use
4. **Execution** — Player enacts the plan step-by-step; each step consumes resources and time
5. **Disruption & Adaptation** — Mid-execution, a disruption invalidates part of the plan; player must re-plan on the fly

**Feedback Examples:**
1. Optimal sequencing: construction flows smoothly, visual satisfaction, resource efficiency bonus
2. Over-planning detected (DA): time budget consumed in planning phase, gentle prompt — "The plan is ready. Begin."
3. Rigid adherence post-disruption (GAll): construction fails at disruption point, invitation to re-plan
4. Efficient adaptation: smooth pivot, new path found quickly, resilience bonus
5. Elegant solution: fewer steps than expected, architectural beauty bonus

**Difficulty Adaptation:** Sub-goal count (3→8), dependency complexity (linear→branching), resource scarcity (abundant→tight), disruption severity (minor→major), disruption timing (predictable→random).

**Internal Progression Table:**

| Level | Sub-goals | Dependencies | Resources | Disruptions | Adaptation Window |
|---|---|---|---|---|---|
| Planner | 3–4 | Linear chain | Abundant | None | N/A |
| Sequencer | 4–5 | Simple branching | Moderate | 1 minor | Generous |
| Resource-Manager | 5–6 | Complex branching | Tight | 1 major | Moderate |
| Adaptive Strategist | 6–8 | Network with cycles | Scarce | 2+ unpredictable | Tight |

## 4. Item Pool

**Construction Scenarios (25+):** Bridge-building, circuit design, supply-chain routing, expedition planning, recipe sequencing, machine assembly — all requiring formal-operational planning, no domain expertise.  
**Sub-goal Types (20+):** Foundation, structure, connection, verification, decoration, contingency, parallel-track, critical-path, optional-optimisation.  
**Resource Categories (15+):** Time units, material types, energy, attention tokens, tool uses, specialist actions — each scenario uses 3–5 resource types.  
**Disruption Types (20+):** Resource loss, dependency invalidation, new constraint added, timeline compression, goal modification, tool failure, environmental change.  
**Adaptation Strategies (15+):** Re-sequence remaining steps, substitute resources, abandon sub-goal, merge steps, parallel-track, accept sub-optimal, request extension.

## 5. Technical Requirements

**Input Types:** Drag-to-sequence for ordering, connect-nodes for dependencies, slider for resource allocation, tap-to-execute for plan enactment, drag-to-reorder for adaptation.  
**Timing:** Planning phase has soft time budget (visible but not hard-capped). Execution phase is turn-based. Adaptation window is time-pressured at higher levels.  
**NPC/AI:** The Disruption Agent — introduces complications at calibrated moments. Not adversarial, but challenging. Consistent personality (the world being complex, not hostile).  
**LLM:** Evaluates plan quality at advanced levels (novel scenarios where optimal path isn't pre-computed). Generates adaptive disruptions based on player's planning style.  
**State Persistence:** Planning efficiency (time-to-plan vs. plan quality), execution fidelity, adaptation speed, over-planning frequency (DA indicator), rigid-adherence frequency (GAll indicator), resource waste trajectory.
