# Moral / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes moral intelligence through VERBAL and METACOGNITIVE engagement — can the player articulate WHY they chose, explain consequence-logic in words, predict others' moral reasoning, and reflect on their own moral patterns? At Red, this is primitive: "I took it because I wanted it." But the CAPACITY to articulate is itself diagnostic.
>
> **Why this axis for Moral/Red:** Cross-validates against deterministic. A player who can calculate consequences but can't articulate why = genuine Red (healthy — the capacity is pre-verbal). A player who articulates sophisticated moral reasoning but can't calculate consequences = golden-addiction (performing without foundation). The gap between verbal and actual is the diagnostic gold.

---

## 1. Game Identity

- **Title:** "The Consequence-Tongue"
- **Core mechanic:** The player articulates moral reasoning — naming consequences, explaining choices, predicting others' moral logic, and reflecting on their own patterns. The LLM evaluates the QUALITY and AUTHENTICITY of moral articulation.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming Consequences → Explaining Choices → Predicting Others → Teaching Consequence-Logic → Reflecting on Self

---

## 2. Catalyst Delivery

**Catalyst:** "Why did you choose that? What did you think would happen? What would THEY choose, and why?" The contact boundary is: "Can you put your moral reasoning into words?"

**Unconscious response:**
- *Submergent:* The player's verbal moral sophistication reveals their relationship to consequence-logic. Over-articulation = golden-addiction. Under-articulation = may be healthy Red OR dark-allergy.
- *Emergent:* Can they articulate one more layer of consequence-logic? Can they explain not just WHAT they chose but WHY?

**Integration path:** Rewards AUTHENTIC articulation — verbal sophistication that MATCHES demonstrated capacity (from deterministic). Penalises performance without substance.

**Successful integration:** The player articulates consequence-logic at a level consistent with their demonstrated capacity — neither over-performing nor under-articulating.

---

## 3. Game Design

### Setup
The Consequence-Tongue: a space where moral reasoning is SPOKEN. After actions (from other modalities or within this one), the player is asked to articulate. The aesthetic: Red-stage council-fire, where warriors explain their choices to the war-band. Speaking is power. Silence is weakness.

### Interaction
- **Naming Consequences (1-5):** "What happened when you did X?" Simple consequence-naming. Free-text or multiple-choice.
- **Explaining Choices (5-15):** "WHY did you choose X over Y?" Articulate the reasoning behind a choice.
- **Predicting Others (15-30):** "What will the Bandit-Lord choose, and why?" Model another's moral logic verbally.
- **Teaching Consequence-Logic (30-50):** "Explain to this NPC why X leads to Y." Teach consequence-logic to another.
- **Reflecting on Self (50+):** "You've chosen to take in 8 of 10 situations. Why? What does that tell you about yourself?"

### Feedback
- Authentic articulation → "You spoke true. Your words match your actions."
- Over-sophisticated → "Those are big words. But your choices tell a simpler story. Start there."
- Under-articulated → "You chose. You can say why. Try."
- Dismissive → "You said 'it doesn't matter.' But you calculated perfectly. Something matters."

### Difficulty Adaptation
- Articulation complexity: naming → explaining → predicting → teaching → reflecting
- Prompt specificity: specific questions → open prompts → self-generated reflection
- Cross-validation pressure: increasing requirement for verbal-behavioural consistency

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming Consequences | 1-5 | "What happened?" Simple consequence-naming |
| Explaining Choices | 5-15 | "Why did you choose?" Reasoning articulation |
| Predicting Others | 15-30 | "What will they do?" Other-modelling |
| Teaching | 30-50 | "Explain to them." Scaffolding another's understanding |
| Reflecting on Self | 50+ | "What does your pattern mean?" Meta-moral awareness |

---

## 4. Item Pool Specification

### Item types
- **Consequence-naming prompts:** "What happened when X?"
- **Choice-explanation prompts:** "Why did you choose X?"
- **Other-prediction prompts:** "What will [NPC] do and why?"
- **Teaching scenarios:** "Explain consequence-logic to [NPC]"
- **Self-reflection prompts:** "You've done X repeatedly. Why?"

### Minimum pool size
- 30+ naming, 25+ explaining, 20+ predicting, 15+ teaching, 10+ reflecting

### Drive/shadow mapping
- Self-serving articulation → dark-addiction; "I don't know" → dark-allergy
- Sophisticated language >> demonstrated capacity → golden-addiction; accurate + dismissive → golden-allergy

---

## 5. Technical Requirements

### Input types
- Free-text (primary); multiple-choice (fallback for low-verbal players); voice-to-text (accessibility)

### Timing requirements
- No time pressure on articulation; latency measured but not penalised; session-level patterns tracked

### NPC/AI requirements
- NPCs with defined moral reasoning patterns (for prediction tasks)
- "Learner" NPCs who respond to teaching quality
- Dialogue NPCs for moral discussion

### LLM requirements
- **Very High:** Evaluates free-text moral articulation against rubrics. Detects sophistication-capacity mismatch. Generates adaptive prompts. Cross-validates against deterministic scores.

### State persistence
- Articulation quality history; sophistication level; verbal-behavioural consistency ratio; other-modelling accuracy; teaching effectiveness; self-reflection depth; drive/shadow signals; fatigue state; checkpoint position
