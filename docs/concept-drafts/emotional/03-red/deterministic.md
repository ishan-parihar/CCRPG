# Emotional / Red — Deterministic Game Concept

> **Axis:** The deterministic axis probes emotional capacity through OBJECTIVE, MEASURABLE tasks — affect recognition accuracy, channelling success rate, self-management override speed. No interpretation needed. The player either identifies the emotion correctly or doesn't. Either channels successfully or doesn't.
>
> **Why this axis for Emotional/Red:** At Red, emotion is CONCRETE. "That face is angry." "I am angry." "I will USE my anger." The deterministic axis measures whether these basic emotional operations function. It provides the GROUND TRUTH against which other modalities (especially language-reflective) are validated.

---

## 1. Game Identity

- **Title:** "The Wroth-Reader"
- **Core mechanic:** The player identifies emotions in faces/voices, channels named emotions into power, and overrides emotions to serve goals — all measured with objective accuracy. The game is a Red-stage emotional training ground where reading emotion = reading the enemy.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Eye → The Mirror → The Channel → The Override → The Warrior's Read

---

## 2. Catalyst Delivery

**Catalyst:** Faces appear. Voices sound. The player must NAME what they see/hear. Then they must FEEL it (channel). Then they must CONTROL it (override). The contact boundary is: "Can you accurately perceive, use, and manage basic emotion?"

**Unconscious response:**
- *Submergent:* The player's relationship to emotion surfaces. Do they recognise easily (healthy)? Freeze (allergy)? Over-identify (addiction)? Perform without accuracy (golden-addiction)?
- *Emergent:* Can they reach toward subtler emotions? Mixed expressions? Faster recognition?

**Integration path:** Accuracy improves through practice. The game rewards CORRECT identification (not speed alone). Channelling rewards CHOSEN emotion (not compulsive). Override rewards SUCCESSFUL management (not suppression).

**Successful integration:** The player accurately reads 5 basic emotions, channels them into power on demand, and overrides at least one emotion to serve a goal.

---

## 3. Game Design

### Setup
The Wroth-Reader: a Red-stage emotional training ground. NPC faces appear — warriors, enemies, allies — displaying emotions. The player must read them accurately to gain tactical advantage. The aesthetic: war-camp firelight, faces lit by flame, the intensity of reading an enemy's intent before battle.

### Interaction
- **The Eye:** Faces appear displaying basic emotions. Player identifies (tap correct label). Speed + accuracy scored.
- **The Mirror:** Player identifies OWN emotional state (prompted by game events). Accuracy validated against physiological/behavioural signals.
- **The Channel:** Player must FEEL a named emotion and demonstrate it through input intensity. "Feel rage. Show me."
- **The Override:** Player must suppress/redirect an active emotion to complete a task. "You're angry. Now think clearly."
- **The Warrior's Read:** Full integration — read enemy emotion, channel own emotion, override when needed, all in sequence.

### Feedback
- Correct recognition → "You see them. Their anger is naked to you."
- Incorrect → "Look again. What does THAT face say?"
- Successful channel → power surge; "Your rage serves you."
- Failed override → "The emotion won. Next time, YOU win."

### Difficulty Adaptation
- Emotion palette: 2 → 3 → 4 → 5 emotions
- Expression intensity: obvious → moderate → subtle → mixed
- Time pressure: unlimited → 5s → 3s → 2s
- Channelling demand: single emotion → sequence → under load
- Override difficulty: mild emotion → strong emotion → under provocation

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Eye | 1-5 | 2-3 emotions, obvious expressions, no time pressure |
| The Mirror | 5-15 | Self-identification added; 4 emotions; moderate expressions |
| The Channel | 15-30 | Channelling tasks; 5 emotions; time pressure begins |
| The Override | 30-50 | Self-management tasks; subtle expressions; full palette |
| The Warrior's Read | 50+ | Full integration; mixed emotions; rapid sequences |

---

## 4. Item Pool Specification

### Item types
- **Face stimuli:** NPC faces displaying emotions at varied intensities (culturally diverse)
- **Voice stimuli:** Vocal expressions of emotion (tone, pace, volume)
- **Channelling prompts:** Named emotions to access and demonstrate
- **Override scenarios:** Active emotions to suppress/redirect for a goal
- **Composite sequences:** Read → channel → override in rapid succession

### Minimum pool size
- 50+ face stimuli per emotion × 5 emotions = 250+ face items
- 20+ voice stimuli per emotion = 100+ voice items
- 15+ channelling prompts per emotion = 75+ channelling items
- 20+ override scenarios (varied emotion × varied goal)
- Unlimited composite sequences (generated from components)

### Generation rules
- Face stimuli from multi-cultural corpus (NimStim + JACFEE + RaFD equivalent)
- Difficulty = expression intensity × time pressure × palette size
- Channelling difficulty = emotion accessibility × duration × load
- Override difficulty = emotion intensity × goal complexity
- All stimuli must have validated "correct" labels (ground-truth consensus)

### Drive/shadow mapping
- Post-channelling state → Agency dark (escalation = addiction)
- Self-identification confidence → Agency golden
- Contagion rate → Communion dark
- Ambiguity tolerance → Communion golden
- Advancement pressure → Eros dark
- Stretch-accuracy calibration → Eros golden
- Below-level accuracy → Agape dark
- Transfer to non-task contexts → Agape golden

---

## 5. Technical Requirements

### Input types
- Tap-to-select (emotion label selection)
- Intensity-tap/hold (channelling demonstration — force = intensity)
- Timed response (recognition under time pressure)
- Sustained calm input (override demonstration — steady input despite provocation)

### Timing requirements
- Millisecond RT measurement for recognition speed
- Stimulus presentation timing: configurable (unlimited → 2s)
- Post-channelling monitoring (5-10s after channelling to detect escalation/release)

### NPC/AI requirements
- Face-display NPCs with validated emotional expressions
- Voice-display NPCs with validated vocal emotion
- Wroth-Reader NPC (trainer): provides feedback, models emotional reading

### LLM requirements
- **Low:** Contextual framing, NPC dialogue, difficulty narration. All scoring algorithmic.

### State persistence
- Recognition accuracy per emotion (running estimates)
- Channelling success rate per emotion
- Override success rate per emotion × intensity
- Post-channelling escalation patterns (dark-addiction signal)
- Emotion-type asymmetry (golden-allergy signal)
- Confidence-accuracy correlation (golden-addiction signal)
- Contagion rate (communion dark signal)
- Fatigue state; checkpoint position
