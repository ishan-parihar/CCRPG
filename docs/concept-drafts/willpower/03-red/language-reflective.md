# Willpower / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes willpower capacity through VERBAL/METACOGNITIVE access — can the player articulate their volitional experience? Can they name what they're willing, describe how it feels to sustain effort, explain why they stopped, predict what they'll commit to next? This modality accesses the CONSCIOUS-ACCESS dimension of will: not "can you will" but "can you KNOW that you're willing?"
>
> **Why this axis for Willpower/Red:** At Red, will is raw and often pre-reflective — "I just DO it." The language-reflective axis tests whether volitional intelligence has reached conscious access. Can the player name their goals? Describe their effort? Explain their fatigue? This is the bridge between blind will and self-aware will — the beginning of volitional metacognition.

---

## 1. Game Identity

- **Title:** "The Vow-Speaker"
- **Core mechanic:** The player articulates their volitional experience — naming goals, describing effort-states, explaining commitment/abandonment, predicting future volitional behaviour — with LLM evaluation of volitional vocabulary depth, accuracy, and self-awareness.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming → Describing → Explaining → Predicting → Teaching

---

## 2. Catalyst Delivery

**Catalyst:** The game asks the player to PUT WORDS to their volitional experience. After a brief effort-task, the game asks: "What did you just commit to? How did it feel to hold? Why did you stop?" The contact boundary is: "Can you access your will through language?"

**Unconscious response:**
- *Submergent:* The player's relationship to volitional self-knowledge surfaces. Can they name their goals (or are goals pre-verbal)? Can they describe effort (or is effort invisible to them)? Can they explain their patterns (or are they blind to their own will)?
- *Emergent:* The pull toward volitional self-awareness — can they see their own willing clearly enough to speak it?

**Integration path:** The game rewards ACCURATE volitional self-description. Not eloquence — ACCURACY. A player who says "I stopped because I was tired" when they actually stopped because they were bored scores lower than one who says "I stopped because I got bored." The will becomes visible to itself through language.

**Successful integration:** The player can accurately name their goals, describe their effort-states, explain their volitional patterns, and predict their future behaviour — demonstrating that will has reached conscious access.

---

## 3. Game Design

### Setup
The Vow-Speaker's circle: a ritual space where warriors speak their vows aloud. The player has just completed a brief volitional task (10-15 seconds of sustained effort) and now must SPEAK about the experience. The Vow-Speaker NPC listens, evaluates, and guides. The aesthetic: Red-stage council fire, warriors speaking truth, the weight of spoken vows.

### Interaction
- **Naming:** "What did you just commit to? Name your vow." (Single word or phrase)
- **Describing:** "How did it feel to hold? Describe the effort." (1-2 sentences)
- **Explaining:** "Why did you stop when you did? Explain your choice." (2-3 sentences)
- **Predicting:** "What will you commit to next? How long will you hold?" (Prediction + rationale)
- **Teaching:** "A young warrior asks: 'How do I will?' What do you tell them?" (Instruction)

### Feedback
- Accurate self-description → Vow-Speaker nods: "You see your own will clearly. That is power."
- Vague/inaccurate description → Vow-Speaker probes: "Is that truly what happened? Look deeper."
- Rich volitional vocabulary → "Your words carry the weight of your will. Speak more."
- Empty/passive language → "Where is your will in those words? I hear no fire."

### Difficulty Adaptation
- Prompt complexity: naming → describing → explaining → predicting → teaching
- Self-awareness demand: surface → pattern → cause → future → transfer
- Vocabulary expectation: single word → phrase → sentence → paragraph → instruction
- Accuracy demand: any response → relevant response → accurate response → insightful response

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming | 1-5 | Name goals, name effort, name rest. Single words/phrases. |
| Describing | 5-15 | Describe volitional states in sentences. Effort, fatigue, satisfaction. |
| Explaining | 15-30 | Explain volitional patterns. Why you commit, why you stop, why you resist. |
| Predicting | 30-50 | Predict future volitional behaviour. What you'll commit to, how long, what will challenge you. |
| Teaching | 50+ | Teach volitional wisdom. Instruct others in willing. Demonstrate metacognitive mastery. |

---

## 4. Item Pool Specification

### Item types
- **Volitional prompts:** Questions about the player's will-experience (post-task reflections)
- **Effort-tasks:** Brief volitional challenges that generate experience to reflect on
- **Scenario prompts:** Hypothetical volitional situations to describe/predict
- **Teaching prompts:** Requests to explain willing to a novice
- **Pattern prompts:** Questions about recurring volitional patterns

### Minimum pool size
- 30+ naming prompts (varied volitional dimensions: goal, effort, rest, temptation, completion)
- 25+ describing prompts (varied states: sustaining, resisting, fatiguing, completing, resting)
- 20+ explaining prompts (varied patterns: commitment, abandonment, escalation, avoidance)
- 15+ predicting prompts (varied futures: next goal, next challenge, next pattern)
- 10+ teaching prompts (varied audiences: novice warrior, struggling ally, young recruit)

### Generation rules
- Prompts generated from player's ACTUAL recent volitional behaviour (personalised)
- Difficulty = metacognitive demand (naming < describing < explaining < predicting < teaching)
- Prompts must reference REAL game-behaviour (not hypothetical) when possible
- Teaching prompts must be appropriate to Red-stage language (concrete, power-framed)

### Drive/shadow mapping
- Domination acknowledgment → Agency dark probing
- Self-generated goal description → Agency golden probing
- Relational will description → Communion probing
- Completion/rest language → Eros probing
- Simple-goal respect → Agape probing
- Absence of rest-language → dark-addiction signal
- Absence of goal-language → dark-allergy signal
- System-language without fire → golden-addiction signal
- Negative duration-language → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Text input (typed responses to prompts)
- Voice input (spoken responses — optional, preferred for Red-stage authenticity)
- Multiple-choice (for naming phase — select the word that matches your experience)
- Free-form (for describing/explaining/predicting/teaching phases)

### Timing requirements
- Response latency measured (diagnostic — very fast may indicate rehearsed/performative; very slow may indicate genuine reflection)
- No time pressure on responses (reflection is the point)
- Brief effort-task before reflection (10-15s) to generate fresh volitional experience

### NPC/AI requirements
- Vow-Speaker NPC: listens, evaluates, probes, guides
- Must respond to player's ACTUAL language (not generic feedback)
- Must detect shadow-language and probe appropriately
- Must model accurate volitional self-description (demonstrates what good looks like)

### LLM requirements
- **Very High:** Core mechanic is language evaluation
- Evaluates volitional vocabulary (breadth, accuracy, depth)
- Cross-references described experience with observed behaviour from other modalities
- Detects shadow-language patterns
- Generates personalised prompts from player's volitional history
- Provides qualitative feedback on self-awareness quality

### State persistence
- Volitional vocabulary inventory (words/concepts the player has demonstrated)
- Description accuracy history (improving or declining)
- Explanatory depth history (surface → pattern → cause)
- Predictive accuracy history (predicted vs. actual)
- Shadow-language patterns (which gaps persist, which are closing)
- Cross-modal references (links to deterministic/embodied data for accuracy checking)
- Checkpoint position and phase
