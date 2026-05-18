# Cognitive / Amber — Scoring

> **Line:** Cognitive (executive function, perspective-taking, reasoning)
> **Stage:** Amber / Mythic-Membership (concrete operational, rule-following, systematic classification)
> **Vibration:** The rule that holds — a system of symbols that RELATE to each other. Hold two things stable. Classify. Follow the code. The mind serves the order.

---

## 1. Capacity Definition

Cognitive intelligence at Amber is **concrete operational capacity** — the ability to follow rules, classify systematically, hold stable representations (n=2 consolidated), detect rule-changes, and reproduce spatial sequences. This is the birth of SYSTEMATIC THOUGHT in the game: the first time the player can follow a multi-step rule, classify objects by category, and detect when a rule has changed.

### Core capacities measured

| Capacity | Definition | Assessment vehicle |
|---|---|---|
| **Rule-following** | Can the player identify and follow an explicit rule consistently? | WCST-lite (low shift cadence); rule-gated encounters |
| **Stable holding** | Can the player hold 2 items in working memory RELIABLY? (n=2 consolidated) | n-back at n=2 with high accuracy threshold |
| **Sequence reproduction** | Can the player reproduce a spatial sequence of length 3? | Corsi block-tapping / sigil-tracing |
| **Classification** | Can the player sort items by a given rule (colour, shape, function)? | Category-sorting tasks; hierarchical classification |
| **Rule-change detection** | Can the player detect when a rule has CHANGED? (early WCST) | Shift-detection after perseveration window |

### What this is NOT (Orange ceiling above, Red floor below)

- **NOT Red:** Red is n=2 emerging, egocentric, impulsive. Amber is n=2 STABLE, rule-following, systematic. The player can now hold two things AND apply a rule to them consistently.
- **NOT Orange:** Orange is n=3, formal operational, hypothetical-deductive. Amber cannot yet reason about HYPOTHETICALS — only about concrete, present, rule-governed situations. No "what if the rule were different?" — only "what IS the rule?"

---

## 2. Scoring Architecture

### 2.1 Theta (capacity estimate)

**Model:** 1PL IRT with Bayesian updating
- **Prior:** N(0, 1) at first encounter
- **Item difficulty:** Calibrated per rule-following, stable-holding, sequence-reproduction, classification, rule-change-detection
- **Update:** After each response (correct/incorrect + latency as secondary)

### 2.2 Composite score

```
cognitive_amber = weighted_aggregate(
  rule_following:         0.25,   ← the DEFINING Amber cognitive capacity
  stable_holding:         0.25,   ← n=2 consolidated (not emerging)
  sequence_reproduction:  0.20,
  classification:         0.15,
  rule_change_detection:  0.15    ← early WCST; the seed of Orange
)
```

### 2.3 Theta-decay

- **Half-life:** 16 days (slightly slower than Magenta — concrete operations are more stable once established)
- **Max decay:** 18% of peak theta
- **Rationale:** Rule-following capacity is more durable than symbolic capacity but still needs exercise; neglected rules become forgotten rules

### 2.4 Stage-transition threshold

- **Amber → Orange unlock:** Theta ≥ 0.7 on stable-holding (n=2 perfect) AND rule-change-detection ≥ 0.6 (can detect shifts reliably)
- **Confirmation:** Must demonstrate across ≥ 4 sessions (Amber is stable; transition must be genuine)
- **Cross-line requirement:** At least 2 other lines at Amber (per stage-advancement rules)

---

## 3. Drive-Health Integration

### 3.1 Drive-health weight for Cognitive/Amber

**Weight: 0.30** (moderate — cognitive is primary but at Amber the drives are channelled through group-belonging; individual cognitive drive is less salient than at Orange)

### 3.2 Healthy drive expression at Cognitive/Amber

| Drive | Healthy expression |
|---|---|
| **Agency** | Applies rules independently; classifies without needing external confirmation; solves within the system |
| **Communion** | Follows shared rules; coordinates cognitive effort with group; learns from the tradition |
| **Eros** | Reaches toward more complex rules with curiosity; wants to understand the deeper code |
| **Agape** | Returns to basic rules with care; maintains mastered classifications; embodies the system |

### 3.3 Pathological drive expression at Cognitive/Amber

| Drive | Dark-domain pathology | Golden-domain pathology |
|---|---|---|
| **Agency** | Uses rules to dominate (rigid enforcement on others; "I know the rule, you don't") | Cannot apply rules without group validation; waits for authority |
| **Communion** | Loses own reasoning in group consensus (thinks what the group thinks) | Cannot learn from tradition; rejects all shared knowledge |
| **Eros** | Refuses new rules; clings to first-learned system; perseverates | Rushes past rule-mastery toward hypothetical reasoning (Orange-bypass) |
| **Agape** | Cannot return to basic rules; "too advanced for fundamentals" | Cannot embody rules in action; knows the code but doesn't follow it |

---

## 4. Shadow Summary

| Quadrant | Archetype | Core pattern |
|---|---|---|
| **Dark-Addiction** | The Rigid Systematiser | Clings to rules as ABSOLUTE — cannot tolerate ambiguity; perseverates on known classifications; the rule IS reality |
| **Dark-Allergy** | The Rule-Breaker | Refuses systematic thought; stays in egocentric Red reasoning; "rules are for sheep" |
| **Golden-Addiction** | The Premature Theorist | Rushes toward hypothetical-deductive reasoning without mastering concrete operations; performs formal logic without genuine rule-mastery |
| **Golden-Allergy** | The System-Refuser | Fears the expansion into formal operations; refuses abstraction; "I don't need to think about thinking" |

### 4.1 Compound shadows (cross-module)

| Compound | Modules involved | Pattern |
|---|---|---|
| **The Dogmatic Enforcer** | Cognitive/Amber dark-addiction + Moral/Amber dark-addiction | Rigid rules + rigid morality = fundamentalist thinking; cannot question the code |
| **The Clever Rebel** | Cognitive/Amber dark-allergy + Willpower/Amber dark-allergy | Refuses rules AND refuses discipline; stuck in Red impulsivity with cognitive justification |
| **The Abstract Escapist** | Cognitive/Amber golden-addiction + Intrapersonal/Amber golden-addiction | Performs abstract reasoning while avoiding concrete self-examination; theory without practice |
| **The Frozen Conformist** | Cognitive/Amber dark-addiction + Interpersonal/Amber dark-addiction | Rigid rules + rigid group-belonging = cannot think independently; the group's rules are absolute |

---

## 5. Modality Affinity

| Modality | Affinity | Rationale |
|---|---|---|
| Deterministic | ★★★★★ | Core measurement — rule-following, n=2, Corsi, WCST are all objective |
| Language-reflective | ★★★☆☆ | Rule-articulation; can state the rule but not yet reason ABOUT it |
| Scenario-choice | ★★★★☆ | Rule-based dilemmas; "the code says X but the situation is Y" |
| Embodied-somatic | ★★★☆☆ | Disciplined body follows rules; kata, drill, liturgical movement |
| Strategic-planning | ★★★★☆ | Multi-step rule-following; sequencing within a system |
| Social-cooperative | ★★★★☆ | Shared rule-following; coordinated cognitive effort within group |
| Immersive-rpg | ★★★★★ | The rule-governed world IS the cognitive environment — codes everywhere |

---

## 6. Cross-Validation Rules

- **Deterministic × Language-reflective:** If language-reflective shows sophisticated rule-talk but deterministic shows n=2 instability → golden-addiction (performing without capacity)
- **Scenario-choice × Deterministic:** If scenario-choice shows rigid rule-application but deterministic shows good WCST → the rigidity is MORAL not cognitive (cross-module shadow)
- **Immersive-rpg × Deterministic:** If ecological rule-engagement is high but structured WCST fails → engagement without genuine rule-detection capacity
- **Social-cooperative × Classification:** If group classification succeeds but solo fails → communion-dependence (cannot reason independently)
- **Strategic-planning × Sequence-reproduction:** If planning attempts exceed Corsi-3 capacity → golden-addiction signal (attempting Orange-level planning without Amber mastery)
