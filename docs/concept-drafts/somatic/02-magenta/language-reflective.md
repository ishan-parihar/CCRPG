# Somatic / Magenta — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes somatic intelligence through VERBAL engagement — can the player put body-experience into words? At Magenta, body-language is pre-verbal and imagistic: "My tummy feels like butterflies." The question is whether the player can BEGIN to articulate felt-sense.
>
> **Why this axis for Somatic/Magenta:** Body-awareness that can be named becomes more accessible. At Magenta, naming is magical — "If I name the feeling, I know it." This modality tests whether the player can bridge body-sense and language, which cross-validates against deterministic (if they talk sophisticated but can't hold a posture, that's golden-addiction).

---

## 1. Game Identity

- **Title:** "The Body-Tongue"
- **Core mechanic:** The player names body-sensations, describes felt-states, and begins to articulate somatic experience. Language as bridge between body and awareness. At Magenta, this is imagistic and metaphorical — "warm," "buzzy," "heavy," "like water."
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Word → The Feeling-Name → The Body-Story → The Sensation-Map → The Speaking Body

---

## 2. Catalyst Delivery

**Catalyst:** "What does your body feel like right now? Can you find a word? A picture? What's happening inside?" The contact boundary is: "Can you put body-experience into words?"

**Unconscious response:**
- *Submergent:* How does the player relate to naming body-experience? The Body-Magician names sensations as powers ("I feel INVINCIBLE"). The Disembodied can't name anything ("I don't feel anything"). The Premature Athlete names performance ("I feel STRONG"). The Sensation-Refuser won't name (naming makes sensation real).
- *Emergent:* Can they name accurately? Can they describe without magical attribution? Can they use metaphor?

**Integration path:** Rewards ACCURATE body-naming — describing what the body ACTUALLY feels, not what they wish it felt or what they think it should feel. Imagistic, metaphorical, simple — but TRUE.

**Successful integration:** The player names body-sensations accurately using simple, imagistic language that matches their actual felt-state.

---

## 3. Game Design

### Setup
The Body-Tongue: a verbal-somatic space where the player names body-experience. The aesthetic: Magenta-stage body-oracle — a space where the body speaks through the player's words. Glowing body-outlines with sensation-zones that light up; the player gives them names.

### Interaction
- **The First Word (1-5):** "What does your body feel like? One word." Any word accepted initially.
- **The Feeling-Name (5-15):** "What does THIS part feel like?" Specific zone naming. Accuracy matters.
- **The Body-Story (15-30):** "Tell me about your body right now." Extended description. Coherence matters.
- **The Sensation-Map (30-50):** "Map your whole body in words." Full-body verbal scan.
- **The Speaking Body (50+):** Full verbal-somatic integration — accurate, imagistic, spontaneous.

### Feedback
- Accurate naming → "Yes. That's what your body is saying. You heard it."
- Power-naming → "Not powerful. What TEMPERATURE? What WEIGHT? Simpler. Truer."
- No words → "Start small. Warm or cool? Just that. Your body knows."
- Performance-naming → "Not what it can DO. What it FEELS. Inside. Right now."
- Withdrawal → "Any word. Even 'something.' That's a start."

### Difficulty Adaptation
- Naming demand: any word → accurate word → metaphor → extended description
- Body-zone specificity: whole body → region → specific zone
- Sensation granularity: binary → ternary → gradient → nuanced
- Temporal demand: current state → state-change → state-over-time

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Word | 1-5 | Any body-word accepted |
| The Feeling-Name | 5-15 | Accuracy matters; zone-specific |
| The Body-Story | 15-30 | Extended description; coherence |
| The Sensation-Map | 30-50 | Full-body verbal scan |
| The Speaking Body | 50+ | Full verbal-somatic integration |

---

## 4. Item Pool Specification

### Item types
- **Open naming prompts:** "What does X feel like?"
- **Zone-specific prompts:** "What does your [zone] feel like?"
- **Comparison prompts:** "Is X more like Y or Z?"
- **Metaphor prompts:** "If your body were a [category], what would it be?"
- **Cross-validation items:** Items that must match deterministic body-state data

### Minimum pool size
- 25+ open, 20+ zone-specific, 15+ comparison, 15+ metaphor, 10+ cross-validation

### Drive/shadow mapping
- Power-language → dark-addiction; no body-words → dark-allergy
- Performance-language → golden-addiction; approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Voice input (primary — body-language is spoken at Magenta); text input (secondary); tap-to-select from options (scaffolded mode)

### Timing requirements
- No time pressure on verbal production; response latency tracked as secondary
- Cross-session tracking for vocabulary development

### NPC/AI requirements
- Minimal. Body-outline presents zones; game asks questions.
- Optional: "body-companion" who models body-naming

### LLM requirements
- **Very High:** Evaluates naming accuracy, vocabulary range, specificity, metaphorical quality. Detects power-naming vs. sensation-naming. Identifies performance-vocabulary vs. felt-sense vocabulary.

### State persistence
- Naming history; vocabulary range; accuracy scores; specificity progression; metaphorical quality; cross-validation alignment; power-naming frequency; no-words frequency; performance-naming frequency; approach-withdrawal frequency; drive/shadow signals; fatigue state; checkpoint position
