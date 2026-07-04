# Cognitive / Green — Strategic-Planning Game Concept

> **Axis:** Planning within complexity — structuring action when multiple valid frameworks compete.  **Why this axis for this module:** Green cognition must translate multi-perspectival awareness into coherent action-plans; strategic-planning tests whether the player can organise complexity without collapsing or freezing.

---

## 1. Game Identity

**Name:** The Weaver's Loom
**Core loop:** Player receives a complex goal with 4 competing stakeholder constraints. Must construct a multi-step plan that satisfies as many constraints as possible without violating any absolutely. Plans are scored on integration quality, feasibility, and perspective-honouring.
**Session length:** 5-10 minutes (1 planning challenge per session, infinite checkpoint).
**Felt experience:** Weaving threads of different colours into a coherent tapestry — each thread has its own tension, and the weaver must honour them all.

## 2. Catalyst Delivery

**Catalyst type:** Multi-constraint planning where constraints emerge from different valid worldviews.
**Shadow provocation:** DA surfaces as inability to commit to plan steps (endless revision). GA surfaces as premature "elegant" solutions that ignore constraint details. DAll surfaces as plans that satisfy only one constraint perfectly while dismissing others. GAll surfaces as plans that acknowledge all constraints but refuse to prioritise when trade-offs are unavoidable.
**Drive engagement:** Agency = committing to plan steps. Communion = honouring all stakeholder constraints relationally. Eros = reaching toward the most integrative plan architecture. Agape = returning to check each constraint is genuinely served.
**Progression:** Diagnosis (planning patterns, revision frequency, constraint coverage) → Healing (shadow-targeted constraint configurations) → Evolution (fluid multi-constraint planning mastery).

## 3. Game Design

**Mechanics:**
- Goal presented with 4 stakeholder constraints (each from a different framework)
- Player has a "planning board" with draggable action-steps (8-12 available per challenge)
- Steps must be sequenced; some have dependencies, some conflict
- Constraint satisfaction meter shows real-time coverage of each stakeholder's needs
- Trade-off moments: certain step-pairs are mutually exclusive — player must choose
- "Perspective check" button: reveals how plan looks from each stakeholder's viewpoint
- Time budget: plan must be submitted within adaptive time limit

**Scoring model:**
- Constraint coverage: % of each stakeholder's needs addressed (weighted equally)
- Integration quality: do plan steps serve multiple constraints simultaneously
- Feasibility: are dependencies respected, is sequence logical
- Trade-off handling: when forced to choose, does player acknowledge what's sacrificed
- Revision efficiency: ratio of productive revisions to anxious re-shuffling

**Shadow-specific difficulty:**
- DA pattern: tighter time limits, reward early commitment to partial plans
- DAll pattern: increase constraint count, penalise single-constraint optimisation
- GA pattern: remove "elegant shortcut" steps, require granular constraint-by-constraint satisfaction
- GAll pattern: introduce hard trade-offs where equal treatment is impossible

## 4. Item Pool

**Planning domains:** Community project (build something serving diverse needs), Resource distribution (allocate limited resources across competing valid claims), Schedule design (time-allocation across incompatible priorities), System design (architecture serving different user-types). 10 challenges per domain, 40 total.
**Action-steps:** 8-12 per challenge, pre-validated for constraint-satisfaction profiles. Each step has coded relationships (enables, conflicts, depends-on) with other steps.
**Constraint sets:** 4 per challenge, each internally coherent but partially incompatible with others. Validated for genuine multi-perspectival complexity (no trick solutions).
**Trade-off pairs:** 2-3 per challenge where mutual exclusivity is genuine and unavoidable.

## 5. Technical Requirements

**Planning engine:** Constraint-satisfaction solver validates plan feasibility in real-time. Dependency graph per challenge (DAG, max 12 nodes).
**Metrics captured:** Step placement order, revision count and type, constraint-meter interactions, perspective-check usage, time-to-first-commit, time-to-submission, trade-off choices, shadow probability vector.
**Adaptive selection:** Challenge difficulty calibrated by constraint-compatibility (more incompatible = harder). Shadow-targeted selection prioritises challenges that provoke detected shadow.
**UI:** Drag-and-drop planning board, real-time constraint meters, perspective-view overlays. Touch and mouse input.
**Storage:** ~250 bytes/challenge-attempt (step sequence, timing, revisions, constraint scores).
**Accessibility:** Keyboard-navigable planning board, screen-reader constraint descriptions, adjustable time limits.
