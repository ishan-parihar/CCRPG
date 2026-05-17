# foundations/10 — Shadow, Pathology, and the 128-Shadow Model

## 1. Purpose

Specify how *unhealthy* development manifests across the full 64-module matrix (8 lines × 8 stages), how each module can produce exactly **2 shadow pathologies** (addiction and allergy), how the **4 drives** determine the health or pathology of each capacity, and how the game implements **holonic return** — the requirement that a player must always come back to heal earlier-stage shadows before advancing.

Without this model, the game is a relentless ascent — which is itself a pathology (Eros without Agape; ascent without integration). Shadow material is what makes the game *honest about being human*.

---

## 2. The Dual-Shadow Model: Addiction and Allergy

### 2.1 Scientific basis

Every developmental capacity (a specific stage of a specific line) can fail in exactly two complementary ways:

| Shadow type | Definition | Mechanism | Clinical analogue |
|---|---|---|---|
| **Addiction** | Over-identification with the capacity; cannot let go of it; uses it compulsively even when inappropriate | The capacity becomes the *only* tool; the person is *fused* with it | Fixation, compulsion, rigidity |
| **Allergy** | Rejection/avoidance of the capacity; cannot access it; dissociates from it | The capacity is *repressed*; the person is *allergic* to it | Avoidance, denial, phobia |

This is drawn from Wilber's "transcend and include" principle: healthy development *transcends* a capacity (no longer identified with it) while *including* it (can still access it). Pathology is either:
- **Failure to transcend** → addiction (stuck at, fused with)
- **Failure to include** → allergy (dissociated from, cannot access)

### 2.2 The 128-shadow matrix

```
128 shadows = 8 lines × 8 stages × 2 pathologies (addiction/allergy)
```

Every module in the 64-module assessment system has a corresponding **addiction shadow** and **allergy shadow**. These are not abstract — they are specific, diagnosable patterns with specific gameplay manifestations.

### 2.3 Examples across the matrix

| Line | Stage | Addiction shadow | Allergy shadow |
|---|---|---|---|
| Cognitive | Red | Compulsive planning; cannot act without a plan; over-thinks simple situations | Cannot plan at all; acts purely on impulse; avoids any sequential thinking |
| Emotional | Amber | Emotional conformity addiction; suppresses own feelings to match group; cannot tolerate emotional deviance | Emotional isolation; cannot read or respond to group emotional norms; socially disconnected |
| Moral | Orange | Rigid principled morality; applies rules without context; cannot bend even when compassion demands it | Moral relativism; cannot commit to any principle; "anything goes" as avoidance of moral responsibility |
| Intrapersonal | Green | Hyper-self-awareness; paralysed by self-observation; cannot act spontaneously | Self-blindness; cannot observe own patterns; acts out unconsciously |
| Spiritual | Amber | Dogmatic faith; clings to belief system; cannot tolerate doubt | Spiritual nihilism; rejects all meaning-making; cannot access faith or purpose |
| Somatic | Red | Power-body addiction; uses force for everything; cannot be gentle | Body-avoidance; lives "in the head"; cannot access physical power or presence |
| Willpower | Amber | Rigid discipline; cannot relax or yield; over-controls everything | Collapse of will; cannot sustain effort; gives up at first resistance |
| Interpersonal | Orange | Theory-of-mind addiction; manipulates others via prediction; instrumentalises relationships | Social blindness; cannot model others' minds; surprised by others' reactions |

---

## 3. The Four Drives as Health Determinants

### 3.1 How drives determine shadow health

Per `foundations/05`, the four drives are:
- **Agency** — self-preservation, sovereignty, autonomy
- **Communion** — joining, connection, belonging
- **Eros** — ascending, growth, transcendence
- **Agape** — descending, embracing, immanence

The **health** of any capacity (line × stage) is determined by how the four drives operate *within that capacity*:

| Drive state | Healthy expression | Pathological expression |
|---|---|---|
| Agency healthy | Appropriate boundaries; can say no; sovereign use of the capacity | — |
| Agency pathological | Domination via the capacity; uses it to control/exclude others | → Addiction shadow |
| Communion healthy | Can share the capacity; uses it in service of connection | — |
| Communion pathological | Loses self in others' use of the capacity; codependent | → Allergy shadow (of Agency) |
| Eros healthy | Uses the capacity to grow; reaches for the next level | — |
| Eros pathological | Bypasses the capacity; rushes past it without integration | → Allergy shadow |
| Agape healthy | Returns to the capacity with compassion; integrates it fully | — |
| Agape pathological | Regresses into the capacity; uses it to avoid growth | → Addiction shadow |

### 3.2 The drive-health formula

For any module (line L, stage S), the shadow state is determined by:

```
shadow_state(L, S) = f(
  agency_health(L, S),      // 0-1: can they use this capacity autonomously?
  communion_health(L, S),   // 0-1: can they share/connect through this capacity?
  eros_health(L, S),        // 0-1: can they grow beyond this capacity?
  agape_health(L, S),       // 0-1: can they return to this capacity with compassion?
)

addiction_risk(L, S) = (1 - eros_health) × agency_pathology
  // Cannot transcend + over-identifies = addiction

allergy_risk(L, S) = (1 - agape_health) × (1 - communion_health)
  // Cannot return + cannot connect through it = allergy
```

### 3.3 Drive-health assessment per module

Each of the 64 assessment modules must measure not just *capacity* (can they do it?) but also *drive-health* (how do they relate to doing it?):

| Dimension | What it reveals | How to measure |
|---|---|---|
| **Agency** | Can they use this capacity independently, without external validation? | Do they perform differently when observed vs. alone? Do they need prompting? |
| **Communion** | Can they use this capacity in service of others, not just self? | Do they help others in cooperative tasks? Do they share strategies? |
| **Eros** | Can they let go of this capacity when a higher one is needed? | Do they over-rely on familiar strategies? Can they switch to a new approach? |
| **Agape** | Can they return to this capacity without shame or regression? | When asked to use an "easier" version, do they resist (allergy) or embrace it? |

---

## 4. Holonic Return: The Architecture of Integration

### 4.1 The principle

A holon is a whole that is also a part of a larger whole. Each stage is a holon: it is complete in itself AND it is included in every subsequent stage. **Healthy development requires that every earlier stage remains accessible, integrated, and healthy.**

This means:
- A player at Orange who has an unresolved Red-stage shadow **cannot fully function at Orange**
- The game must **always bring the player back** to earlier stages where shadows exist
- Advancement is not escape from earlier stages — it is *deeper integration* of them

### 4.2 The holonic return mechanic

```
After every N encounters at the current stage:
  1. Check all earlier stages for unresolved shadows
  2. If any exist: surface a "return encounter" at that stage
  3. The return encounter uses the SAME assessment module for that (line, stage)
     but in "shadow mode" — testing drive-health, not just capacity
  4. Resolution = demonstrating healthy drive function at that stage
  5. Unresolved shadows accumulate and eventually BLOCK advancement
```

### 4.3 Shadow mode vs. capacity mode

Every assessment module has TWO modes:

| Mode | Purpose | What it measures | When used |
|---|---|---|---|
| **Capacity mode** | Assess whether the player CAN operate at this stage | Accuracy, speed, depth, complexity | Onboarding, advancement testing |
| **Shadow mode** | Assess whether the player has HEALTHY RELATIONSHIP to this stage | Drive-health (agency, communion, eros, agape) | Shadow encounters, holonic return |

In shadow mode, the same tasks are presented but the scoring rubric changes:
- **Addiction test:** Can the player *stop* using this capacity when asked? Can they switch to a different approach? Do they over-rely on it?
- **Allergy test:** Can the player *access* this capacity without resistance? Do they avoid it? Do they show discomfort when asked to use it?

### 4.4 The shadow encounter structure

A shadow encounter:
1. **Names the shadow** explicitly ("You are avoiding your body's power" or "You cannot stop planning")
2. **Presents the capacity** in a context where the healthy response is NOT the obvious one
3. **For addiction:** rewards *letting go* — the player must succeed by NOT using the addicted capacity
4. **For allergy:** rewards *accessing* — the player must succeed by USING the avoided capacity
5. **Scores drive-health** — did they demonstrate agency, communion, eros, agape appropriately?
6. **Records resolution** — the shadow is marked resolved when drive-health exceeds threshold

---

## 5. Detection and Diagnostics

### 5.1 Three detection layers

| Layer | What it detects | Data source | Timeframe |
|---|---|---|---|
| **Behavioural** | Fixation, regression, repression (the original 3) | Altitude history, encounter frequency | Sessions (macro) |
| **Drive-pattern** | Addiction/allergy risk per module | Drive-health scores from assessments | Per-encounter (micro) |
| **Cross-line** | Compensatory patterns (one line substituting for another) | Line-usage patterns, strategy choices | Sessions (macro) |

### 5.2 Behavioural detection (existing, refined)

```ts
interface BehaviouralSignal {
  type: 'fixation' | 'regression' | 'repression';
  line: Line;
  stage: Stage;
  sessionsOfEvidence: number;
  confidence: number;
}
```

- **Fixation:** altitude unchanged for ≥ 5 sessions despite encounters
- **Regression:** altitude dropped ≥ 1 stage and held for ≥ 3 sessions
- **Repression:** line encounter-share < 50% of expected for ≥ 5 sessions

### 5.3 Drive-pattern detection (new)

```ts
interface DriveHealthScore {
  line: Line;
  stage: Stage;
  agency: number;      // 0-1
  communion: number;   // 0-1
  eros: number;        // 0-1
  agape: number;       // 0-1
}

interface ShadowDiagnosis {
  line: Line;
  stage: Stage;
  type: 'addiction' | 'allergy';
  severity: number;    // 0-1
  primaryDrive: Drive; // which drive is most pathological
  evidence: string[];  // what behaviours triggered this
}

function diagnoseShadow(driveHealth: DriveHealthScore): ShadowDiagnosis | null {
  const addictionRisk = (1 - driveHealth.eros) * (1 - driveHealth.communion);
  const allergyRisk = (1 - driveHealth.agape) * (1 - driveHealth.agency);

  if (addictionRisk > ADDICTION_THRESHOLD) {
    return {
      line: driveHealth.line,
      stage: driveHealth.stage,
      type: 'addiction',
      severity: addictionRisk,
      primaryDrive: driveHealth.eros < driveHealth.communion ? 'Eros' : 'Communion',
      evidence: [],
    };
  }
  if (allergyRisk > ALLERGY_THRESHOLD) {
    return {
      line: driveHealth.line,
      stage: driveHealth.stage,
      type: 'allergy',
      severity: allergyRisk,
      primaryDrive: driveHealth.agape < driveHealth.agency ? 'Agape' : 'Agency',
      evidence: [],
    };
  }
  return null;
}
```

### 5.4 How assessment modules measure drive-health

Each of the 64 assessment modules includes **drive-health probes** alongside capacity probes:

| Drive | Probe type | Example (Cognitive/Red) |
|---|---|---|
| **Agency** | "Can you do this without help?" | Present n=2 task with optional hint button. Agency = not using hints. |
| **Communion** | "Can you help another do this?" | Present a cooperative variant where player must explain their strategy. |
| **Eros** | "Can you let go of this and try something harder?" | After success at n=2, offer n=3 with risk of failure. Eros = willingness to try. |
| **Agape** | "Can you return to this without shame?" | After working at n=3, ask to do n=1 again. Agape = doing it fully, not dismissively. |

---

## 6. The Full Shadow Taxonomy (128 entries)

### 6.1 Structure

Each of the 128 shadows has:
```ts
interface ShadowDefinition {
  readonly line: Line;
  readonly stage: Stage;
  readonly type: 'addiction' | 'allergy';
  readonly name: string;                    // e.g., "The Compulsive Planner"
  readonly description: string;             // what it looks like in behaviour
  readonly healthyExpression: string;       // what the integrated version looks like
  readonly triggerDrives: Drive[];          // which drives are pathological
  readonly healingDrives: Drive[];          // which drives must be strengthened
  readonly assessmentCriteria: string[];    // how to detect it
  readonly resolutionCriteria: string[];    // how to know it's healed
}
```

### 6.2 Naming convention

Each shadow is named as an archetype:
- **Addiction shadows** are named as "The [Over-doer]" — e.g., "The Compulsive Planner" (Cognitive/Red/Addiction)
- **Allergy shadows** are named as "The [Avoider]" — e.g., "The Impulsive Actor" (Cognitive/Red/Allergy)

### 6.3 Per-line shadow families

| Line | Addiction family | Allergy family |
|---|---|---|
| Cognitive | The Over-Thinkers | The Under-Thinkers |
| Emotional | The Over-Feelers | The Under-Feelers |
| Moral | The Over-Judgers | The Under-Judgers |
| Intrapersonal | The Over-Observers | The Under-Observers |
| Spiritual | The Over-Believers | The Under-Believers |
| Somatic | The Over-Doers | The Under-Doers |
| Willpower | The Over-Controllers | The Under-Controllers |
| Interpersonal | The Over-Connectors | The Under-Connectors |

Each family has 8 members (one per stage), for 16 shadows per line, 128 total.

---

## 7. Holonic Return in Practice

### 7.1 The return schedule

```
Every 3 encounters at the player's current stage:
  1. Compute shadow_priority = max(severity) across all unresolved shadows
  2. If shadow_priority > 0.3:
     → Surface a return encounter at the shadow's (line, stage)
  3. The return encounter runs the assessment module in SHADOW MODE
  4. If resolved: mark shadow as healed, award integration bonus
  5. If not resolved: increase severity slightly (the shadow grows if ignored)
```

### 7.2 Advancement blocking

Per `lines/00 §3.3`, stage advancement requires "no active shadow signals at altitude ≤ target." This is now refined:

```
To advance from stage S to stage S+1:
  - All shadows at stages ≤ S must have severity < 0.3
  - OR: the player must have ATTEMPTED resolution (even if not fully resolved)
  - The game never permanently blocks — but unresolved shadows make advancement
    encounters significantly harder (the shadow manifests as a debuff)
```

### 7.3 The integration bonus

Resolving a shadow awards:
- **Altitude stability** — the line's altitude becomes more resistant to regression
- **Drive-health improvement** — the healed drive gets a permanent boost
- **Narrative unlock** — a codex entry explaining the shadow and its resolution
- **Combat advantage** — encounters at that stage become easier (the capacity is now fluid, not rigid)

---

## 8. Relationship to Combat and Gameplay

### 8.1 Shadow encounters ARE gameplay

Shadow encounters are not separate from the game — they ARE the game at a deeper level:
- They use the same assessment modules (same tasks, same mechanics)
- They just score differently (drive-health instead of capacity)
- They are framed narratively as "returning to heal" rather than "being tested"

### 8.2 The combat loop includes shadow

```
Normal encounter → capacity assessment → altitude update
  ↓ (every 3 encounters)
Shadow check → if shadow detected → return encounter → drive-health assessment
  ↓
Shadow resolution → integration bonus → back to normal encounters
```

### 8.3 Enemies as shadow projections

Major enemies are *projections* of the player's own shadows:
- An enemy's combat style mirrors the player's addiction (what they over-use)
- The enemy's weakness is the player's allergy (what they avoid)
- Defeating the enemy requires accessing the avoided capacity

This means: **every player faces a different version of each boss**, tailored to their specific shadow profile.

---

## 9. Architectural Contract

```ts
type ShadowPathology = 'addiction' | 'allergy';

interface ShadowSignal {
  readonly type: ShadowPathology;
  readonly line: Line;
  readonly stage: Stage;
  readonly severity: number;           // 0-1
  readonly primaryDrive: Drive;        // which drive is most pathological
  readonly detectedAtMs: number;
  readonly resolved: boolean;
  readonly resolutionAttempts: number;
}

interface DriveHealth {
  readonly line: Line;
  readonly stage: Stage;
  readonly agency: number;
  readonly communion: number;
  readonly eros: number;
  readonly agape: number;
}

interface PlayerProfile {
  // ... existing fields ...
  readonly shadows: readonly ShadowSignal[];
  readonly driveHealth: readonly DriveHealth[];  // one per assessed module
}
```

Pure functions:
- `diagnoseShadows(profile): ShadowSignal[]` — from drive-health scores
- `computeDriveHealth(assessmentResult): DriveHealth` — from assessment data
- `shouldSurfaceReturn(profile): { line: Line; stage: Stage } | null`
- `isShadowResolved(signal, newDriveHealth): boolean`

Tested invariants:
1. A new player has zero shadows (no false positives)
2. Addiction and allergy are mutually exclusive for the same (line, stage) — you cannot be both addicted to and allergic to the same capacity
3. Resolution requires drive-health above threshold on the *healing* drives
4. Severity increases by 0.05 per session if unaddressed (caps at 1.0)
5. A resolved shadow does not re-trigger from the same evidence

---

## 10. Open Questions

- **Severity decay:** Should shadows naturally decay if the player demonstrates health elsewhere? Tentative: yes, at 0.01 per session, so mild shadows self-resolve.
- **Shadow interaction:** Can two shadows reinforce each other? (e.g., Cognitive/Red addiction + Emotional/Red allergy = "thinks instead of feeling"). Tentative: yes, and this creates "compound shadows" that require multi-line resolution.
- **Multiplayer shadows:** Two players' shadows can be each other's medicine. A co-op shadow encounter is powerful design space. Underspecified for now.
- **Age-appropriateness:** Shadow content must be age-appropriate. A child's "shadow" is not the same as an adult's. The system must calibrate language and framing.

---

## 11. Principles Served

Principles **1, 4, 5, 6** — completes the developmental picture (integration, not just ascent), keeps stage advancement honest, makes the game a genuine developmental tool (not just a proxy), and prevents the game from masquerading as therapy while still being legitimately efficacious.
