# Moral / Orange — Strategic-Planning Game Concept

> **Axis:** Planning moral action — structuring ethical commitments across time and managing competing obligations.  **Why this axis for this module:** Orange moral capacity must extend beyond single-moment reasoning into sustained ethical planning — principles must be operationalised across time, not just recognised in the moment.

---

## 1. Game Identity

**Title:** The Ethical Architect  
**Genre:** Turn-based moral-commitment planning with resource constraints  
**Session length:** 5–10 minutes (infinite checkpoint)  
**Core loop:** Moral landscape presented → commitments identified → plan structured across turns → competing obligations arise → plan adapted or held → outcomes scored

The player must plan how to honour multiple moral commitments across time under resource constraints. The game tests whether principled reasoning can be sustained and operationalised — not just felt in the moment but structured into action.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange moral — principled reasoning operationalised across time  
**Shadow surfacing:** DAll (conformist) surfaces when player follows pre-given plans without examining their moral basis. GAll (fortress) surfaces when player refuses to adapt plans even when new moral information emerges.  
**Progression:** Diagnosis (sessions 1–3) → Healing (4–8) → Evolution (9+)

Healing catalyst: for the conformist, scenarios where the "obvious plan" violates a principle the player claims to hold — forcing examination. For the fortress, scenarios where new stakeholders emerge mid-plan and rigid adherence causes harm — inviting adaptive principled reasoning. Evolution catalyst: planning scenarios where multiple principles can be honoured simultaneously through creative structuring.

## 3. Game Design

**Mechanics:**
- Moral landscape: 3–5 stakeholders with legitimate claims on player's resources (time, attention, commitment)
- Player allocates commitment-tokens across turns (5–8 turns per scenario)
- Each turn: one competing obligation emerges (new stakeholder, changed circumstances, resource reduction)
- Player must adapt plan OR justify holding course
- Scoring: principle-consistency across turns, stakeholder-harm minimisation, justification quality for adaptations

**Difficulty staircase:**
- Level 1: Two commitments, ample resources, clear priority
- Level 2: Three commitments, scarce resources, no clear priority
- Level 3: Mid-plan moral information changes the landscape (belief revision required)
- Level 4: Player's own prior commitments create current conflicts (moral responsibility)
- Level 5: Tragic planning — not all commitments can be honoured, principled triage required

**Shadow-specific mechanics:**
- DAll probe: pre-structured "default plans" available — does player examine them or accept?
- GAll probe: mid-plan stakeholder emergence — does player adapt or rigidify?
- DA probe: optimisation framing available — does player treat stakeholders as variables?
- GA probe: option to "spread thin" across all commitments without prioritising — does player avoid hard choices?

## 4. Item Pool

- 50 base planning scenarios across moral domains (professional ethics, family obligations, civic duty, personal integrity, justice, care)
- 120 competing-obligation events (3–4 per scenario, drawn adaptively)
- 30 belief-revision triggers (new information that changes moral landscape)
- Commitment-token economy: 5 resource types (time, energy, money, attention, social capital)
- 40 justification prompts for plan-adaptation moments
- Multi-session arcs: 10 planning chains where prior plans seed future scenarios

## 5. Technical Requirements

- Turn-based planning engine with state-tracking across 5–8 turns
- Commitment-allocation interface: drag-drop tokens across stakeholder claims
- Competing-obligation event system: adaptive selection based on shadow profile
- Plan-consistency scorer: tracks principle-adherence across turns and adaptations
- Justification evaluator: scores quality of reasoning when player adapts or holds
- Cross-session responsibility tracker: links prior planning choices to future scenarios
- Drive-health mapping: rigid-hold → GAll; default-accept → DAll; optimise-all → DA; spread-thin → GA
