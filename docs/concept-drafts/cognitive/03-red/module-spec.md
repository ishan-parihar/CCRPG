# Cognitive / Red — Module Specification

> **The Vibration:** Egocentric strategic cognition. The mind as weapon — short-horizon, concrete, power-serving. "I think in order to WIN."

---

## §1 Capacity Definition

### What this module measures

Cognitive/Red is the emergence of **concrete-operational thinking in service of egocentric power**:
- Hold 2 items in working memory simultaneously (n=2)
- Inhibit a prepotent response when it serves their goal (Stroop at 1000ms SOA)
- Execute 2-step sequential plans with concrete objects (Tower of London, 3 disks)
- Detect simple patterns and exploit them (early WCST — rare shifts)
- Sustain attention on a goal for short bursts

### Capacity dimensions

| Task | Pass threshold | Ceiling | Staircase parameter |
|---|---|---|---|
| n-back (n=2) | d' ≥ 1.5 | d' ≥ 3.0 | 1-up/2-down on d' bins |
| Stroop | Interference ≤ 150ms at SOA=1000ms | ≤ 80ms at SOA=800ms | SOA reduction |
| Go/No-Go | Commission errors ≤ 20% at 70/30 | ≤ 10% at 80/20 | Go-ratio increase |
| Tower of London (3-disk) | Solve 2-move in ≤ 2 attempts | 3-move optimally | Move-count increase |
| Simon | Congruency effect ≤ 100ms | ≤ 50ms | Stimulus pace increase |

### What this is NOT

Not formal-operational. The player cannot yet: hold abstract hypotheticals (Orange), plan 4+ moves ahead (Orange), shift rules flexibly (Amber-stable), or sustain attention for extended periods without reset (Amber).

---

## §2 Shadow Archetypes

### Dark-Addiction: "The Compulsive Strategist"

- **Core pattern:** Clings to cognitive control. Thinking becomes defence against vulnerability. Every situation must be "figured out" before engagement.
- **Drive pathology:** Agency hyper-sovereign (refuses all input); Communion collapsed (hoards strategy); Eros compulsive (cannot rest in not-knowing); Agape absent (always complexifying)
- **Behavioural signatures:** Excessive planning time on simple tasks; refusal to act without complete information; compulsive pattern-seeking in random stimuli; cannot "just do"
- **Protects against:** Vulnerability, chaos, unpredictability — the child who learned thinking = safety
- **Atman defense:** If I can predict, I won't be hurt. Cognition as armour against a chaotic environment.

### Dark-Allergy: "The Anti-Intellectual Warrior"

- **Core pattern:** Rejects cognitive engagement. Thinking dismissed as weakness. Pure action without reflection.
- **Drive pathology:** Agency impulsive (confuses impulse with sovereignty); Communion absent (dismisses collaborative thinking); Eros blocked (refuses upward pull); Agape distorted (pre-cognitive action disguised as wisdom)
- **Behavioural signatures:** Skipping/abandoning cognitive tasks; impulsive responses on planning-rewarding tasks; brute-force approaches despite repeated failure; anger at cognitive challenges
- **Protects against:** Paralysis, weakness, hesitation — the child who learned thinking = paralysis
- **Atman defense:** Thinkers get beaten; doers survive. Hesitation was punished.

### Golden-Addiction: "The Premature Abstractionist"

- **Core pattern:** Bypasses concrete-operational mastery to perform formal-operational thinking they haven't earned. Intellectual performance without genuine capacity.
- **Drive pathology:** Agency performative (asserts unearned capacity); Communion distorted (joins "smart" groups to perform); Eros compulsive upward (bypasses integration); Agape absent (refuses to embody current capacity)
- **Behavioural signatures:** Attempting n=3 before n=2 stable; abstract language without concrete grounding; dismissing current-level as "too easy" while failing; complexity as identity
- **Protects against:** Being seen as ordinary, being a beginner — the child rewarded for appearing smart
- **Atman defense:** "Seem smart" > "be capable." Appearance of intelligence as status.

### Golden-Allergy: "The Growth-Refuser"

- **Core pattern:** Refuses cognitive development. Comfort becomes fortress against not-yet-knowing. "I'm fine where I am" as defensive posture.
- **Drive pathology:** Agency contracted (cannot assert toward unknown); Communion distorted (mutual reinforcement of "enough"); Eros blocked (growth experienced as threat); Agape hyper-active (comfort disguised as wisdom)
- **Behavioural signatures:** Staying at comfortable difficulty indefinitely; anxiety when complexity increases; choosing repetitive familiar tasks; treating growth edge as threatening
- **Protects against:** Overwhelm, failure, pain of not-knowing — the child overwhelmed by cognitive demands
- **Atman defense:** Growing hurts; staying is safe. The growth edge = pain.

---

## §3 Drive-Health Landscape

| Drive | Domain | Healthy expression (→1.0) | Pathological pole (→0.0) |
|---|---|---|---|
| Agency | Dark | Sovereign thinking — "I figured this out myself" without domination | Cognitive aggression — intelligence as weapon, refuses all help |
| Agency | Golden | Independent engagement at growth edge without needing validation | Cognitive dependence — cannot attempt without guarantee, needs permission |
| Communion | Dark | Collaborative strategy — shares thinking without losing own approach | Cognitive fusion — adopts others' strategies without understanding |
| Communion | Golden | Intellectual partnership at growth edge — genuine co-thinking | Performative agreement — claims understanding to belong |
| Eros | Dark | Present to current mastery — enjoys n=2 without compulsive reaching | Cognitive restlessness — cannot rest, always demanding harder |
| Eros | Golden | Genuine aspiration — reaches toward complexity with curiosity | Cognitive bypass — performs higher capacity without substrate |
| Agape | Dark | Returns to foundations without shame — revisits basics with grace | Cognitive arrogance — refuses below-level engagement |
| Agape | Golden | Embodies capacity in lived reality — uses planning in actual decisions | Compartmentalised intelligence — can do it in tests but not in life |

---

## §4 Healing Vectors

### Heal/Evolve (bottom-up): Agape + Agency integrate dark shadows

**Dark-Addiction →** Agape returns to simplicity (tasks that reward simple engagement); Agency reframes non-planning as sovereign choice (acting without strategy IS sometimes the power move).

**Dark-Allergy →** Agape returns to body-mind connection (cognitive tasks embedded in physical action); Agency reframes strategy as weapon ("the warrior who plans WINS more").

### Evolve/Heal (top-down): Eros + Communion dissolve golden shadows

**Golden-Addiction →** Eros presents beauty of genuine mastery (real n=2 excellence > fake n=3); Communion pairs with others at genuine growth edge (performance is transparent in partnership).

**Golden-Allergy →** Eros gently invites toward complexity (optional, attractive, non-threatening); Communion normalises growth ("we're all learning together" dissolves isolation of fear).

### Integration criteria

| Quadrant | Resolved when... | Measurement |
|---|---|---|
| Dark-Addiction | Planning latency normalises; cognitive effort proportional to demands | Latency ratio < 1.3× on easy tasks for 5+ sessions |
| Dark-Allergy | Avoidance drops; engages cognitive tasks willingly | Skip rate < 10% for 5+ sessions |
| Golden-Addiction | Self-selected difficulty matches stable performance | Difficulty gap < 1 level for 5+ sessions |
| Golden-Allergy | Self-selects harder challenges; tolerates growth-edge discomfort | Attempts harder material in 3+ of last 5 sessions |

Module-level resolution: All 4 quadrant severities < 0.2 for 10+ sessions; no compound patterns active; all drive-health > 0.7; capacity transfer demonstrated.

---

## §5 Scoring Parameters

### Capacity score computation

```
capacity_score = weighted_mean([
  nback_d_prime / ceiling,          // 0.30
  1 - (stroop_interference / max),  // 0.20
  1 - commission_rate,              // 0.20
  tol_optimality_rate,              // 0.20
  1 - (simon_effect / max),         // 0.10
])
```

### Shadow integration score

```
shadow_integration = 1 - max(dark_addiction, dark_allergy, golden_addiction, golden_allergy)
```

The MAX function: the worst shadow determines the score.

### Theta-decay parameters

| Parameter | Value | Rationale |
|---|---|---|
| Onset delay | 10 days | EF skills relatively stable but do decay |
| Half-life | 21 days | Faster than crystallised knowledge, slower than motor |
| Maximum decay | 25% | Concrete operations don't disappear, efficiency drops |
| Recovery rate | 4× decay | A few sessions restore performance quickly |

**Decays:** Processing speed, accuracy under pressure, WM capacity under load, inhibitory efficiency.
**Doesn't decay:** The capacity for concrete operations, understanding of planning, the cognitive structure itself.

### Checkpoint progression

| Phase | Checkpoints | Mastery criteria |
|---|---|---|
| Early engagement | 1-5 | Stable n=2 (d'≥1.5), 70% Go/No-Go, 2-move ToL |
| Deepening | 5-20 | n=2 approaching ceiling (d'≥2.5), Stroop ≤120ms, shadow identified |
| Integration | 20-50 | n=2 at ceiling, drives balanced (none <0.5), shadow <0.4, transfer beginning |
| Evolution | 50+ | All tasks at ceiling, drives >0.7, shadows <0.2, ready for Amber |

---

## §6 Compound Shadows & Cross-Module Relationships

### Compound shadow patterns

| Pattern | Modules involved | Manifestation |
|---|---|---|
| "Thinks instead of feeling" | Cognitive/Red dark-addiction + Emotional/Red dark-allergy | Over-strategises to avoid emotional engagement |
| "Brute force" | Cognitive/Red dark-allergy + Somatic/Red dark-addiction | Refuses to think, relies on physical/impulsive action |
| "Premature philosopher" | Cognitive/Red golden-addiction + Intrapersonal/Red golden-addiction | Performs abstract self-reflection without substrate |
| "Comfortable warrior" | Cognitive/Red golden-allergy + Willpower/Red golden-allergy | Refuses cognitive AND volitional growth |
| "Lonely genius" | Cognitive/Red dark-addiction (agency) + Interpersonal/Red dark-allergy | High cognitive + interpersonal avoidance |

### Modules that SUPPORT Cognitive/Red

| Module | Mechanism |
|---|---|
| Cognitive/Magenta | n=1 is substrate for n=2; if Magenta decays, Red becomes unstable |
| Somatic/Red | Body-based alertness supports EF; arousal regulation affects performance |
| Willpower/Red | Effort persistence enables sustained cognitive engagement |

### Modules that Cognitive/Red SUPPORTS

| Module | Mechanism |
|---|---|
| Cognitive/Amber | Concrete operations are substrate for stable rule-following |
| Moral/Red | Egocentric moral reasoning requires 2-step consequence planning |
| Interpersonal/Red | Transactional social reasoning requires modelling others' self-interest |
| Intrapersonal/Red | Self-identification requires holding a self-concept |

### Shadows that FEED this module

| External shadow | Feeds... |
|---|---|
| Emotional/Red dark-allergy | Dark-addiction (avoiding emotions → over-reliance on cognition) |
| Somatic/Red dark-addiction | Dark-allergy (over-reliance on body → dismissal of mind) |
| Intrapersonal/Red golden-addiction | Golden-addiction (premature self-reflection without cognitive substrate) |
| Willpower/Red golden-allergy | Golden-allergy (refusing volitional growth reinforces cognitive comfort) |

### Shadows this module FEEDS

| This shadow | Feeds externally... |
|---|---|
| Dark-addiction | Emotional/Red dark-allergy (thinking replaces feeling) |
| Dark-allergy | Moral/Red dark-allergy (can't reason about ethics without thinking) |
| Golden-addiction | Spiritual/Red golden-addiction (performs transcendence without substrate) |
| Golden-allergy | Interpersonal/Red golden-allergy (can't develop relational complexity) |

---

## §7 Shadow Surfacing Sequence

### Progressive revelation

Shadows are surfaced through a 3-phase sequence across sessions:

1. **Observation (sessions 1-3):** Present conditions; observe behavioural signals without intervention
2. **Confirmation (sessions 3-5):** Present targeted probes to confirm dominant quadrant
3. **Intervention (sessions 5+):** Activate healing vectors for confirmed shadows

### Per-modality surfacing table

| Modality | Dark-Addiction probe | Dark-Allergy probe | Golden-Addiction probe | Golden-Allergy probe |
|---|---|---|---|---|
| Deterministic | Snap-decision trials (no planning time) | Pure-cognitive trials (no action frame) | Self-selected difficulty | Optional advancement |
| Language-Reflective | Simple question → observe over-explanation | Ask for reasoning → observe refusal | Ask concrete → observe abstract language | Ask "what's next?" → observe deflection |
| Embodied-Somatic | Feel-based rhythm (no tracking needed) | Tracking-heavy rhythm (cognitive in body) | Complex polyrhythm (style vs. accuracy) | Gradual complexity increase |
| Scenario-Choice | Simple binary → observe excessive deliberation | Planning-rewarding choice → observe impulse | Concrete choice → observe abstract justification | Increasing complexity → observe withdrawal |
| Strategic-Planning | 2-step problem → observe 60s planning | Multi-step problem → observe single-move attempts | Simple problem → observe over-complex solution | Longer plans → observe disengagement |
| Immersive-RPG | Safe area → observe over-caution | Visible trap → observe charging in | Complex systems → observe claims without mastery | Territory patterns → observe stagnation |
| Social-Cooperative | Simple coordination → observe over-planning | Coordination-required → observe solo attempts | Simple agent → observe over-complex modelling | Agent complexity increase → observe avoidance |

### Cross-validation

A shadow is confirmed when **2+ modalities** independently detect the same quadrant at threshold severity. Single-modality detection triggers increased probing across other modalities before intervention begins.

### Detection thresholds

| Signal | Threshold | Indicates |
|---|---|---|
| Planning latency on easy tasks | > 2× expected RT | Dark-addiction |
| Task avoidance rate | > 30% skip/abandon | Dark-allergy |
| Difficulty self-selection gap | > 2 levels above stable | Golden-addiction |
| Growth-edge avoidance | > 5 sessions without harder attempt | Golden-allergy |
| Help rejection rate | > 80% of offered scaffolding | Agency dark pathology |
| Strategy abandonment in social context | > 60% change when others present | Communion dark pathology |
| Checkpoint rushing | Advances before stability criteria | Eros dark pathology |
| Below-level dismissal | Performance drops > 40% on easy tasks | Agape dark pathology |
