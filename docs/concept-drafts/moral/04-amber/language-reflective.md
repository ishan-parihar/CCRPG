# Moral / Amber — Language-Reflective Game Concept

> **Axis:** Verbal articulation of moral reasoning — how the player talks about rules, guilt, duty, and loyalty reveals shadow structure.  **Why this axis for this module:** Conventional morality lives in the stories we tell about why rules matter; language reveals whether the code is genuinely internalised or performed/rejected/calcified.

---

## 1. Game Identity

**Title:** The Witness Tongue
**Core Mechanic:** Player is prompted to articulate moral reasoning in response to code-related situations. LLM analyses language patterns for shadow markers — absolutism, dismissal, ungrounded sophistication, or refusal to articulate.
**Duration:** 5-10 minutes per session, infinite checkpoint.
**Internal Progression:** Simple rule-explanation → guilt-articulation → duty-vs-desire narration → moral code examination → articulating why the code matters without rigidity.

## 2. Catalyst Delivery

**Unique Presentation:** Conversational prompts framed as "testimony" — the player speaks as witness to moral situations. No right/wrong answers; the HOW of articulation is the data.
**Differs From Others:** Not measuring rule-application accuracy (deterministic), not presenting dilemmas (scenario-choice), not tracking body (embodied-somatic), not planning (strategic), not group dynamics (social), not free-play (immersive).
**Uniquely Surfaces:** DA through absolute moral language ("always," "never," "sin," "must"); DAll through dismissive/cynical language ("just rules," "who cares," "control"); GA through sophisticated but ungrounded language (post-conventional terms without conventional depth); GAll through refusal to articulate ("it's just right," "you just know").
**Successful Integration:** Player articulates moral reasoning with genuine depth — honours the code, acknowledges guilt naturally, can examine rules without dismissing or rigidifying them.

## 3. Game Design

**Setup:** Player enters "The Witness Hall" — a space where moral testimony is given. Prompts arrive as situations requiring verbal moral reasoning.

**Interaction Phases:**
1. **Code Naming** — "What rules do you live by?" (baseline moral vocabulary)
2. **Guilt Narration** — "Tell of a time the code was broken" (guilt-language patterns)
3. **Duty Articulation** — "Why does this rule matter?" (depth of internalisation)
4. **Conflict Testimony** — "The code says X but you want Y — speak" (tension-language)
5. **Examination** — "Could this rule ever be wrong?" (flexibility without collapse)

**Feedback Examples:**
1. Genuine moral depth in language → testimony glows, is "recorded in the hall"
2. Absolute/rigid language → testimony hardens, becomes stone (too brittle)
3. Dismissive language → testimony fades, cannot be heard (not internalised)
4. Sophisticated but hollow language → testimony echoes but has no weight
5. Refusal to articulate → silence fills the hall (the unexamined)

**Difficulty Adaptation:** Prompt complexity scales with demonstrated articulation capacity. Examination prompts only appear after genuine conventional language is established. LLM adapts follow-up questions based on detected patterns.

**Internal Progression Table:**

| Level | Prompt Type | Depth Required | Shadow Probed |
|---|---|---|---|
| 1 | Name your rules | Basic moral vocabulary | Baseline |
| 2 | Describe guilt | Guilt-language authenticity | DA/DAll |
| 3 | Explain why rules matter | Internalisation depth | GAll |
| 4 | Speak to conflict | Tension-holding in language | All |
| 5 | Examine the code | Flexibility without collapse | GA/GAll |

## 4. Item Pool

**Code-Naming Prompts (15+):** What promises have you made? What do you owe others? What would you never do? What makes something wrong? When must you act? What duties bind you? What do you protect? What traditions matter? What would break your word? What is sacred to you? Who do you serve? What lines exist? What debts remain? What loyalty means? What honour requires?

**Guilt-Narration Prompts (15+):** When did you break a promise? What haunts your conscience? When did you fail your duty? What rule did you bend? When did you let someone down? What do you regret? When were you disloyal? What truth did you hide? When did you choose ease over right? What obligation did you neglect? When did you betray trust? What vow did you abandon? When did you look away? What debt did you ignore? When did you fail to witness?

**Duty-Articulation Prompts (15+):** Why keep promises? Why tell truth? Why serve others? Why maintain order? Why honour elders? Why protect the weak? Why follow tradition? Why punish betrayal? Why forgive? Why maintain purity? Why witness? Why sacrifice? Why obey? Why belong? Why commit?

**Conflict-Testimony Prompts (20+):** The rule costs you — speak. The code conflicts with love — speak. Authority is wrong — speak. The group demands what you doubt — speak. Loyalty conflicts with truth — speak. Duty conflicts with desire — speak. The code hurts someone — speak. Tradition conflicts with compassion — speak. Obedience conflicts with conscience — speak. The rule was made for different times — speak. Two duties conflict — speak. The code demands punishment but you feel mercy — speak. Your vow binds you to harm — speak. The group's code differs from yours — speak. Following costs everything — speak. Breaking costs nothing visible — speak. No one would know — speak. Everyone else breaks it — speak. The rule protects the wrong person — speak. Keeping faith means losing love — speak.

**Examination Prompts (15+):** Could this rule be wrong? What if the code fails? When do rules bend? Is guilt always right? Can duty be misplaced? Is loyalty always good? When does obedience harm? Can tradition be wrong? Is purity always pure? When does order oppress? Can punishment be unjust? Is forgiveness always right? When does belonging bind? Can commitment trap? Is the code complete?

## 5. Technical Requirements

**Input Types:** Voice input (primary) or text input (fallback). Free-form natural language.
**Timing:** No time pressure — reflective pace. Session continuity tracks language evolution across sessions.
**NPC/AI:** The Witness Hall itself — ambient presence that receives testimony without judgment.
**LLM:** Core requirement. Analyses language for: absolutism markers, dismissal markers, sophistication-without-depth markers, refusal-to-articulate markers, genuine-depth markers. Generates adaptive follow-up prompts. Rubric-scored.
**State Persistence:** Language pattern history, shadow-signal accumulation, articulation-depth trajectory, vocabulary evolution, prompt-response pairs for longitudinal analysis.
