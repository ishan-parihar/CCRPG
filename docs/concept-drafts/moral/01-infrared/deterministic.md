# Moral × Infrared — Deterministic

## 1. Game Identity

| Field | Value |
|---|---|
| Modality | Deterministic |
| Unique lateral | Objective harm-detection measurement — pain-response latency, safe/unsafe discrimination accuracy |
| Core mechanic | Timed discrimination between harmful and non-harmful stimuli |
| Session length | 60–120 seconds per checkpoint |
| Infinite checkpoint | Yes — each trial block is a checkpoint |

## 2. Catalyst Design

### 2.1 Surface Experience

A stream of environmental stimuli appears — glowing orbs, surfaces, creatures. Some pulse with a "sharp" visual/audio signature (harmful); others pulse with a "soft" signature (safe). The player must tap harmful stimuli to flag them, or hold still for safe ones. Pure reaction — no reasoning required.

### 2.2 Stimulus Parameters

- **Harmful cues:** jagged edges, red-hot glow, crackling audio, rapid pulse
- **Safe cues:** rounded edges, cool glow, humming audio, slow pulse
- **Ambiguous cues (adaptive):** mixed features requiring finer discrimination at higher difficulty
- **Presentation rate:** starts at 1 per 2s, adapts to 1 per 0.5s

### 2.3 Drive Probes

| Drive | Probe |
|---|---|
| Eros | Discrimination threshold — how fine a difference can be detected? |
| Agape | Response to clear harm — does the organism acknowledge obvious pain-signals? |
| Agency | Reaction latency — how quickly does withdrawal occur? |
| Communion | False-alarm rate — does the organism over-flag safe stimuli as harmful? |

## 3. Shadow Surfacing

| Shadow | Behavioural signature |
|---|---|
| Pain-Fixation (DA) | Flags everything as harmful; near-zero miss rate but massive false-alarm rate |
| Pain-Numbness (DAll) | Flags almost nothing; high miss rate, low false-alarm rate, slow latency |
| Premature Taboo (GA) | Responds to category rather than sensation — flags by type not by felt-quality |
| Harm Fortress (GAll) | Detects accurately (low miss) but delays response — knows but won't act |

## 4. Integration Mechanics

### 4.1 Heal Vector (bottom-up: Agape + Agency)

- **Pain-Fixation:** Gradually increase safe-stimulus density; reward accurate "safe" holds; teach that not-everything-hurts
- **Pain-Numbness:** Amplify harmful cues (louder, brighter); reward any detection; rebuild signal-sensitivity

### 4.2 Evolve Vector (top-down: Eros + Communion)

- **Premature Taboo:** Remove category labels; force felt-quality discrimination; ground "wrong" in sensation
- **Harm Fortress:** Introduce time-pressure that makes delayed response costly; reward immediate action on detection

## 5. Progression & Difficulty

| Level | Parameters |
|---|---|
| Entry | 70% obvious harmful/safe, 30% moderate; 2s presentation |
| Mid | 50% obvious, 50% ambiguous; 1.2s presentation |
| Advanced | 30% obvious, 70% fine-grained; 0.7s presentation |
| Shadow-mode | Stimuli designed to trigger specific shadow patterns; adaptive to dominant shadow |

### 5.1 Theta-Decay Triggers

- 3+ days without session: discrimination threshold regresses one sub-level
- 7+ days: latency baseline resets to mid-level
- Decay capped at 25% of peak score

### 5.2 Mastery Criteria

- Safe/unsafe discrimination accuracy ≥ 90% at advanced level
- Mean reaction latency within 1 SD of personal best
- False-alarm rate < 15% at advanced level
- All four shadow signatures below clinical threshold
