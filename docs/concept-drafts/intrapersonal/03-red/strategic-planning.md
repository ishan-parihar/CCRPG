# Intrapersonal / Red — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes self-knowledge through MULTI-STEP SELF-MANAGEMENT — can the player plan around their own states, patterns, and limitations? At Red, this means: "I know I get tired after 3 rounds, so I'll rest at round 2." Planning that requires self-knowledge as input.
>
> **Why this axis for Intrapersonal/Red:** Self-knowledge becomes STRATEGIC when it informs planning. The warrior who knows "I lose focus after 5 minutes" plans short engagements. The warrior who knows "I'm strongest when angry" plans to get angry before the fight. This modality tests whether self-knowledge is APPLIED to multi-step planning.

---

## 1. Game Identity

- **Title:** "The Self-Strategist"
- **Core mechanic:** The player plans multi-step sequences that account for their own states, patterns, and limitations. Plans must incorporate self-knowledge: "I'll do X first (when I'm fresh), then Y (when I'm tired), then rest (because I know my limit)."
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Plan Around Fatigue → Plan Around Patterns → Plan Around Strengths → Plan Around Blind Spots → The Self-Strategy

---

## 2. Catalyst Delivery

**Catalyst:** "You have 5 tasks. You know you're strongest at the start and weakest at the end. How do you ORDER them?" The contact boundary is: "Can you use self-knowledge to PLAN?"

**Unconscious response:**
- *Submergent:* Does self-knowledge inform planning at all? The Narcissist plans as if always at peak. The Unexamined plans without self-data. The Premature Witness over-plans with abstract self-models. The Identity-Clinger plans only within identity.
- *Emergent:* Can they incorporate more self-knowledge into planning? Can they plan around limitations they've just discovered?

**Integration path:** Rewards plans that ACCOUNT FOR SELF accurately. A plan that says "I'll do the hard thing first because I know I fade" and WORKS scores higher than a plan that ignores self-knowledge and fails.

**Successful integration:** The player creates and executes plans that incorporate accurate self-knowledge — scheduling around fatigue, leveraging strengths, avoiding known weaknesses.

---

## 3. Game Design

### Setup
The Self-Strategist: a multi-task campaign where the player must ORDER and APPROACH tasks based on self-knowledge. Each task has different demands; the player's state changes across the sequence. Optimal ordering requires knowing yourself. The aesthetic: Red-stage war-planning — the warrior deciding which battles to fight first, which to save for later, based on self-knowledge.

### Interaction
- **Plan Around Fatigue (1-5):** Order 3 tasks knowing you'll be freshest at start. Simple fatigue-accounting.
- **Plan Around Patterns (5-15):** Order tasks knowing your patterns ("I'm better at X after Y").
- **Plan Around Strengths (15-30):** Allocate tasks to match demonstrated strengths. Leverage self-knowledge.
- **Plan Around Blind Spots (30-50):** Plan for situations where self-knowledge is incomplete. Manage uncertainty.
- **The Self-Strategy (50+):** Full self-knowledge-informed campaign planning — fatigue, patterns, strengths, blind spots, all integrated.

### Feedback
- Self-knowledge-informed success → "You planned around your fatigue. You put strength where it mattered. That's self-strategy."
- Denial-based failure → "You planned as if tireless. You crashed. Next time: plan for the real you."
- No self-data → "You ordered randomly. Your body had information. Use it next time."
- Over-planned → "You spent more time planning than doing. You already knew enough. Act."

### Difficulty Adaptation
- Task count: 3 → 5 → 7
- Self-knowledge demand: obvious (fatigue) → subtle (patterns) → novel (extrapolation)
- Plan complexity: ordering only → ordering + approach selection → full strategy
- Uncertainty: known self → partially known → novel situations

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Plan Around Fatigue | 1-5 | Simple fatigue-accounting in task ordering |
| Plan Around Patterns | 5-15 | Pattern-based planning; "after X, I'm better at Y" |
| Plan Around Strengths | 15-30 | Strength-leveraging; allocate tasks to capacities |
| Plan Around Blind Spots | 30-50 | Uncertainty management; plan for the unknown |
| The Self-Strategy | 50+ | Full self-knowledge-informed campaign |

---

## 4. Item Pool

### Item types
- **Fatigue-ordering tasks:** Sequence tasks knowing energy depletes
- **Pattern-leveraging tasks:** Order tasks to exploit known patterns
- **Strength-allocation tasks:** Match tasks to demonstrated capacities
- **Uncertainty-management tasks:** Plan with incomplete self-knowledge
- **Adaptive re-planning tasks:** Mid-plan, self-state changes; revise

### Minimum pool size
- 25+ fatigue-ordering, 20+ pattern-leveraging, 20+ strength-allocation, 15+ uncertainty, 10+ adaptive

### Drive/shadow mapping
- Plans ignore limitations → dark-addiction; plans contain no self-data → dark-allergy
- Over-elaborate plans → golden-addiction; rigid identity-only plans → golden-allergy

---

## 5. Technical Requirements

### Input types
- Drag-and-drop (task ordering); tap-to-select (approach selection); sequence input (plan construction)

### Timing requirements
- Planning phase untimed; execution phase at standard precision
- Cross-session data required for pattern and strength verification

### NPC/AI requirements
- Task-generation system with varied demands (strength, speed, patience, precision)
- Fatigue system that depletes predictably
- Performance tracking for strength/pattern verification

### LLM requirements
- **Medium:** Campaign generation, plan evaluation narration. Core scoring algorithmic.

### State persistence
- Plan history + outcomes; fatigue-accounting quality; pattern-utilisation rates; strength-allocation accuracy; plan execution rates; adaptation quality; over-planning indicators; drive/shadow signals; fatigue state; checkpoint position
