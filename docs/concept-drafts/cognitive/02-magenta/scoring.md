# Cognitive / Magenta — Scoring

> **Line:** Cognitive (executive function, perspective-taking, reasoning)
> **Stage:** Magenta / Magic (pre-operational, symbolic substitution, magical thinking)
> **Vibration:** The first spell — a symbol stands for something else. Hold one thing in mind. The world responds to imagery.

---

## 1. Capacity Definition

Cognitive intelligence at Magenta is **pre-operational symbolic capacity** — the ability to use one thing to represent another, to hold a single symbol in mind, and to recognise its return. This is the birth of MAGIC in the game: the first time a gesture means "fire," a rune means "open," an image stands for a force.

### Core capacities measured

| Capacity | Definition | Assessment vehicle |
|---|---|---|
| **Symbol-recognition** | Can the player recognise that a symbol represents something? | Rune-matching, symbol-pairing |
| **Symbol-holding** | Can the player hold ONE symbol in working memory? (n=1) | n-back at n=1; echo-casting |
| **Symbol-substitution** | Can the player use a symbol to ACT? (gesture → effect) | Spell-casting with symbolic input |
| **Pattern-echo** | Can the player recognise when a symbol RETURNS? | Repetition detection across short sequences |
| **Inhibitory seed** | Can the player NOT respond to a non-target? (Go/No-Go seed) | Phantom Feint; respond to target symbol, inhibit on distractor |

### What this is NOT (Red ceiling above, Infrared floor below)

- **NOT Infrared:** Infrared is pure sensorimotor — tap what you see, no symbolic mediation. Magenta ADDS the symbolic layer: the tap now MEANS something.
- **NOT Red:** Red is n=2, egocentric reasoning, concrete operations emerging. Magenta is n=1, pre-operational, magical. The player cannot yet hold TWO symbols simultaneously or reason about relationships between symbols.

---

## 2. Scoring Architecture

### 2.1 Theta (capacity estimate)

**Model:** 1PL IRT with Bayesian updating
- **Prior:** N(0, 1) at first encounter
- **Item difficulty:** Calibrated per symbol-recognition, symbol-holding, symbol-substitution, pattern-echo, inhibitory-seed
- **Update:** After each response (correct/incorrect + latency as secondary)

### 2.2 Composite score

```
cognitive_magenta = weighted_aggregate(
  symbol_recognition:  0.20,
  symbol_holding:      0.30,   ← heaviest — this IS the Magenta cognitive capacity
  symbol_substitution: 0.20,
  pattern_echo:        0.15,
  inhibitory_seed:     0.15
)
```

### 2.3 Theta-decay

- **Half-life:** 14 days (cognitive is the fastest-moving line; decays faster than spiritual/moral)
- **Max decay:** 20% of peak theta
- **Rationale:** Cognitive capacity at Magenta is fragile — symbolic thinking needs regular exercise or it regresses to sensorimotor

### 2.4 Stage-transition threshold

- **Magenta → Red unlock:** Theta ≥ 0.7 on symbol-holding (n=1 stable) AND inhibitory-seed ≥ 0.5
- **Confirmation:** Must demonstrate across ≥ 3 sessions (not a single spike)
- **Cross-line requirement:** At least 1 other line at Magenta (per stage-advancement rules)

---

## 3. Drive-Health Integration

### 3.1 Drive-health weight for Cognitive/Magenta

**Weight: 0.35** (moderate-high — cognitive is a primary line but at Magenta the drives are still diffuse)

### 3.2 Healthy drive expression at Cognitive/Magenta

| Drive | Healthy expression |
|---|---|
| **Agency** | Uses symbols independently; casts spells without needing permission; explores symbolic space |
| **Communion** | Shares symbolic discoveries; engages with others' symbols; participates in shared ritual |
| **Eros** | Reaches toward new symbols with curiosity; wants to learn the next rune |
| **Agape** | Returns to familiar symbols with care; maintains mastered symbols; embodies symbolic capacity |

### 3.3 Pathological drive expression at Cognitive/Magenta

| Drive | Dark-domain pathology | Golden-domain pathology |
|---|---|---|
| **Agency** | Uses symbols to dominate (hoards runes, refuses to share) | Cannot use symbols without external validation |
| **Communion** | Loses own symbolic capacity in others' systems (fusion) | Cannot engage others' symbols (isolation) |
| **Eros** | Refuses new symbols; clings to first-learned runes | Rushes past symbol-mastery toward abstract reasoning |
| **Agape** | Cannot return to basic symbols; "too advanced" | Cannot embody symbols in action; stays in fantasy |

---

## 4. Shadow Summary

| Quadrant | Archetype | Core pattern |
|---|---|---|
| **Dark-Addiction** | The Magical Thinker | Clings to symbolic power as CONTROL — believes symbols literally change reality; cannot distinguish symbol from referent |
| **Dark-Allergy** | The Concrete-Bound | Refuses symbolic engagement entirely; stays in sensorimotor; "symbols are meaningless" |
| **Golden-Addiction** | The Premature Reasoner | Rushes toward logical operations without mastering symbolic foundations; performs reasoning without genuine symbolic capacity |
| **Golden-Allergy** | The Wonder-Refuser | Fears the expansion into symbolic life; refuses the magic; "I don't want to imagine" |

### 4.1 Compound shadows (cross-module)

| Compound | Modules involved | Pattern |
|---|---|---|
| **The Enchanted Fool** | Cognitive/Magenta dark-addiction + Willpower/Magenta dark-allergy | Believes symbols have power but cannot sustain effort to master them |
| **The Frozen Literalist** | Cognitive/Magenta dark-allergy + Spiritual/Magenta dark-allergy | Refuses both symbolic thought AND animistic engagement; trapped in pure sensation |
| **The Precocious Mimic** | Cognitive/Magenta golden-addiction + Emotional/Magenta dark-allergy | Performs advanced reasoning while emotionally stuck in pre-symbolic |
| **The Fantasy-Drowner** | Cognitive/Magenta dark-addiction + Intrapersonal/Magenta dark-addiction | Fused with symbolic fantasy-self; cannot distinguish imagination from identity |

---

## 5. Modality Affinity

| Modality | Affinity | Rationale |
|---|---|---|
| Deterministic | ★★★★★ | Core measurement — symbol-holding is objective and measurable |
| Language-reflective | ★★★☆☆ | Limited at Magenta — language is still emerging; symbols precede words |
| Scenario-choice | ★★★☆☆ | Simple symbolic choices; not yet complex dilemmas |
| Embodied-somatic | ★★★★☆ | Symbols are GESTURAL at Magenta — the body makes the spell |
| Strategic-planning | ★★☆☆☆ | Minimal — planning requires holding multiple steps (n>1) |
| Social-cooperative | ★★★☆☆ | Shared ritual; symbolic coordination with fantasy-allies |
| Immersive-rpg | ★★★★★ | The magical world IS the cognitive environment — symbols everywhere |

---

## 6. Cross-Validation Rules

- **Deterministic × Language-reflective:** If language-reflective shows sophisticated symbol-talk but deterministic shows n=1 failure → golden-addiction (performing without capacity)
- **Embodied-somatic × Deterministic:** If body produces correct gestures but deterministic shows no symbol-holding → procedural memory without symbolic understanding
- **Immersive-rpg × Deterministic:** If ecological engagement is high but structured n=1 fails → engagement without capacity (possible dark-addiction — magical thinking without actual symbolic skill)
- **Strategic-planning × Symbol-holding:** If planning attempts exceed n=1 capacity → golden-addiction signal (attempting Red-level planning without Magenta mastery)
