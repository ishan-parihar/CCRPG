# Intrapersonal / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes self-knowledge through RELATIONAL CONTEXTS — how does self-knowledge function when others are involved? At Red, the key questions are: "Do you know yourself well enough to coordinate with others? Does others' feedback update your self-model? Can you represent yourself accurately to allies?"
>
> **Why this axis for Intrapersonal/Red:** Self-knowledge at Red is primarily PRIVATE — "I am the warrior" is an internal identification. But self-knowledge becomes SOCIAL when you must communicate it to allies, when others reflect you back to yourself, and when coordination requires accurate self-representation. This modality tests the SOCIAL dimension of self-knowledge.

---

## 1. Game Identity

- **Title:** "The Self-in-the-Circle"
- **Core mechanic:** The player must USE self-knowledge in social contexts — accurately representing capacity to allies, receiving feedback about themselves, and coordinating based on honest self-assessment. The game measures whether self-knowledge is COMMUNICABLE and UPDATABLE.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Self-Representation → Receiving Feedback → Coordination → The Mirror of Others → The Known Self

---

## 2. Catalyst Delivery

**Catalyst:** "Your ally needs to know what you can do. Tell them. Are you right?" The contact boundary is: "Can you represent yourself accurately to others? Can you receive their perception of you?"

**Unconscious response:**
- *Submergent:* How does social context affect self-knowledge? The Narcissist inflates to allies. The Unexamined cannot represent self at all. The Premature Witness over-shares abstract self-models. The Identity-Clinger represents only the identity-self.
- *Emergent:* Can they communicate self-knowledge accurately? Can they update self-model from social feedback?

**Integration path:** Rewards ACCURATE SOCIAL SELF-KNOWLEDGE — representing yourself honestly to others AND integrating their feedback. The player who says "I'm good at X, weak at Y" and is RIGHT scores highest.

**Successful integration:** The player can accurately represent their capacity to allies, receive feedback without defensiveness, and coordinate based on honest mutual self-knowledge.

---

## 3. Game Design

### Setup
The Self-in-the-Circle: a coordination game where self-knowledge must be COMMUNICATED to allies for joint success. The player represents their capacity, receives feedback, and coordinates based on mutual self-knowledge. The aesthetic: Red-stage war-band planning — warriors declaring their strengths and limitations before battle.

### Interaction
- **Self-Representation (1-5):** Tell ally your strength. Ally assigns task. Success depends on accuracy of self-representation.
- **Receiving Feedback (5-15):** Ally observes you and reports ("You seem tired/strong/distracted"). Do you integrate it?
- **Coordination (15-30):** Joint task allocation based on mutual self-knowledge. Both must represent accurately.
- **The Mirror of Others (30-50):** Others' perception of you vs. your self-perception. Where do they diverge? Who's right?
- **The Known Self (50+):** Full social self-knowledge — accurate representation, feedback integration, coordination, and self-model updating.

### Feedback
- Accurate self-representation → "You told them true. They trusted you. The team won."
- Inflated → "You said you could. You couldn't. Your ally paid the price. Speak true next time."
- Absent → "Your ally asked what you can do. Silence helps no one. One word next time."
- Over-shared → "Your ally needed 'yes' or 'no.' You gave them a speech. Simpler."

### Difficulty Adaptation
- Social complexity: 1 ally → 2 allies → group
- Self-knowledge demand: obvious strengths → subtle patterns → limitations
- Feedback complexity: binary → nuanced → contradicting self-model
- Coordination stakes: low → moderate → high

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Self-Representation | 1-5 | Tell ally one strength; task-allocation |
| Receiving Feedback | 5-15 | Ally observes and reports; integration |
| Coordination | 15-30 | Mutual self-knowledge for joint planning |
| The Mirror of Others | 30-50 | Self-perception vs. others' perception |
| The Known Self | 50+ | Full social self-knowledge ecology |

---

## 4. Item Pool Specification

### Item types
- **Self-representation tasks:** Communicate capacity to ally for coordination
- **Feedback-reception tasks:** Receive and evaluate ally's observation of you
- **Coordination tasks:** Joint task-allocation based on mutual self-knowledge
- **Perception-comparison tasks:** Compare self-view with others' view
- **Self-model-update tasks:** Integrate new social information into self-model

### Minimum pool size
- 25+ self-representation, 20+ feedback-reception, 20+ coordination, 15+ perception-comparison, 10+ self-model-update

### Drive/shadow mapping
- Inflated self-representation → dark-addiction; absent self-representation → dark-allergy
- Over-elaborate self-disclosure → golden-addiction; identity-only representation → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (self-representation choices); accept/reject (feedback integration); drag-and-drop (task allocation)

### Timing requirements
- No time pressure on self-representation; coordination has generous windows
- Cross-session tracking for perception-comparison

### NPC/AI requirements
- Ally NPCs who OBSERVE and REPORT on player's behaviour
- Ally NPCs who NEED self-knowledge for coordination
- Perception system that tracks how NPCs see the player vs. how player sees self
- Trust system that responds to self-representation accuracy

### LLM requirements
- **Medium:** Ally dialogue, feedback generation, social scenario construction. Core scoring algorithmic.

### State persistence
- Self-representation history + accuracy; feedback integration patterns; coordination quality; perception-gap data; self-model update speed; trust scores with allies; drive/shadow signals; fatigue state; checkpoint position
