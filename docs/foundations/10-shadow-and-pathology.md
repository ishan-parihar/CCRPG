# foundations/10 — Shadow and Pathology

## 1. Purpose

Specify how *unhealthy* development manifests, and how CCRPG turns it
into gameplay. Without a model of pathology, the game is a relentless
ascent — which is itself a pathology (Eros without Agape; ascent
without integration). Shadow material is what makes the game *honest
about being human*.

## 2. Scientific basis

### 2.1 Three failure modes per line

For any line, development can fail in three ways:

| Failure mode | Description | Clinical analogue |
|---|---|---|
| **Fixation** | Stuck at an altitude; cannot ascend | Plateau / arrest |
| **Regression** | Was higher, fell back | Decompensation under stress |
| **Repression** | Underused; the line is *avoided* rather than developed | Defence mechanism (denial, reaction-formation) |

Each is detectable from telemetry:

- **Fixation:** altitude unchanged for ≥ N sessions.
- **Regression:** altitude drops by ≥ 1 stage and stays there for ≥ M
  sessions.
- **Repression:** the line shows up in encounters substantially less
  than its statistical expectation (the player avoids; the AI scheduler
  notices).

### 2.2 Shadow at each stage

Wilber distinguishes:

- **Pre-stage shadow** — early-stage material that was repressed
  *before* the player had the capacity to integrate it.
- **Same-stage shadow** — current-stage material the player cannot yet
  hold.
- **Higher-stage shadow** — premonitions of capacities not yet
  integrated, manifesting as anxiety or grandiosity.

CCRPG honours all three:

| Type | Manifestation in-game |
|---|---|
| Pre-stage | Memory-dungeon side-quests (revisit a previous stage's territory with current capacity) |
| Same-stage | Shadow encounter unlocked when fixation / regression / repression detected |
| Higher-stage | "Visionary" cutscene — the player glimpses the next stage; can fail or succeed at integration |

### 2.3 Per-stage common shadow themes

| Stage | Typical shadow material |
|---|---|
| Infrared | Survival terror; primal abandonment |
| Magenta | Magical omnipotence vs. helplessness; engulfment |
| Red | Power-fixation; powerlessness; rage |
| Amber | Conformist guilt; tribal hatred; rigidity |
| Orange | Workaholism; emotional cut-off; instrumentalising others |
| Green | Mean-green-meme (suppressing agency); paralysis-by-relativism |
| Turquoise | Integral elitism; subtle pride at "seeing through" everyone |
| White | (Rare; near-stage shadow is letting go of letting-go) |

### 2.4 Drives × shadow

A shadow encounter dramatises the *absent complement* of a fixated
drive (`foundations/05`). A player over-relying on Agency meets a
Communion shadow; over-Eros meets Agape; etc. The shadow is the
medicine.

## 3. Game-design mapping

### 3.1 Detection heuristics

```
function detectShadowSignal(profile: PlayerProfile, line: Line): ShadowSignal | null {
  // Fixation: altitude unchanged for N sessions
  if (sessionsAtAltitude(profile, line) >= FIXATION_THRESHOLD)
    return { type: 'fixation', line };

  // Regression: altitude dropped and held
  if (regressionLength(profile, line) >= REGRESSION_THRESHOLD)
    return { type: 'regression', line };

  // Repression: line under-exercised vs expected baseline
  if (encounterShareDeficit(profile, line) >= REPRESSION_THRESHOLD)
    return { type: 'repression', line };

  return null;
}
```

Tunable thresholds in `progression/05-shadow-work-and-regression.md`.

### 3.2 Shadow encounter structure

A shadow encounter is *optional* and *off the main path*. It:

1. Names the shadow explicitly in narration (the game *tells* the
   player what is being dramatised — no obscurity).
2. Stages a fight where the *expected* losing strategy is the
   over-relied drive / over-developed line.
3. Awards integration only when the *absent* drive / line is
   demonstrated.
4. Records the integration as an *altitude bump* on the absent line,
   not on the over-developed one.

Example: Orange-stage cognitive over-development with Emotional
repression → Shadow boss "The Cold Architect" (a mirror of the player
in cold-PFC mode). The Cold Architect is impervious to spells (n-back).
The fight's escape valve is empath-reads of the boss's *grief* —
demonstrations of the player's emotional line. Defeat = emotional
altitude +1.

### 3.3 Shadow as content, not punishment

CCRPG's shadow design philosophy:

> Shadow encounters are not penalties. They are *invitations*. They
> reward integration with permanent gains the main path cannot offer.

A player who never engages shadow content can still progress, but
their psychograph will reveal the imbalance, and certain late-stage
synthesis exams will be substantially harder. This is honest: a
high-altitude line with a low complement is exactly the profile that
struggles with integration in real-life development.

### 3.4 The "saw it coming" anti-pattern

A common shadow-game failure is to *force* the player into a shadow
encounter — which feels like punishment. CCRPG avoids this:

- Shadow encounters are *unlocked*, not *imposed*.
- The narrator gently surfaces them ("There is something here…").
- Skipping a shadow doesn't lose progress; it just defers it.
- The shadow remains available indefinitely.

### 3.5 Pathology as antagonist material

Major NPC antagonists are *fixations of a stage's pathology* — see
`narrative/02-antagonist-archetypes.md`:

- **Red × power-fixation** — the Conqueror
- **Amber × conformity-fixation** — the Inquisitor
- **Orange × rationalist-cut-off** — the Cold Architect
- **Green × relativism-paralysis** — the Equivocator
- **Turquoise × integral-elitism** — the Adept Above

Each is defeatable only by demonstrating the *absent* virtue of the
fixation.

## 4. Architectural contract

```
type ShadowType = 'fixation' | 'regression' | 'repression';

interface ShadowSignal {
  type:   ShadowType;
  line:   Line;
  stage:  Stage;
  detectedAtMs: number;
  encounterId?: string;     // assigned when player accepts the unlock
  resolved?: boolean;
}

interface PlayerProfile {
  shadows: ReadonlyArray<ShadowSignal>;
  // a player may have multiple open shadows; the UI surfaces one at a time
}
```

Pure functions (`core/usecases/ShadowDetection.ts`):

- `detectShadowSignals(profile, params): ShadowSignal[]`
- `eligibleShadowEncounters(profile): EncounterSpec[]`

Tested invariants:

1. A new player has zero shadows (no false positives).
2. Repression detection requires at least M sessions of evidence (no
   premature flagging).
3. A resolved shadow does not re-trigger from the same evidence (must
   be new evidence to re-fire).

## 5. Open questions

- **Auto-naming the shadow.** Should the game label "Cold Architect"
  for the player, or let them name it? Naming-by-player is more
  empowering; naming-by-game is more legible. Tentative default: game
  names, player can rename.
- **Mental-health implications.** A game that surfaces real
  developmental pathology must be careful: it is not therapy, and must
  not present itself as such. `validation/02` codifies this disclaimer.
- **Shadow in multiplayer.** Two players' shadows can be each other's
  medicine. A co-op shadow encounter is a powerful design space.
  Underspecified for now.

## 6. Principles served

Principles **1, 4, 6** — completes the developmental picture
(integration, not just ascent), keeps stage advancement honest, and
prevents the game from masquerading as therapy.
