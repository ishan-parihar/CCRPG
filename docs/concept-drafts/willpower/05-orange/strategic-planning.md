# Willpower / Orange — Strategic-Planning Game Concept

> **Axis:** Planning goal-pursuit — structuring achievement across time, resource allocation, adaptive replanning.  **Why this axis for this module:** Achievement-will at Orange is not brute persistence but STRATEGIC persistence — the rational engineering of goal-pursuit across time.

---

## 1. Game Identity

**Name:** The Architect  
**Core loop:** Player plans and executes multi-phase projects within a simulated environment. Resources are limited, timelines shift, obstacles emerge. Success requires both commitment AND adaptive revision. The planning itself is the assessment.  
**Session length:** 5–15 minutes (each planning phase is a checkpoint).  
**Infinite checkpoint:** Yes — plan state persists between sessions.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange willpower — rational structuring of long-arc pursuit with adaptive flexibility.  
**Shadow surfacing:** DA surfaces as over-planning (filling every slot, no buffer, no rest phases built in), inability to leave slack. DAll surfaces as refusal to plan beyond immediate next step, plans that collapse at first obstacle. GA surfaces as abandoning plans at first revision-point ("plans are rigid, I'll just flow"). GAll surfaces as inability to revise plans even when new information demands it — the plan becomes sacred.  
**Drive probing:** Eros via ambitious goal-scoping. Agape via buffer/rest integration. Agency via self-authored plan structure. Communion via plans that account for others' needs/contributions.

## 3. Game Design

**Mechanic 1 — Project Decomposition:** Player receives a large goal and must break it into phases, milestones, and daily actions. Quality of decomposition = planning capacity. Adaptive: goal complexity scales with demonstrated skill.  
**Mechanic 2 — Resource Allocation Under Constraint:** Limited time/energy/attention tokens must be distributed across plan phases. Over-allocation (DA) leads to burnout events. Under-allocation (DAll) leads to goal-failure. Optimal: strategic distribution with buffers.  
**Mechanic 3 — Disruption and Replanning:** Mid-execution, obstacles emerge (resource loss, timeline shift, new information). Player must replan. GAll players resist all revision. Healthy players adapt proportionally. Frequency and severity of disruptions scale adaptively.  
**Mechanic 4 — Plan-vs-Execution Tracking:** Player executes their own plan in subsequent sessions. Deviation between plan and execution is tracked. Chronic over-planning (DA) or chronic under-execution (DAll) both surface. Self-calibration improves over time.

## 4. Item Pool

| Item Type | Count | Adaptive Range | Shadow Diagnostic |
|---|---|---|---|
| Project goals | 80+ | 3-phase → 12-phase | Complexity scales with capacity |
| Resource constraints | Variable | Abundant → severe scarcity | Reveals allocation style |
| Disruption events | 100+ | Minor → plan-breaking | GAll: refuses revision; healthy: adapts |
| Execution scenarios | Per-plan | Based on player's own plan | Plan-execution gap measurement |

## 5. Technical Requirements

**Plan representation:** Structured data — phases, milestones, resource assignments, dependencies. Visual timeline interface.  
**Simulation engine:** Deterministic project-simulation with stochastic disruptions. Outcomes calculable from plan quality + execution fidelity.  
**Multi-session persistence:** Plans span 3–10 real sessions. Progress tracked against player's own plan. Deviation metrics computed per-session.  
**Scoring outputs:** Decomposition quality, buffer ratio, revision willingness, plan-execution alignment, disruption-response adaptiveness. Feed module-spec §5.  
**No LLM required:** Plans evaluated against structural rubrics. Disruptions pre-authored with adaptive selection.
