# Intrapersonal / Amber — Language-Reflective Game Concept

> **Axis:** Verbal articulation of role-identity — how the player talks about who they are within the code.  **Why this axis for this module:** Language reveals whether role-identity is genuinely inhabited or merely performed; the words chosen expose fusion, refusal, bypassing, or clinging.

---

## 1. Game Identity

- **Title:** The Chronicle of Names
- **Core Mechanic:** Prompted self-narration within role-contexts — player completes identity-statements, names their role-relationship, and articulates duty-boundaries in their own words.
- **Duration:** 4–8 minutes per session, infinite checkpoint.
- **Internal Progression:** Prompts move from simple role-naming → role-justification → role-boundary articulation → role-vs-self distinction → role-transcendence readiness.

---

## 2. Catalyst Delivery

- **Unique Presentation:** A living codex that asks the player to inscribe their identity — each entry becomes part of a growing self-chronicle that evolves across sessions.
- **Differs from others:** Uses free-text and structured language rather than sorting, movement, or choice. The LLM evaluates linguistic markers of identity-structure.
- **Uniquely Surfaces:** GA (language of self-beyond-role without role-grounding), GAll (rigid repetition of role-titles without elaboration), DA (cannot articulate self apart from role), DAll (refuses role-language entirely).
- **Successful Integration:** Player articulates role-identity with warmth AND can name the self beneath/beyond it without abandoning the role.

---

## 3. Game Design

**Setup:** The Codex presents a role-context (e.g., "You have served as Warden for three seasons") and offers identity-prompts.

**Interaction Phases:**
1. **Naming** — "Complete: I am the ___" (baseline role-identification)
2. **Justification** — "I hold this role because ___" (code-relationship)
3. **Boundary** — "My duty ends where ___" (role-limit awareness)
4. **Distinction** — "Apart from this role, I ___" (self-beyond-role)
5. **Integration** — "My role and my self relate like ___" (mature holding)

**Feedback Examples:**
1. Linguistic rigidity score — repetitive role-titles without elaboration (GAll marker)
2. Self-reference ratio — how often "I" appears independent of role-nouns (DA/DAll marker)
3. Temporal flexibility — can player narrate role-change without distress language
4. Abstraction level — premature philosophical language without concrete role-grounding (GA marker)
5. Warmth indicators — affective tone toward role reveals genuine inhabitation vs performance

**Difficulty Adaptation:** Prompts become more challenging based on linguistic complexity demonstrated; role-contexts grow more ambiguous; distinction prompts appear only after naming/justification mastery.

**Internal Progression Table:**

| Level | Prompt Type | Shadow Probed | LLM Focus |
|---|---|---|---|
| 1–3 | Simple naming and justification | Baseline | Role-vocabulary richness |
| 4–6 | Boundary and exception articulation | DA/DAll | Self-reference independence |
| 7–9 | Self-beyond-role distinction | GAll/GA | Abstraction grounding |
| 10+ | Integration and role-change narration | All four | Coherence and warmth |

---

## 4. Item Pool

**Role-Contexts (20):** Warden of three seasons, newly appointed Healer, veteran Scribe, disgraced Guardian restored, apprentice Judge, retiring Sentinel, Keeper during crisis, Herald in peacetime, Arbiter between factions, Steward of dwindling resources, Witness to injustice, Enforcer questioning orders, Curator of forbidden knowledge, Chaplain losing faith, dual-role holder, role inherited from parent, role chosen against expectation, role assigned by lottery, temporary emergency role, honorary role without duties

**Identity-Prompts (30):** "I am the ___", "I hold this role because ___", "Without this role I would ___", "My duty ends where ___", "The code asks me to ___", "I chose / was chosen because ___", "When my role conflicts with my desire I ___", "Others see me as ___", "I see myself as ___", "My role and my self relate like ___", "If this role were taken I would ___", "I am more than ___ because ___", "I am not yet ready to ___", "My role teaches me ___", "I serve the code by ___", "The hardest part of my role is ___", "I am proud of ___", "I fear ___", "Beyond this role lies ___", "I became this role when ___", "This role became me when ___", "I will outgrow this role when ___", "I resist outgrowing because ___", "My role connects me to ___", "My role separates me from ___", "The code is right about ___", "The code is wrong about ___", "I obey because ___", "I question because ___", "Who I am without a title is ___"

**Linguistic Markers (15):** Role-noun frequency, first-person independence, temporal flexibility, affective warmth, abstraction level, concrete specificity, boundary clarity, contradiction tolerance, growth language, fear language, rigidity indicators, fluidity indicators, code-reference density, self-compassion markers, integration coherence

**Difficulty Modifiers (15):** Role-ambiguity, role-conflict context, time pressure on response, emotional valence, role-loss framing, role-change framing, peer-comparison prompt, authority-challenge prompt, legacy prompt, mortality prompt, failure prompt, success prompt, transition prompt, multiplicity prompt, silence prompt

**Scoring Dimensions (5):** Role-articulation depth, self-role differentiation, linguistic flexibility, shadow-indicator density, integration coherence

---

## 5. Technical Requirements

- **Input Types:** Free-text entry (sentence completion), optional voice-to-text, multiple-choice fallback for accessibility
- **Timing:** Untimed primary responses; response latency tracked as secondary metric (hesitation patterns)
- **NPC/AI:** The Codex as narrative frame — presents prompts with contextual flavour text
- **LLM:** Primary scoring engine — evaluates linguistic markers, shadow-indicators, integration coherence, and generates adaptive follow-up prompts
- **State Persistence:** Full chronicle history, linguistic trajectory across sessions, shadow-indicator trends, vocabulary evolution, drive-health inference per entry
