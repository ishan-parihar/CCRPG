# 16 — Significator Architecture

> **Lateral:** The player as Significator — the persistent self-pattern that survives session transitions, accumulates distortions, holds the entire developmental story, and exercises true free will. The game-design translation of the Hierophant archetype into CCRPG's data architecture and encounter-scheduling logic.
>
> **Status:** Canonical design document.
> **Depends on:** 15 (macro-cycle theory), 13 (lesser-cycle topography), 10 (shadow model), 05 (drives and polarities)
> **Forward-references:** 17 (Transformation mechanics), 18 (Great Way world-system), 19 (Choice & polarity engine), 20 (Veil of Forgetting), 21 (Incarnation Architecture)

---

## 1. Purpose and lateral

Foundations/15 establishes the *pure theory* of the Significator — the Hierophant as the complex vessel of the self, carrying accumulated distortions across incarnations. This document translates that theory into **concrete game architecture**: what data structures constitute the Significator, how the game observes and records its evolution, and what design commitments protect the player's free will.

No other document covers this lateral:

- Foundations/13 covers the *lesser-cycle* topography (Matrix/Potentiator/Catalyst/Experience) — the moment-to-moment processing engine.
- Foundations/15 covers the *pure theory* of the macro-cycle archetypes.
- Foundations/10 covers *what* shadows are and how they map to game mechanics.
- Foundations/05 covers the four drives as motivational primitives.

This document specifies the **vessel that holds all of the above** — the PlayerProfile as Significator, its persistence model, its relationship to the eight registries, and the design commitments that make it a genuine locus of free will rather than a deterministic state machine.

---

## 2. The PlayerProfile as Significator

### 2.1 The vessel, not the save file

The `PlayerProfile` is not a serialisation convenience. It is the Significator — the self-pattern that persists across sessions, accumulates the traces of every encounter, and reorganises as the player evolves. Every field in the profile corresponds to a dimension of the Hierophant's complexity:

| Profile field | Significator dimension |
|---|---|
| `altitudes: Record<Line, Stage>` | Per-line developmental altitude — where the Significator *is* on each axis of intelligence |
| `stage: Stage` (synthesised) | The Significator's centre-of-gravity — its dominant worldview |
| `drives.weights` | The current motivational orientation (Agency/Communion/Eros/Agape) |
| `drives.fixationRisk` | Accumulated drive-imbalance — the Significator's vulnerability to shadow |
| `shadows: ShadowSignal[]` | The distortion ledger (§3) — unresolved shadow surfacings |
| `rayProfile: Record<Ray, number>` | The Significator's energetic signature across the seven rays |
| `taskStaircases` | Per-task adaptive difficulty — the Significator's demonstrated capacity |
| `vows: Vow[]` | Player-authored commitments — the Significator's self-declared intentions |
| `primaryValue: string` | The Significator's self-authored identity anchor |
| `states` | Gross/Subtle/Causal/Witness/NonDual access — the Significator's state-stage development |

### 2.2 The polarity vector (forward-reference)

The PlayerProfile will carry a `polarityVector` field specifying the Significator's cumulative orientation toward Service-to-Others or Service-to-Self. This is the crystallisation of micro-choices into macro-polarity. Full specification deferred to foundations/19 (Choice & polarity engine).

### 2.3 The transformation history (forward-reference)

The PlayerProfile will carry a `transformations: TransformationEvent[]` field recording every stage-transition the Significator has undergone — the frame-changes where the self-structure reorganised. Full specification deferred to foundations/17 (Transformation mechanics).

### 2.4 What the profile is NOT

The PlayerProfile does not contain:
- Raw telemetry or behavioural logs (those live in infra/persistence as ephemeral session data)
- Personally identifiable information (the profile is pseudonymous by design)
- Judgements, scores, or grades (the Significator is observed, never evaluated)
- Prescriptive content (the profile describes *what is*, never *what should be*)

---

## 3. The Distortion Ledger

### 3.1 What gets recorded

Every encounter leaves a trace on the Significator. The `shadows: ShadowSignal[]` array (and its supporting indices) constitutes the **Distortion Ledger** — the accumulated record of the Significator's unresolved material and integration breakthroughs.

Each `ShadowSignal` records:

| Field | Meaning |
|---|---|
| `line: Line` | Which line of intelligence the distortion manifests in |
| `stage: Stage` | Which developmental altitude the distortion belongs to |
| `quadrant: ShadowQuadrant` | Dark-Addiction / Dark-Allergy / Golden-Addiction / Golden-Allergy |
| `driveSignature: Partial<Record<Drive, number>>` | The drive-imbalance pattern that surfaced the shadow |
| `surfacedAtMs: number` | When the shadow was first detected |
| `resolutionStatus: 'unresolved' | 'partial' | 'integrated'` | Current integration state |
| `integrationEvents: IntegrationEvent[]` | Timestamped records of partial or full integration |
| `encounterIds: string[]` | Which encounters surfaced or addressed this shadow |

### 3.2 How it persists

The Distortion Ledger is:
- **Encrypted on-device** using platform-native secure storage (Keychain / EncryptedSharedPreferences / IndexedDB with Web Crypto API)
- **Never transmitted** to any server in identifiable form
- **Pseudonymous** — the profile ID is a locally-generated UUID with no link to real identity
- **Player-deletable** — the player can wipe their profile at any time (the Significator has sovereignty over its own record)

### 3.3 How it influences encounter selection

The encounter scheduler queries the Significator's Distortion Ledger to determine what catalyst to deliver next. The algorithm:

1. **Surface unresolved shadows** — encounters that address `resolutionStatus === 'unresolved'` signals are weighted higher
2. **Respect the growth edge** — the scheduler biases toward the player's current altitude ± 1 stage, never skipping stages
3. **Balance across lines** — if one line has accumulated significantly more unresolved shadows, the scheduler surfaces encounters for that line
4. **Honour drive-imbalance** — if `fixationRisk` for a drive exceeds threshold, encounters that exercise the complementary drive are prioritised
5. **Never coerce** — the scheduler *offers* encounters; the player chooses which to enter (see §4)

The Distortion Ledger is read-only to the encounter scheduler. It cannot modify the ledger — only encounter *outcomes* (processed through the lesser-cycle engine) write to the ledger.

---

## 4. The Significator's free will (the central design commitment)

### 4.1 The Hierophant's question

The Significator's defining capacity is articulated in foundations/15: *"What shall the mind do with its knowledge, and for what reasons does it seek?"* This is not rhetorical. It is the game's central design commitment: **the player has true free will, and the game never coerces.**

### 4.2 The mechanic of genuine choice

Every encounter in CCRPG offers **genuine multi-path response**. This is not cosmetic branching (where all paths converge). The paths differ in:

- **Drive expression** — each path exercises a different drive or drive-combination
- **Shadow engagement** — some paths confront the shadow directly; others avoid it
- **Polarity vector** — each path nudges the cumulative polarity in a direction (see foundations/19)
- **Integration depth** — some paths achieve full integration; others achieve partial; others defer

### 4.3 Observation without judgement

The game observes which path the Significator chooses. The choice is recorded in the Distortion Ledger and the polarity vector. But:

- **No path is "correct"** — the game never labels a choice as right or wrong
- **No path is punished** — there are no fail-states for choosing "poorly"
- **No path is hidden** — the player always knows their options (though not their developmental implications)
- **Consequences are natural** — choosing avoidance means the shadow remains unresolved and will surface again; choosing confrontation means integration occurs. These are natural consequences, not rewards/punishments.

### 4.4 Distinguishing the Significator from an automaton

An NPC in CCRPG follows deterministic drive-fixation logic (see foundations/05 §3.3). The player-as-Significator is distinguished by:

1. **Unpredictability** — the game cannot predict the player's choice; it can only observe it after the fact
2. **Self-authorship** — the player's `primaryValue` and `vows` are self-declared, not system-assigned
3. **Sovereignty over the record** — the player can delete their profile, reset their vows, or contradict their own history
4. **Meta-awareness** — the player knows they are playing a game; the Significator holds the tension between immersion and self-awareness

---

## 5. Spiral-stage architecture: how the Significator reorganises across altitudes

### 5.1 Not addition but reorganisation

As the Significator evolves through the 8 stages, it does not merely *add* new capacities to a fixed container. The container itself reorganises. The `PlayerProfile` must hold not just *what* the player can do but *who they are* at each stage — the structural logic of their self-system.

### 5.2 Stage-specific Significator configurations

| Stage | Self-structure | Drive centre | Shadow vulnerability | Contact boundary |
|---|---|---|---|---|
| Infrared | Pre-egoic; fused with environment | Survival agency | Annihilation terror | Confluent (no boundary) |
| Magenta | Magical-animistic; fused with tribe | Communion (tribal) | Engulfment / abandonment | Permeable, undifferentiated |
| Red | Egocentric; impulsive sovereign | Agency (power) | Domination without embrace | Rigid, armoured |
| Amber | Conformist; rule-and-role identity | Communion (institutional) | Rigid agency-suppression | Selectively permeable (in-group only) |
| Orange | Rational-achiever; autonomous self | Agency (achievement) | Instrumentalising others | Controlled, strategic |
| Green | Pluralistic; sensitive-relational | Communion (egalitarian) | Mean-green suppression of hierarchy | Hyper-permeable |
| Turquoise | Integral; vision-logic | All four in dynamic dance | Subtle integral elitism | Calibrated, context-sensitive |
| White | Non-dual; transparent self | Unity beyond drives | (Rare; no common pathology) | Fully permeable, fully coherent |

### 5.3 Implementation: the `stage` field as synthesised centre-of-gravity

The `stage` field in `PlayerProfile` is computed by `StageSynthesizer` from the `altitudes` record. It represents the Significator's *centre-of-gravity* — the dominant worldview organising the self-system. The synthesiser accounts for:

- The lowest altitude across all lines (holonic health — see §6)
- The highest altitude across all lines (growth edge)
- The distribution pattern (even vs. spiky)
- Drive-balance at the current centre-of-gravity

The Significator's stage determines which encounters are available, which narrative arcs are active, and how the world presents itself (see foundations/18 for the Great Way).

### 5.4 The holon is never outgrown

Per AGENTS.md §5.6: lower stages must remain healthy. The Significator at Orange still *contains* healthy Red, Amber, Magenta, and Infrared. If any lower-stage altitude degrades (theta-decay), the Significator's effective stage is pulled downward. The profile tracks all 8 altitudes simultaneously — the Significator is a *nested holon*, not a ladder.

---

## 6. The covenant with spirit: the game's protective promise

### 6.1 The wings of the Hierophant

Foundations/15 describes the "outstretched wings above the Hierophant" — a protective promise that draws the veiled mind toward transformation. In CCRPG, this covenant is implemented through three mechanisms:

### 6.2 Theta-decay nudges

When a line's altitude has not been exercised for a configurable duration, theta-decay begins degrading that altitude. This is not punishment — it is the covenant surfacing neglected dimensions of the Significator. The encounter scheduler responds to theta-decay by:

- Increasing the weight of encounters for the decaying line
- Surfacing narrative nudges (codex entries, NPC dialogue) that reference the neglected capacity
- Offering low-friction "maintenance encounters" that arrest decay without demanding full engagement

### 6.3 Anti-frustration backstops

The covenant guarantees the game never abandons the player in a state of unresolvable frustration:

- **Staircase regression** — if the player fails repeatedly at a task, the adaptive staircase lowers difficulty until success is achievable
- **Shadow deferral** — if a shadow has surfaced 3+ times without resolution, the scheduler temporarily reduces its priority and offers alternative growth-edge encounters
- **Session-length sovereignty** — the infinite-checkpoint model means the player can leave at any moment without losing progress; the covenant respects the player's time and energy
- **No dead ends** — every encounter has at least one path that does not require the player to confront material they are not ready for

### 6.4 Growth-edge bias

The encounter scheduler carries a structural bias toward catalyst at the Significator's growth edge — the altitude just above the current centre-of-gravity. This bias is:

- **Gentle** — growth-edge encounters are weighted ~1.3× relative to maintenance encounters, not forced
- **Responsive** — if the player consistently avoids growth-edge encounters, the bias does not escalate; it waits
- **Contextual** — the bias applies per-line, not globally; the scheduler respects that different lines may have different growth edges

---

## 7. AQAL anchoring (UL→UR observation)

### 7.1 The Significator's quadrant position

The Significator occupies the **Upper-Left (UL)** quadrant — the domain of subjective consciousness, intention, and inner state. However, the game has no direct access to UL. It can only observe the Significator through **Upper-Right (UR)** proxies — objective, measurable behaviour.

### 7.2 UR proxies as windows into UL

| UR observable | UL inference (probabilistic, never certain) |
|---|---|
| Task performance (reaction time, accuracy, n-back level) | Cognitive capacity at a given line×stage |
| Choice patterns across encounters | Drive orientation and polarity vector |
| Shadow-encounter response paths | Shadow-integration readiness |
| Session frequency and duration | Engagement and developmental momentum |
| Staircase trajectory (ascending/plateauing/descending) | Growth-edge proximity |

### 7.3 The epistemic non-claim

CCRPG **never claims direct access to the player's inner state**. All inferences from UR behaviour to UL state are:

- Probabilistic, not deterministic
- Revisable — new behaviour can override prior inferences
- Non-diagnostic — the game does not label the player with clinical categories
- Invisible to the player — the inference layer operates in the background; the player sees only their psychograph (the radial chart), never the raw inference data

This is the ethical boundary of the Significator architecture: the game observes behaviour, infers developmental state, and adapts catalyst accordingly — but it never presumes to *know* the player's subjective experience.

---

## 8. Integration with the registry architecture

### 8.1 How the eight registries serve the Significator

The Significator does not exist in isolation. It is the *consumer* of all eight registries:

| Registry | Service to the Significator |
|---|---|
| **LineRegistry** | Defines the 8 axes along which the Significator develops; provides task bindings and ceiling definitions |
| **StageRegistry** | Defines the 8 altitudes the Significator can occupy; provides advancement criteria and world bibles |
| **RayRegistry** | Defines the energetic signature the Significator accumulates; provides harvest-readiness computation |
| **TaskRegistry** | Provides the cognitive tasks that *measure* the Significator's capacity (the UR observation layer) |
| **AbilityRegistry** | Provides the combat verbs the Significator can exercise — the gameplay surface of developmental capacity |
| **EncounterRegistry** | Provides the catalysts the encounter scheduler selects based on the Significator's state |
| **DriveRegistry** | Defines the motivational primitives the Significator balances; provides pathology definitions |
| **NarrativeRegistry** | Provides the story beats that contextualise the Significator's journey; adapts to its stage and choices |

### 8.2 The Significator as registry consumer, not registry member

The PlayerProfile is **not** registered in any registry. It is the entity that *queries* registries. This is architecturally deliberate:

- Registries hold *type-level* definitions (what a line IS, what a stage IS)
- The PlayerProfile holds *instance-level* state (where THIS player is on each line, at which stage)
- The encounter scheduler mediates between the two: it reads the Significator's state, queries the EncounterRegistry for appropriate catalysts, and presents options

### 8.3 The invariant

Per MVP-BLUEPRINT §7: *"Stage advancement is a pure function of PlayerProfile."* The Significator's state is the sole input to the `StageSynthesizer`. No external state, no server-side override, no social comparison. The Significator is sovereign over its own evolution.

---

## 9. What this document does NOT cover (cross-references)

| Topic | Document |
|---|---|
| The macro/micro distinction and the four macro archetypes as pure theory | foundations/15 |
| The 4-quadrant shadow model (Dark-Addiction, Dark-Allergy, Golden-Addiction, Golden-Allergy) and how shadows are surfaced in encounters | foundations/10 |
| The contact boundary, lesser-cycle topography (Matrix/Potentiator/Catalyst/Experience), and the catalyst→experience→integration flow | foundations/13 |
| The four drives (Agency, Communion, Eros, Agape) as motivational primitives | foundations/05 |
| Transformation events — the mechanics of stage-transition and frame-change | foundations/17 (forthcoming) |
| The Great Way — the world-system that provides macro-catalyst to the Significator | foundations/18 (forthcoming) |
| Choice and polarity — how micro-choices crystallise into macro-polarity | foundations/19 (forthcoming) |
| The Veil of Forgetting — why the game never reveals its developmental logic to the player | foundations/20 (forthcoming) |
| The Incarnation Architecture — how all macro-cycle documents synthesise into the master game-structure | foundations/21 (forthcoming) |
