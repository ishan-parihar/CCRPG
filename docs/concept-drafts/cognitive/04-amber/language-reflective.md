# Cognitive / Amber — Language-Reflective Game Concept

> **Modality axis:** Verbal articulation of thinking processes — "Can you STATE the rule? Can you EXPLAIN the classification? Can you DESCRIBE what changed?" Not just following rules — ARTICULATING them.
> **Why this axis for this module:** Concrete operational thinking at Amber includes the ability to VERBALISE rules — "I sorted by colour because the rule said colour." This modality tests whether the player can articulate their cognitive process, not just execute it. The gap between doing and saying reveals shadow.

---

## 1. Game Identity

- **Title:** "The Scribe's Testimony"
- **Core mechanic:** The player must ARTICULATE rules, classifications, and patterns in words. Not just follow the rule — EXPLAIN it. "What is the rule? Why did you sort it that way? What changed?" The scribe records the player's understanding of the code.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Testimony → The Named Rule → The Explained Classification → The Witnessed Change → The Living Scribe

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** Cognitive challenge mediated through VERBAL EXPRESSION. The player has already followed the rule (deterministic axis); now they must SAY what the rule is. The contact boundary is: "Can you articulate your cognitive process?"

**How this differs from other modalities:** Requires language (unlike deterministic). Not decision-making under ambiguity (unlike scenario-choice). No body involvement (unlike embodied-somatic). No planning ahead (unlike strategic-planning). No coordination (unlike social-cooperative). No free-play (unlike immersive-rpg). JUST: you did the thing. Now TELL me what you did and why.

**What it uniquely surfaces:** The gap between DOING and SAYING. A player who follows rules perfectly (deterministic) but cannot articulate them has implicit-only cognition. A player who articulates beautifully but fails deterministic tasks has golden-addiction (verbal performance exceeding operational capacity). This is the metacognitive mirror.

**Successful integration:** The player can articulate their cognitive process — clearly, accurately, flexibly — the verbal foundation of metacognition.

---

## 3. Game Design

### Setup
The Scribe's Testimony: a monastery scriptorium where the player dictates their understanding to a scribe-companion. After performing cognitive tasks (from deterministic axis), the player must ARTICULATE what they did and why. The scribe records, questions, and reflects back. Aesthetic: Amber-stage monastery — parchment, quill, candlelight, the weight of testimony.

### Interaction
- **The First Testimony (1-5):** "What did you do? Say it." Simple action-narration after a rule-following task.
- **The Named Rule (5-15):** "What IS the rule? State it." Explicit rule-articulation.
- **The Explained Classification (15-30):** "Why did you sort it that way? Explain." Classification rationale.
- **The Witnessed Change (30-50):** "The rule changed. What was it before? What is it now? How did you know?" Change-articulation.
- **The Living Scribe (50+):** Full metacognitive narration: articulate + explain + examine + adapt.

### Feedback
- Clear articulation → "Well spoken. The scribe records your testimony. The code is known."
- Rigid articulation → "Always? Are you sure? What if the border were thin? Would the rule still hold?"
- Cannot articulate → "Try. Just one sentence. What did you do? 'I put the red one…' where?"
- Abstract bypass → "Simpler. Not the theory. The rule. What IS it? Plain words."
- Refuses examination → "The rule still holds. I'm just curious. Why this rule? Safe to wonder."

### Difficulty Adaptation
- Articulation complexity: action-narration → rule-statement → rationale → change-description → meta-examination
- Scaffolding: heavy prompting → light prompting → no prompting → spontaneous
- Ambiguity: clear rules → conditional rules → ambiguous rules
- Social: solo articulation → articulation for another → articulation under disagreement
- Examination depth: "what" → "why" → "what if" → "how do you know"

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Testimony | 1-5 | Simple action-narration |
| The Named Rule | 5-15 | Explicit rule-statement |
| The Explained Classification | 15-30 | Classification rationale |
| The Witnessed Change | 30-50 | Change-articulation |
| The Living Scribe | 50+ | Full metacognitive narration |

---

## 4. Item Pool

- **Action-narration prompts:** "What did you just do?" (after deterministic tasks) — 20+
- **Rule-statement prompts:** "What is the rule?" (after rule-following) — 20+
- **Rationale prompts:** "Why did you sort it that way?" (after classification) — 15+
- **Change-description prompts:** "What changed? How did you know?" (after WCST shifts) — 15+
- **Meta-examination prompts:** "Why this rule? Could it be different?" (metacognitive) — 10+

---

## 5. Technical Requirements

- **Input types:** Voice/text (primary — natural language articulation); multiple-choice (scaffolded fallback for younger players)
- **Timing:** Response latency noted but not pressured; articulation completeness more important than speed
- **NPC/AI:** Scribe-companion (asks questions, records, reflects back); articulation quality assessment (accuracy, specificity, flexibility); adaptive scaffolding (adjusts prompting based on articulation capacity)
- **LLM:** Very High — natural language understanding for articulation assessment. Must evaluate: accuracy (does statement match behaviour?), specificity (concrete vs. vague), flexibility (conditional vs. absolute), depth (surface vs. examined). Rubric-guided with specific shadow indicators.
- **State persistence:** Articulation history; accuracy scores; specificity ratings; flexibility metrics; examination depth; scaffolding level; cross-session stability; drive/shadow signal accumulation; checkpoint position
