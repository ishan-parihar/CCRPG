# Emotional / Orange — Scenario-Choice Game Concept

> **Axis:** Emotional dilemmas where regulation conflicts with authenticity, and self-awareness conflicts with action.  **Why this axis for this module:** Orange emotional intelligence is tested at its edges — moments where knowing what you feel doesn't simplify the choice, where regulation might mean suppression, where acting on emotion might mean regression.

---

## 1. Game Identity

**Name:** The Crucible Dialogues
**Fantasy:** The player navigates charged interpersonal moments — confrontations, confessions, betrayals, reconciliations — where every response option represents a different relationship to their own emotional state. No option is "correct"; the diagnostic is which emotional stance the player gravitates toward.

**Core loop:** Enter emotionally charged scenario → recognise own emotional state → choose response from options representing different drive/shadow positions → experience consequences → reflect on pattern.

## 2. Catalyst Delivery

**DA surfacing:** The Emotion Engineer consistently chooses "regulated" responses that avoid vulnerability. Selects reappraisal when raw expression is called for. Manages the situation rather than being in it.
**DAll surfacing:** The Emotionally Illiterate chooses action-oriented responses that bypass emotional acknowledgment. "Fix the problem" without naming what they feel about it.
**GA surfacing:** The Premature Empath chooses other-focused responses. "I understand how you feel" without first establishing what they themselves feel. Empathy as avoidance of self.
**GAll surfacing:** The Regulation Fortress chooses self-contained responses. Acknowledges own feeling but refuses to let the other person's emotion affect their state. Walls up.

**Heal/Evolve path:** Scenarios where the healthy choice requires embodying discomfort (Agape) and owning it publicly (Agency).
**Evolve/Heal path:** Scenarios where the healthy choice requires reaching toward emotional growth (Eros) by letting another in (Communion).

## 3. Game Design

**Mechanic 1 — The Dilemma Fork:** Each scenario presents 4–6 response options, each coded to a drive×shadow position. No option is labelled; the player simply chooses what feels right. Pattern across choices reveals shadow.
**Mechanic 2 — Consequence Cascade:** Choices lead to branching outcomes that reveal the emotional cost of each stance. The Emotion Engineer's "managed" response leads to relational distance. The Illiterate's bypass leads to escalation.
**Mechanic 3 — Reflection Prompt:** After consequence, a brief "what did you notice?" moment. Not scored for content but for engagement (skipping = avoidance signal).
**Mechanic 4 — Pattern Mirror:** Every 5 scenarios, the game surfaces the player's choice pattern without judgement. "You've chosen regulation over expression in 4/5 scenarios." The mirror itself is catalyst.

**Difficulty staircase:** Early scenarios have clear "healthy" options. Later scenarios present genuine dilemmas where all options have cost. Highest difficulty: scenarios where the player's dominant shadow IS the adaptive response in context.

## 4. Item Pool

| Item type | Examples | Count |
|---|---|---|
| Interpersonal dilemmas | Confrontation, confession, boundary-setting | 80 |
| Professional dilemmas | Emotional authenticity vs. role demands | 60 |
| Internal dilemmas | Regulation vs. expression, self-care vs. avoidance | 50 |
| Consequence branches | 3–4 outcomes per choice point | 400+ |
| Pattern reflections | Aggregated feedback templates | 20 |

All items tagged by: primary shadow surfaced, drive tested, difficulty tier, relational context.

## 5. Technical Requirements

- **Choice architecture:** Options must be face-valid (no obviously "wrong" answers) and shadow-coded invisibly
- **Branching engine:** Lightweight narrative branching; consequences must feel natural, not punitive
- **Pattern detection:** Rolling window of last 10 choices; shadow coding aggregated across drive axes
- **Session length:** 2–4 scenarios per session (5–10 minutes); infinite checkpoint between scenarios
- **Adaptive selection:** Scenario selection targets detected shadow — if DA pattern emerging, present scenarios where regulation IS the shadow response
- **Shadow flags:** Regulation-dominant pattern → DA; action-without-naming pattern → DAll; other-focused pattern → GA; self-contained pattern → GAll
