# Moral × Infrared — Strategic-Planning

## 1. Game Identity

| Field | Value |
|---|---|
| Modality | Strategic-Planning |
| Unique lateral | Basic harm-avoidance sequencing — detect-then-avoid, 2-step safety sequences |
| Core mechanic | Sequencing harm-detection into avoidance action (sense → move) |
| Session length | 60–120 seconds per checkpoint |
| Infinite checkpoint | Yes — each sequence-block is a checkpoint |

## 2. Catalyst Design

### 2.1 Surface Experience

A simple grid-world. Harm-sources pulse in certain cells. The player must first DETECT (identify which cells are harmful) then NAVIGATE (move creature through safe cells to a goal). The "strategy" is minimal — 2-step: sense, then act. This is the proto-planning seed: harm-detection must precede movement, not occur simultaneously.

### 2.2 Stimulus Parameters

- **Grid size:** 3×3 (entry) to 5×5 (advanced)
- **Harm cells:** pulse with pain-cues (red glow, crackling); 20–50% of grid
- **Safe cells:** pulse with comfort-cues (blue glow, humming)
- **Detection phase:** harm-cells revealed for limited time, then partially hidden
- **Navigation phase:** player moves creature step-by-step through remembered-safe cells

### 2.3 Drive Probes

| Drive | Probe |
|---|---|
| Eros | Can the player hold harm-locations in memory across the detect→navigate gap? |
| Agape | Does the player complete the detection phase fully (not rush to navigate)? |
| Agency | Does the player execute the navigation decisively once detection is complete? |
| Communion | Does the player register ALL harm-cells (not just the nearest/most obvious)? |

## 3. Shadow Surfacing

| Shadow | Behavioural signature |
|---|---|
| Pain-Fixation (DA) | Over-marks cells as harmful; refuses to navigate because "everywhere is dangerous" |
| Pain-Numbness (DAll) | Skips detection phase; navigates blindly; steps on harm-cells without registering |
| Premature Taboo (GA) | Marks cells by position-pattern ("corners are bad") rather than actual harm-cues |
| Harm Fortress (GAll) | Detects perfectly but won't navigate; stays at start indefinitely |

## 4. Integration Mechanics

### 4.1 Heal Vector (bottom-up: Agape + Agency)

- **Pain-Fixation:** Reduce harm-cell density; guarantee safe paths exist; reward successful navigation
- **Pain-Numbness:** Extend detection phase; amplify harm-cues; make stepping on harm viscerally costly

### 4.2 Evolve Vector (top-down: Eros + Communion)

- **Premature Taboo:** Randomise harm-cell positions each trial; break pattern-reliance; force actual sensing
- **Harm Fortress:** Shrinking safe-zone (start cell becomes harmful after delay); reward movement over stasis

## 5. Progression & Difficulty

| Level | Parameters |
|---|---|
| Entry | 3×3 grid, 20% harm, detection phase unlimited, path always 2 steps |
| Mid | 4×4 grid, 35% harm, 5s detection phase, path 3–4 steps |
| Advanced | 5×5 grid, 50% harm, 3s detection phase, path 4–6 steps |
| Shadow-mode | Grid parameters tuned to trigger dominant shadow |

### 5.1 Theta-Decay Triggers

- 3+ days: grid complexity regresses one sub-level
- 7+ days: detection-memory window resets to mid-level
- Decay capped at 25%

### 5.2 Mastery Criteria

- Harm-cell identification accuracy ≥ 90% at advanced level
- Navigation success (reach goal without harm-contact) ≥ 85%
- Detect→navigate transition time within adaptive window
- All four shadow signatures below threshold
