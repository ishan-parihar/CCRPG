# Cognitive / Red — Scoring Skeleton

> **The Vibration:** Egocentric strategic cognition. The mind as weapon — short-horizon, concrete, power-serving. "I think in order to WIN." Not yet abstract, not yet rule-following, but genuinely operational: sequences, patterns, and 2-step plans deployed in service of the ego's will.

---

## 1. The Vibration

### 1.1 What IS this capacity?

Cognitive/Red is the emergence of **concrete-operational thinking in service of egocentric power**. The player can:
- Hold 2 items in working memory simultaneously (n=2)
- Inhibit a prepotent response when it serves their goal (Stroop at 1000ms SOA)
- Execute 2-step sequential plans with concrete objects (Tower of London, 3 disks)
- Detect simple patterns and exploit them (early WCST — rare shifts)
- Sustain attention on a goal for short bursts (not sustained vigilance)

The cognitive structure is **strategic but short-horizon**. The player thinks ahead, but only 1-2 moves. They can hold a plan, but not a plan-about-a-plan. They can detect a rule, but not a rule-about-rules.

### 1.2 What does HEALTHY look like?

A healthy Cognitive/Red expression:
- Uses planning to achieve goals WITHOUT requiring domination of others
- Can hold two competing pieces of information and choose between them
- Inhibits impulses when inhibition serves a CHOSEN goal (not when externally imposed)
- Deploys cognitive resources with confidence — "I CAN figure this out"
- Accepts cognitive limits without shame (doesn't pretend to know what they don't)
- Uses strategy in service of boundaries (healthy assertion) not predation

### 1.3 What does PATHOLOGICAL look like?

| Shadow quadrant | Cognitive/Red expression |
|---|---|
| **Dark-Addiction** | Compulsive strategising. Cannot stop planning. Uses cognition to control everything. "If I think hard enough, nothing can hurt me." Hyper-vigilant pattern-detection. Cannot rest the mind. |
| **Dark-Allergy** | Anti-intellectual aggression. "Thinking is weakness." Refuses to plan, acts on pure impulse. Dismisses strategy as cowardice. Cannot hold two ideas simultaneously because they WON'T, not because they can't. |
| **Golden-Addiction** | Premature abstraction. Tries to think at Orange/formal-operational level without the substrate. Bypasses concrete engagement. "I'm too smart for this simple stuff." Performs complexity without genuine capacity. |
| **Golden-Allergy** | Terror of complexity. Refuses challenges that require more than current capacity. "I don't want to think harder." Actively avoids situations that would develop cognitive capacity. Desacralises growth. |

---

## 2. Capacity Scoring

### 2.1 Core tasks and thresholds

| Task | Pass threshold | Ceiling | Staircase parameter |
|---|---|---|---|
| **n-back (n=2)** | d' ≥ 1.5 at n=2 | d' ≥ 3.0 at n=2 | 1-up/2-down on d' bins |
| **Stroop** | Interference cost ≤ 150ms at SOA=1000ms | Interference ≤ 80ms at SOA=800ms | SOA reduction |
| **Go/No-Go** | Commission errors ≤ 20% at 70/30 ratio | Commission ≤ 10% at 80/20 | Go-ratio increase |
| **Tower of London (3-disk)** | Solve 2-move problems in ≤ 2 attempts | Solve 3-move problems optimally | Move-count increase |
| **Simon** | Congruency effect ≤ 100ms | Congruency ≤ 50ms | Stimulus pace increase |

### 2.2 Capacity score computation

```
capacity_score = weighted_mean([
  nback_d_prime / ceiling_d_prime,          // weight: 0.30
  1 - (stroop_interference / max_interference),  // weight: 0.20
  1 - commission_rate,                      // weight: 0.20
  tol_optimality_rate,                      // weight: 0.20
  1 - (simon_effect / max_simon_effect),    // weight: 0.10
])
```

### 2.3 What "pass" means developmentally

The player can reliably:
- Track 2 items while processing (working memory online)
- Override a dominant response when it conflicts with their goal
- Plan 2 moves ahead with concrete objects
- Detect spatial incongruence and respond correctly

This is NOT formal-operational. They cannot yet:
- Hold abstract hypotheticals (that's Orange)
- Plan 4+ moves ahead (that's Orange)
- Shift rules flexibly (that's Amber-stable)
- Sustain attention for extended periods without reset (that's Amber)

---

## 3. Drive-Health Scoring (4 drives × 2 domains = 8 scores)

Each drive-domain score ranges 0-1. Scored from behavioural signals within gameplay.

### 3.1 Agency (Horizontal — Catalyst)

**Agency Dark (submergent):**
- HEALTHY (→1.0): Uses cognitive capacity to assert boundaries. Plans for self-protection. Thinks independently. "I figured this out myself."
- PATHOLOGICAL (→0.0): Uses cognition to dominate/control. Plans to manipulate. Refuses help as weakness. Cognitive aggression — using intelligence as a weapon against others.
- **Signals:** Does the player use planning to solve OR to dominate? Do they accept hints or reject all assistance? Do they celebrate solving or celebrate defeating?

**Agency Golden (emergent):**
- HEALTHY (→1.0): Can stand alone at the cognitive edge without needing validation. Attempts harder problems independently. Tolerates uncertainty.
- PATHOLOGICAL (→0.0): Needs external confirmation for every cognitive step. Cannot attempt without guarantee of success. Cognitive dependence masked as "being careful."
- **Signals:** Does the player attempt novel challenges without prompting? Do they persist after failure without external encouragement? Do they trust their own reasoning?

### 3.2 Communion (Horizontal — Experience)

**Communion Dark (submergent):**
- HEALTHY (→1.0): Can share cognitive process with others. Accepts collaborative problem-solving. Learns from others' strategies without losing own approach.
- PATHOLOGICAL (→0.0): Cognitive fusion — adopts others' strategies without understanding. Cannot think independently in social context. Loses own reasoning when presented with another's.
- **Signals:** In cooperative contexts, does the player maintain their own strategy while integrating others'? Or do they abandon their approach entirely?

**Communion Golden (emergent):**
- HEALTHY (→1.0): Can join with others at the cognitive edge — collaborative problem-solving at the growth frontier. Genuine intellectual partnership.
- PATHOLOGICAL (→0.0): Premature cognitive merging — claims to understand what they don't because the group "gets it." Performative agreement. Intellectual conformity at the growth edge.
- **Signals:** In group challenges, does the player genuinely engage with novel material or perform understanding they don't have?

### 3.3 Eros (Vertical — Matrix→Potentiator, reaching upward)

**Eros Dark (submergent):**
- HEALTHY (→1.0): Can rest in current cognitive capacity without compulsive growth pressure. Enjoys n=2 mastery without needing n=3 immediately. Present to current capacity.
- PATHOLOGICAL (→0.0): Cannot rest. Compulsive difficulty-seeking. Rushes through mastery levels. Treats current capacity as "not enough." Cognitive restlessness.
- **Signals:** Does the player savour mastery at current level or immediately demand harder? Do they rush through checkpoints? Is there a driven quality to their progression?

**Eros Golden (emergent):**
- HEALTHY (→1.0): Reaches toward n=3 / harder problems with genuine aspiration. Engages the growth edge with curiosity and willingness. Approaches complexity as invitation.
- PATHOLOGICAL (→0.0): Bypasses current mastery to perform at higher levels. Attempts n=3 before n=2 is stable. Skips integration steps. "I'm already past this" without demonstration.
- **Signals:** Does the player attempt higher difficulty before stabilising current? Do they skip practice trials? Is there a performative quality to their reaching?

### 3.4 Agape (Vertical — Potentiator→Matrix, returning downward)

**Agape Dark (submergent):**
- HEALTHY (→1.0): Can return to simpler cognitive tasks without shame. Revisits n=1 for maintenance without feeling "beneath them." Embodies mastery at lower levels with grace.
- PATHOLOGICAL (→0.0): Refuses to engage below current level. "That's too easy, it's beneath me." Cannot return to foundations. Cognitive arrogance toward simpler tasks.
- **Signals:** When presented with below-level tasks, does the player engage fully or dismiss? Do they maintain quality on "easy" tasks or phone it in?

**Agape Golden (emergent):**
- HEALTHY (→1.0): Can embody new cognitive capacity in lived reality — uses n=2 planning in actual game decisions, not just in isolated tasks. Integration into whole-person functioning.
- PATHOLOGICAL (→0.0): Cognitive capacity exists only in isolated test contexts. Cannot transfer planning ability to real game situations. Compartmentalised intelligence.
- **Signals:** Does the player's strategic behaviour in free-play contexts match their task performance? Or is there a gap between "can do it in a test" and "does it in life"?

### 3.5 Drive-health score computation

```
drive_health_score = mean([
  agency_dark, agency_golden,
  communion_dark, communion_golden,
  eros_dark, eros_golden,
  agape_dark, agape_golden
])
```

---

## 4. Shadow Integration Scoring (4 quadrants)

Each quadrant score ranges 0-1 (0 = fully active shadow, 1 = fully resolved).

### 4.1 Dark-Addiction: "The Compulsive Strategist"

**What it looks like:** The player cannot stop planning. They over-think simple problems. They use cognition defensively — as armour against uncertainty. Every situation must be "figured out" before engagement.

**Resolution criteria (→1.0):**
- Can engage tasks without pre-planning when appropriate
- Tolerates uncertainty without compulsive analysis
- Can act on intuition/impulse when the situation calls for it
- Cognitive effort is proportional to task demands (not always maximal)

**Measurement signals:**
- Time-to-first-response on simple tasks (over-thinking = long latency on easy items)
- Ratio of planning time to execution time (pathological = planning >> execution)
- Willingness to engage "just do it" tasks without strategy

### 4.2 Dark-Allergy: "The Anti-Intellectual Warrior"

**What it looks like:** The player refuses to think. They act on impulse even when planning would clearly help. They dismiss cognitive challenges as "boring" or "pointless." They avoid n-back and planning tasks.

**Resolution criteria (→1.0):**
- Engages cognitive tasks without avoidance or dismissal
- Can sustain attention on a planning problem without bailing out
- Acknowledges that thinking serves their goals (not weakness)
- Chooses to plan when planning would help (not always, but when appropriate)

**Measurement signals:**
- Task avoidance rate (skipping/abandoning cognitive challenges)
- Impulsive response rate on tasks that reward planning
- Time spent on cognitive tasks vs. action tasks (extreme skew = allergy)

### 4.3 Golden-Addiction: "The Premature Abstractionist"

**What it looks like:** The player performs complexity they haven't earned. They attempt n=3 before n=2 is stable. They use abstract language without concrete grounding. They bypass the concrete-operational stage to perform formal-operational.

**Resolution criteria (→1.0):**
- Engages current-level challenges fully before reaching for harder ones
- Demonstrates concrete mastery before attempting abstraction
- Can articulate their reasoning in concrete terms (not just abstract)
- Growth is genuine (performance matches aspiration)

**Measurement signals:**
- Gap between attempted difficulty and stable performance (large gap = bypass)
- Error rate on self-selected "hard" problems vs. system-selected appropriate problems
- Whether the player can explain their strategy concretely or only abstractly

### 4.4 Golden-Allergy: "The Growth-Refuser"

**What it looks like:** The player refuses to engage harder material. They stay at comfortable difficulty indefinitely. They actively avoid the growth edge. "I'm fine where I am" becomes a defensive posture against development.

**Resolution criteria (→1.0):**
- Willingly engages growth-edge challenges when presented
- Tolerates the discomfort of not-yet-knowing
- Can sit with cognitive difficulty without fleeing to comfort
- Approaches new complexity with curiosity rather than dread

**Measurement signals:**
- Response to difficulty increases (approach vs. avoidance)
- Time spent at plateau before attempting advancement
- Emotional valence signals when harder material is presented (if available)
- Whether the player ever self-selects harder challenges

### 4.5 Shadow integration score computation

```
shadow_integration_score = 1 - max(
  dark_addiction_severity,
  dark_allergy_severity,
  golden_addiction_severity,
  golden_allergy_severity
)
```

The MAX function means: the worst shadow determines the score. A module with one severe shadow is unhealthy regardless of the other three being resolved.

---

## 5. Checkpoint Progression Rubric

### 5.1 Early engagement (Checkpoints 1-5)

**What mastery looks like:**
- Stable n=2 performance (d' ≥ 1.5 consistently)
- Can inhibit on 70% of Go/No-Go trials
- Solves 2-move ToL problems
- Basic drive signals emerging (can observe approach/avoidance patterns)

**What the game does:**
- Presents core tasks at calibrated difficulty
- Observes drive activation patterns (which drives are healthy, which are pathological)
- Begins mapping the shadow landscape (which quadrant is dominant)
- Provides catalyst at the contact boundary

### 5.2 Deepening (Checkpoints 5-20)

**What mastery looks like:**
- n=2 performance approaching ceiling (d' ≥ 2.5)
- Stroop interference declining (≤ 120ms)
- 3-move ToL problems attempted
- Drive-health patterns stabilising (consistent signals across sessions)
- Dominant shadow quadrant identified and beginning to shift

**What the game does:**
- Increases task complexity within Red parameters
- Presents drive-specific catalyst (targets the weakest drive)
- Begins shadow-specific interventions (presents opportunities to resolve dominant shadow)
- Introduces cross-task challenges (combining n-back + inhibition)

### 5.3 Integration (Checkpoints 20-50)

**What mastery looks like:**
- n=2 at ceiling (d' ≥ 3.0)
- All Red-level tasks at or near ceiling
- Drive-health balanced (no single drive below 0.5)
- Shadow severity declining (dominant quadrant < 0.4)
- Beginning to demonstrate capacity transfer (planning in free-play contexts)

**What the game does:**
- Presents integration challenges (use cognitive capacity in novel contexts)
- Tests drive-health under pressure (stress the system and observe which drive breaks)
- Presents shadow-resolution opportunities (the game creates conditions where the shadow CAN dissolve)
- Begins presenting Amber-edge material as optional catalyst (golden-domain probing)

### 5.4 Evolution (Checkpoints 50+)

**What mastery looks like:**
- All Red cognitive tasks at ceiling with minimal effort
- Drive-health consistently high (all 8 scores > 0.7)
- Shadow integration near-complete (all 4 quadrants < 0.2 severity)
- Capacity transfer demonstrated (cognitive planning visible in all game contexts)
- Ready for Amber transition (can sustain attention, beginning rule-following)

**What the game does:**
- Maintains Red health through varied catalyst (the module never "ends")
- Presents increasingly subtle shadow probes (micro-shadows, compound patterns)
- Offers Amber-stage cognitive challenges as growth invitations
- Serves as foundation maintenance for players who have advanced beyond Red

---

## 6. Theta-Decay Parameters

### 6.1 Decay sensitivity: MEDIUM

Cognitive/Red is moderately robust. Once concrete-operational thinking is established, it doesn't vanish quickly. But without exercise, the SPEED and ACCURACY of executive functions decline.

| Parameter | Value | Rationale |
|---|---|---|
| **Onset delay** | 10 days | EF skills are relatively stable but do decay |
| **Half-life** | 21 days | Moderate — faster than crystallised knowledge, slower than motor skills |
| **Maximum decay** | 25% | Concrete operations don't disappear, but efficiency drops |
| **Recovery rate** | 4× decay rate | A few sessions of n-back restore performance quickly |

### 6.2 What decays vs. what doesn't

**Decays:**
- Processing speed (RT increases)
- Accuracy under time pressure (more errors)
- Working memory capacity under load (d' drops)
- Inhibitory efficiency (more commission errors)

**Doesn't decay:**
- The CAPACITY for concrete operations (once achieved, the structure remains)
- Understanding of planning (they know HOW, even if rusty)
- The cognitive structure itself (Red-level thinking doesn't regress to Magenta)

### 6.3 What triggers accelerated decay

- Chronic avoidance of cognitive challenges (dark-allergy pattern)
- Exclusive reliance on other lines (somatic/emotional) without cognitive engagement
- Extended periods of purely routine activity (no novelty, no challenge)

---

## 7. Cross-Module Dependencies

### 7.1 Modules that SUPPORT Cognitive/Red

| Module | How it supports |
|---|---|
| **Cognitive/Magenta** | Must be healthy — n=1 is the substrate for n=2. If Magenta decays, Red becomes unstable. |
| **Somatic/Red** | Body-based alertness supports cognitive performance. Arousal regulation affects EF. |
| **Willpower/Red** | Effort persistence enables sustained cognitive engagement. Without will, cognition fatigues. |

### 7.2 Modules that Cognitive/Red SUPPORTS

| Module | How it's supported |
|---|---|
| **Cognitive/Amber** | Red must be healthy for Amber to develop. Concrete operations are the substrate for stable rule-following. |
| **Moral/Red** | Egocentric moral reasoning requires the cognitive capacity to plan consequences (2-step). |
| **Interpersonal/Red** | Transactional social reasoning requires the cognitive capacity to model others' self-interest. |
| **Intrapersonal/Red** | Self-identification ("I am the one who...") requires the cognitive capacity to hold a self-concept. |

### 7.3 Compound shadow patterns

| Pattern | Modules involved | What it looks like |
|---|---|---|
| "Thinks instead of feeling" | Cognitive/Red dark-addiction + Emotional/Red dark-allergy | Over-strategises to avoid emotional engagement. Uses planning as emotional defence. |
| "Brute force" | Cognitive/Red dark-allergy + Somatic/Red dark-addiction | Refuses to think, relies entirely on physical/impulsive action. |
| "Premature philosopher" | Cognitive/Red golden-addiction + Intrapersonal/Red golden-addiction | Performs abstract self-reflection without concrete cognitive or self-knowledge substrate. |
| "Comfortable warrior" | Cognitive/Red golden-allergy + Willpower/Red golden-allergy | Refuses cognitive AND volitional growth. Stays in comfortable action patterns. |
