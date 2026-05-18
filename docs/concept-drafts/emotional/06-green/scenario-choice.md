# Emotional / Green — Scenario-Choice Game Concept

> **Axis:** Empathic dilemmas where sensitivity conflicts with boundaries, or holding-many conflicts with acting-on-one.  **Why this axis for this module:** Green empathy's hardest test is action — when you feel everyone's perspective, choosing becomes the crucible that reveals whether empathy is integrated or paralysing.

---

## 1. Game Identity

**Title:** The Empathic Crucible  
**Core loop:** Player faces branching dilemmas where multiple characters have legitimate emotional needs that conflict. Every choice honours some perspectives and necessarily disappoints others. No "correct" answer — only the quality of empathic engagement with the choice.  
**Session length:** 5–8 minutes per dilemma (infinite checkpoint between dilemmas).  
**Progression:** Dilemma complexity increases — more stakeholders, more acute contradictions, higher personal cost, out-group perspectives introduced.

## 2. Catalyst Delivery

**Catalyst type:** Decisional-empathic under irreconcilable emotional claims.  
**Shadow surfacing:**
- DA surfaces as paralysis or people-pleasing — choosing whatever minimises others' pain regardless of self, or refusing to choose at all.
- DAll surfaces as rapid decisive action that dismisses emotional complexity — "someone has to decide; feelings aren't facts."
- GA surfaces as reframing the dilemma into a transpersonal narrative that avoids the particular pain — "in the bigger picture, all paths serve growth."
- GAll surfaces as rich empathic engagement followed by refusal to consider how the choice connects to larger patterns.

**Drive probing:** Agency via willingness to choose despite empathic cost; Communion via quality of relational consideration before choosing; Eros via engagement with growth-implications; Agape via care for concrete persons affected.

## 3. Game Design

**Mechanics:**
- **Stakeholder phase:** 3–6 characters present their emotional reality regarding a shared situation. Player can ask clarifying questions (limited to 3).
- **Holding phase:** Player must demonstrate they've understood all perspectives before choosing. Scored on perspective-completeness and non-reduction.
- **Choice phase:** Player selects an action. No option satisfies everyone. Scored NOT on which choice but on the empathic quality surrounding it.
- **Aftermath phase:** Consequences unfold. Player responds to disappointed parties. Scored on repair capacity, boundary maintenance, and emotional honesty.

**Scoring:** Perspective-completeness, holding-duration (time before collapsing into action), choice-coherence (integrated values vs. avoidance), aftermath-quality (repair without capitulation).

**Difficulty staircase:** Stakeholder count increases; emotional stakes escalate; out-group perspectives introduced; personal cost of choice increases; time pressure added at higher tiers.

## 4. Item Pool

- 60+ dilemma scenarios across relational contexts (family, community, workplace, cross-cultural, political)
- Each scenario: 3–6 stakeholder perspectives, 3–5 choice options, 2–4 aftermath branches
- Clarifying-question bank (player-selectable deepening prompts)
- Out-group scenarios (perspectives from unfamiliar cultural/value contexts)
- Escalation variants (same dilemma at increasing stakes)
- No "trick" scenarios — all perspectives are genuinely legitimate

## 5. Technical Requirements

- Branching narrative engine with state tracking across stakeholder relationships
- Holding-phase timer (measures time-to-choice without pressuring — longer = higher tolerance score up to ceiling)
- Aftermath consequence engine (choices propagate to future dilemmas within session)
- Scoring model: multi-dimensional, weighted by drive-health formula
- Shadow detection: paralysis-time > threshold + people-pleasing flags DA; rapid-choice + low-perspective-engagement flags DAll; reframing-language + avoidance-of-particular flags GA; rich-engagement + ceiling-refusal flags GAll
- Session persistence at dilemma boundaries
- Dilemma selection algorithm: adaptive to surfaced shadow patterns
