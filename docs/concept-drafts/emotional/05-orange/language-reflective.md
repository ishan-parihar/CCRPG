# Emotional / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of the emotional life as window into genuine self-awareness vs. performance.  **Why this axis for this module:** How a player talks about feelings — vocabulary depth, hedging patterns, performative vs. authentic phrasing — reveals whether Orange emotional self-awareness is lived or merely claimed.

---

## 1. Game Identity

**Name:** The Inner Cartographer
**Fantasy:** The player maintains a living emotional atlas — a map of their inner landscape that grows more detailed and accurate as they articulate what they find there. Uncharted regions represent unexamined affect; mislabelled territories represent self-deception.

**Core loop:** Encounter emotional prompt → articulate response in natural language → LLM evaluates depth/authenticity/granularity → map territory updates → deeper prompts unlock.

## 2. Catalyst Delivery

**DA surfacing:** The Emotion Engineer produces language that is technically precise but affectively flat. "I notice frustration arising and I'm applying reappraisal." The LLM detects clinical distancing — correct vocabulary without felt presence.
**DAll surfacing:** The Emotionally Illiterate produces vague or externalising language. "I don't know, it's fine" or "That situation was stupid." Low granularity, high deflection.
**GA surfacing:** The Premature Empath produces other-focused language. "I can feel how everyone in that room was suffering." Empathic performance without self-referential depth.
**GAll surfacing:** The Regulation Fortress produces self-contained language. Rich self-description but deflects when prompted toward relational emotional content. "That's their problem to manage."

**Heal/Evolve path:** Prompts that require staying with discomfort (Agape) and owning it as one's own (Agency).
**Evolve/Heal path:** Prompts that invite reaching toward emotional growth (Eros) through sharing vulnerability (Communion).

## 3. Game Design

**Mechanic 1 — Emotion Journaling Prompts:** Contextual prompts after game events. "What did you feel when X happened?" Scored on: vocabulary granularity, self-reference depth, hedging ratio, authenticity markers.
**Mechanic 2 — Reappraisal Articulation:** Player is given an emotional scenario and must articulate a reframe. Scored on: genuine cognitive shift vs. dismissal, emotional acknowledgment before reframe, creativity of reappraisal.
**Mechanic 3 — Emotional Differentiation:** Two similar emotions presented; player must articulate the difference as experienced. "How is your disappointment different from your sadness here?" Tests granularity of lived experience.
**Mechanic 4 — Vulnerability Gradient:** Progressive prompts that move from safe ("describe a time you felt proud") to exposed ("describe a feeling you've never told anyone about"). Depth of engagement at each level is diagnostic.

**Difficulty staircase:** Prompts move from concrete/recent to abstract/deep. Emotional complexity increases. Relational content introduced gradually.

## 4. Item Pool

| Item type | Examples | Count |
|---|---|---|
| Journaling prompts | Post-event reflections, daily check-ins | 150 |
| Reappraisal scenarios | Situations requiring cognitive reframe | 80 |
| Differentiation pairs | Similar-emotion contrasts | 60 |
| Vulnerability prompts | Graduated self-disclosure invitations | 40 |
| Authenticity calibration | Known-depth exemplars for LLM training | 200 |

All items tagged by: emotional domain, vulnerability level, self/other focus, shadow-surfacing target.

## 5. Technical Requirements

- **LLM scoring rubric:** Multi-dimensional evaluation — granularity (1–5), authenticity (hedging ratio, clinical distance markers), self-reference depth, relational openness
- **Privacy:** All journal entries encrypted at rest; player controls deletion; no human review without consent
- **Adaptive prompting:** Prompt selection based on detected shadow pattern and current depth ceiling
- **Session length:** 3–6 minutes per prompt cycle; 1–3 prompts per session
- **Anti-gaming:** LLM trained to detect performative depth (sophisticated language without genuine disclosure) — the DA signature
- **Shadow flags:** Clinical distance + correct vocabulary → DA; vague/deflecting → DAll; other-focused + self-absent → GA; self-contained + relational avoidance → GAll
