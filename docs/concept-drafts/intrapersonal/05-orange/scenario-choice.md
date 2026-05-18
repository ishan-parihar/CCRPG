# Intrapersonal / Orange — Scenario-Choice Game Concept

> **Axis:** Identity dilemmas where self-authorship conflicts with comfort or self-knowledge conflicts with self-image.  **Why this axis for this module:** The reflective self is tested not in calm introspection but in moments where knowing yourself costs something — where truth about who you are conflicts with who you want to be.

---

## 1. Game Identity

**Name:** The Honest Mirror  
**Core loop:** Player faces branching scenarios where each choice reveals something about their self-concept — and where the "comfortable" choice and the "self-honest" choice diverge. The game tracks not which choice is "right" but whether choices are consistent with stated self-concept or reveal unexamined contradictions.  
**Feel:** Narrative vignettes with weight. Each scenario is a small identity crisis — not dramatic, but quietly confrontational. The player is never told they chose "wrong."

## 2. Catalyst Delivery

**Catalyst type:** Identity-coherence pressure — scenarios designed to expose gaps between self-concept and actual choice behaviour.  
**DA surfacing:** Scenarios where self-improvement conflicts with self-acceptance. The Self-Optimizer always chooses "grow" even when the scenario rewards resting. They cannot choose "I'm fine as I am" even when it's the self-honest answer.  
**DAll surfacing:** Scenarios requiring self-examination to resolve. The Unexamined chooses based on role-expectations or external cues rather than internal reference. Their choices show no self-model — only social scripts.  
**GA surfacing:** Scenarios where commitment is required. The Premature Process-Self refuses to choose, reframes every dilemma as "both/and," or selects the most "complex" option regardless of personal truth.  
**GAll surfacing:** Scenarios where identity-revision would serve the player. The Fixed Self chooses consistency over truth — maintaining self-image even when the scenario makes its cost visible.  
**Drive probes:** Agency = choosing based on internal reference vs. external pressure. Communion = incorporating relational data into self-knowledge. Eros = choosing growth when it means admitting ignorance about self. Agape = choosing self-acceptance when it means releasing a flattering self-image.

## 3. Game Design

**Scenario structure:** Each scenario presents a situation, establishes what the player has previously claimed about themselves (drawn from language-reflective and deterministic data), then offers 3–4 choices mapping to different self-concept stances.  
**Coherence tracking:** The system maintains a model of the player's stated identity and flags choices that contradict it — not as errors, but as data points. Accumulated contradictions become future scenario seeds.  
**Escalation:** Early scenarios are low-stakes identity questions. Mid-game introduces scenarios where self-knowledge has real (in-game) consequences. Late-game presents scenarios where the player must choose between self-image and evidence from their own gameplay history.  
**No right answers:** Every choice is valid. The diagnostic signal is the *pattern* — which shadow quadrant do choices consistently serve?  
**Shadow-mode:** Scenarios specifically constructed to make the dominant shadow's choice maximally attractive and its cost maximally visible.

## 4. Item Pool

| Item category | Examples | What it measures |
|---|---|---|
| Self-acceptance dilemmas | "You failed at X. Do you: analyse why / accept it / reframe it / ignore it?" | DA vs. healthy acceptance |
| Introspection invitations | "A friend says you seem different. Do you: examine it / dismiss it / deflect / explore?" | DAll vs. healthy reflection |
| Commitment scenarios | "You must choose one path. Do you: commit / hedge / reframe as both / refuse?" | GA vs. healthy authorship |
| Revision opportunities | "Evidence contradicts your self-view. Do you: revise / defend / contextualise / ignore?" | GAll vs. healthy flexibility |
| Cross-drive scenarios | Scenarios requiring two drives simultaneously | Drive integration |

Scenarios are generated from templates with player-specific variables drawn from gameplay history.

## 5. Technical Requirements

**Cross-module data:** Requires stated self-concept data from language-reflective and prediction data from deterministic to generate personalised coherence-testing scenarios.  
**Branching engine:** Scenario trees with 3–4 branches per node, 2–3 nodes deep. Each terminal node maps to a shadow-quadrant × drive-health score.  
**Scoring:** Primary metric = self-coherence (do choices match stated self-concept?). Secondary = shadow-pattern consistency (which quadrant do contradictions serve?). Tertiary = revision-willingness (does the player update self-concept after confrontation?).  
**Session length:** 12–18 minutes. 3–4 full scenarios per session.  
**Adaptive difficulty:** Scenario emotional intensity scales with player's demonstrated capacity for self-confrontation. Never exceeds the player's window of tolerance.
