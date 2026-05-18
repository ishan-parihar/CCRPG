# Emotional / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes emotional intelligence THROUGH THE BODY — not "can you name the emotion" but "can you FEEL it in your body?" At Red, emotions are PHYSICAL: rage is heat in the chest, fear is cold in the gut, pride is expansion in the shoulders. This modality tests whether emotion has genuine somatic grounding.
>
> **Why this axis for Emotional/Red:** At Red, emotion IS body. Rage is not an abstract concept — it's a physical state. The embodied-somatic axis tests whether the player's emotional intelligence has genuine physical roots or is merely cognitive/verbal.

---

## 1. Game Identity

- **Title:** "The Wroth-Body"
- **Core mechanic:** The player demonstrates emotional awareness THROUGH physical responses — identifying where emotions live in the body, expressing emotion through physical intensity, and regulating emotion through body-based techniques.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Pulse → The Heat → The Wave → The Shift → The Body's Truth

---

## 2. Catalyst Delivery

**Catalyst:** The game provokes emotion and asks: "Where do you feel it? How does your body respond? Can you SHOW me the feeling through your body?" The contact boundary is: "Is your emotional life embodied or disembodied?"

**Unconscious response:**
- *Submergent:* Does the body respond to emotional stimuli (healthy)? Is it numb (dark-allergy)? Is it overwhelmed (dark-addiction)? Does it perform without genuine feeling (golden-addiction)?
- *Emergent:* Can the body hold subtler emotions? Can it shift between emotional states physically?

**Integration path:** Rewards GENUINE body-emotion connection — physical responses that match the emotional context. Not performance (doing what looks right) but authenticity (the body actually responds).

**Successful integration:** The player demonstrates embodied emotional intelligence — emotions live in the body, the body signals emotional states accurately, and body-based regulation is available.

---

## 3. Game Design

### Setup
The Wroth-Body: a physical-emotional training ground. The player's body IS the instrument of emotional intelligence. Emotional stimuli provoke physical responses; the game reads the body's truth. The aesthetic: Red-stage body-training, warrior's physical emotional discipline, the heat of the forge.

### Interaction
- **The Pulse:** Emotional stimuli appear; player responds with physical intensity matching the emotion (tap force/frequency = emotional intensity)
- **The Heat:** Locate emotion in the body — "Where does anger live? Show me." (Select body region)
- **The Wave:** Ride an emotional wave — intensity rises and falls; body must match the curve
- **The Shift:** Shift between emotions physically — anger → calm → pride → calm (body must transition)
- **The Body's Truth:** Full integration — feel, locate, express, regulate, all through the body

### Feedback
- Genuine physical response → "Your body speaks truth. The feeling is REAL in you."
- Flat response → "Your body is quiet. Can you wake it? Even a little?"
- Amplified response → "Your body screams when a whisper would serve. Can you turn it down?"
- Performed response → "Your body moved. But did it FEEL? Show me the real thing."

### Difficulty Adaptation
- Emotion intensity: obvious → moderate → subtle
- Body-precision: general activation → specific location → graduated intensity
- Transition speed: slow shifts → rapid shifts → under load
- Regulation demand: none → mild → strong → under provocation

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Pulse | 1-5 | Basic physical emotional response; obvious stimuli |
| The Heat | 5-15 | Body-location awareness; moderate stimuli |
| The Wave | 15-30 | Intensity matching; riding emotional curves |
| The Shift | 30-50 | Emotional transitions; body-based regulation |
| The Body's Truth | 50+ | Full embodied emotional intelligence |

---

## 4. Item Pool Specification

### Item types
- **Emotional stimuli:** Provocations designed to trigger specific body-emotions
- **Intensity curves:** Emotional waves to match physically (rise/fall patterns)
- **Location prompts:** "Where does X emotion live in the body?"
- **Transition sequences:** Emotion A → B → C requiring physical shifts
- **Regulation challenges:** Active emotion requiring body-based management

### Minimum pool size
- 25+ stimuli per emotion × 5 = 125+; 20+ intensity curves; 15+ location prompts; 15+ transition sequences; 15+ regulation challenges

### Drive/shadow mapping
- Physical amplification → dark-addiction; flat response → dark-allergy
- Performed without activation → golden-addiction; vulnerability-block → golden-allergy
- Autonomic escalation → Agency dark; self-directed expression → Agency golden
- Physical mirroring → Communion dark; shared embodiment → Communion golden

---

## 5. Technical Requirements

### Input types
- Force-sensitive tap/hold (physical intensity measurement)
- Frequency-tap (rapid tapping as activation proxy)
- Body-region selection (tap on body-map for location tasks)
- Sustained input patterns (for wave-matching and regulation)

### Timing requirements
- Input intensity sampling at ≥30Hz; intensity-curve matching requires smooth measurement
- Transition timing (how quickly body shifts between states)

### NPC/AI requirements
- Body-Master NPC: models embodied emotion, provides feedback
- Stimulus NPCs: display physical emotional states for observation

### LLM requirements
- **Low-Medium:** Stimulus generation, contextual framing. Core scoring algorithmic (intensity measurement, curve-matching, timing).

### State persistence
- Physical responsiveness per emotion; location accuracy; intensity-matching quality; transition speed; regulation effectiveness; amplification patterns; flat-response patterns; drive/shadow signals; fatigue state; checkpoint position
