# Somatic / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of body-knowledge — how the player talks about physical practice reveals embodied understanding vs. intellectual performance.  **Why this axis for this module:** Orange somatic mastery lives in the body, but language reveals whether knowledge is genuinely embodied or merely conceptual.

---

## 1. Game Identity

- **Title:** The Body's Voice
- **Core Mechanic:** Player verbally describes, explains, and reflects on physical techniques and body-states. LLM evaluates whether language reflects genuine embodied knowledge or intellectual abstraction.
- **Duration:** 5–10 minutes per session, infinite checkpoint.
- **Internal Progression:** Describing simple movements → explaining technique rationale → articulating felt-sense during execution → teaching technique to others → integrating performance language with body-awareness language.

## 2. Catalyst Delivery

- **Unique Presentation:** A master craftsperson's workshop where the player is interviewed about their physical practice. The interviewer NPC asks progressively deeper questions about body-knowledge.
- **Differs From Others:** No physical execution required — purely linguistic. Surfaces the gap between knowing-about and knowing-through-the-body.
- **Uniquely Surfaces:** GA (elaborate somatic vocabulary without genuine skill), DAll (dismissive or purely mechanical language about the body), GAll (technical precision language that refuses felt-sense vocabulary).
- **Successful Integration:** Player uses language that seamlessly weaves technical precision with embodied awareness — neither purely mechanical nor purely mystical.

## 3. Game Design

- **Setup:** NPC presents a physical scenario and asks the player to describe or explain it.
- **Interaction Phases:**
  1. Description — "Describe how you would execute this technique"
  2. Rationale — "Why does this work biomechanically?"
  3. Felt-sense — "What does it feel like when you do this correctly?"
  4. Teaching — "How would you teach this to someone who has never done it?"
  5. Integration — "How do you know when to push harder vs. when to rest?"
- **Feedback Examples:**
  1. "Your description is technically precise but lacks any reference to sensation" (GAll indicator)
  2. "You use rich feeling-language but the biomechanics are vague" (GA indicator)
  3. "You describe the body as something separate from yourself" (DAll indicator)
  4. "Your language treats the body as a machine to be optimized" (DA indicator)
  5. "Your explanation integrates how it works with how it feels — embodied mastery" (integration)
- **Difficulty Adaptation:** Questions deepen based on demonstrated language capacity. If player shows GA patterns, questions demand technical specificity. If GAll, questions probe felt-sense.
- **Internal Progression Table:**

| Level | Prompt Type | Shadow Probe |
|---|---|---|
| 1–3 | Simple technique description | Baseline vocabulary assessment |
| 4–6 | Biomechanical explanation | DAll: dismissive language about body |
| 7–9 | Felt-sense articulation | GAll: refuses sensation vocabulary |
| 10–12 | Teaching and transmission | GA: elaborate but ungrounded language |
| 13+ | Integration prompts | DA: machine-language about body |

## 4. Item Pool

- **Technique Descriptions (20):** Throwing mechanics, balance recovery, precision grip, explosive movement, sustained hold, rotational power, deceleration control, fine motor threading, bilateral coordination, rhythm execution, postural alignment, breath-movement coupling, force redirection, impact absorption, acceleration sequencing, spatial navigation, proprioceptive adjustment, weight transfer, momentum management, reactive stabilization
- **Rationale Prompts (18):** Why does relaxation increase speed, how does breath affect stability, why does practice plateau, what makes timing "click," how does fatigue change technique, why do injuries recur, what makes a movement efficient, how does cross-training transfer, why does visualization work, what distinguishes mastery from repetition, how does the body learn, why does rest improve performance, what makes coordination automatic, how does stress affect precision, why do some techniques feel natural, what makes recovery active, how does awareness change execution, why does novelty accelerate learning
- **Felt-Sense Prompts (15):** The moment before a perfect execution, the difference between forced and flowing movement, what fatigue feels like before metrics show it, the sensation of a new skill "clicking," how the body signals overtraining, what ease feels like under load, the felt-difference between precision and tension, how rhythm lives in the body, what coordination feels like from inside, the sensation of physical confidence, how recovery feels different from laziness, what the body wants vs. what the mind demands, the felt-sense of physical limits, how mastery feels different from effort, the body's experience of flow
- **Teaching Scenarios (15):** Teach a child to throw, explain balance to a novice, describe rhythm to someone with no musical background, teach precision without creating tension, explain recovery without encouraging avoidance, teach technique without creating rigidity, explain felt-sense to a pure intellectual, teach pacing to someone who only knows "harder," describe coordination to a single-limb mover, teach adaptation to someone who only knows routine, explain cross-training to a specialist, teach self-correction without self-criticism, explain physical confidence to someone afraid of their body, teach mastery-orientation to a perfectionist, describe embodied knowledge to a skeptic
- **Integration Probes (12):** Describe a training session honoring both metrics and sensation, explain the difference between productive discomfort and injury, articulate your relationship with your body, describe physical mastery without reducing body to instrument, explain how technique and feeling work together, describe what your body has taught your mind, articulate the difference between discipline and compulsion, explain how you balance achievement with embodiment, describe physical practice as both science and art, articulate when to override body signals vs. when to listen, explain how physical mastery opens rather than closes, describe the body as both instrument and self

## 5. Technical Requirements

- **Input Types:** Free-text input (typed or voice-to-text). Multiple-choice for accessibility fallback.
- **Timing:** No time pressure on responses. Reflection time is valued. Session pacing is player-controlled.
- **NPC/AI:** Interviewer NPC with adaptive questioning. Responds to player language with deepening or redirecting prompts.
- **LLM:** Primary engine. Evaluates language for: technical specificity, felt-sense vocabulary, integration markers, shadow indicators. Generates follow-up questions based on detected patterns.
- **State Persistence:** Language pattern profiles across sessions, vocabulary evolution tracking, shadow-indicator trajectories, integration marker progression, cross-session thematic analysis.
