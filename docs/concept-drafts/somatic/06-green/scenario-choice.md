# Somatic / Green — Scenario-Choice Game Concept

> **Axis:** Somatic dilemmas where empathic sensitivity conflicts with self-care and boundaries.  **Why this axis for this module:** Green somatic capacity lives in the tension between feeling others and maintaining self — choice-points reveal whether the player dissolves, walls off, bypasses, or integrates.

---

## 1. Game Identity

**Name:** The Body's Dilemma
**Core loop:** Player faces scenarios where somatic empathy creates genuine tension — feel more and risk overwhelm, or protect and risk disconnection. Each choice reveals drive-balance and shadow-pattern.
**Feel:** Intimate vignettes — a friend in pain, a crowd's energy, a partner's unspoken distress. Quiet moral weight carried in the body.
**Session length:** 5–8 minutes per scenario cluster. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst type:** Branching somatic-relational dilemmas with no "correct" answer — only drive-revealing choices.
**Shadow surfacing:** DA surfaces as always choosing to feel more / stay merged / absorb others' pain. DAll surfaces as always choosing distance / performance / "handling it." GA surfaces as choosing cosmic framing over relational presence. GAll surfaces as choosing relational sensitivity but refusing any transpersonal opening.
**Drive probing:** Agency = choices that maintain somatic boundary. Communion = choices that deepen relational attunement. Eros = choices that risk new somatic territory. Agape = choices that ground and embody.

## 3. Game Design

**Mechanic 1 — Dilemma Presentation:** A somatic-relational scenario unfolds (text + body-state indicators). Player receives 3–4 response options, each mapping to a drive-pattern. No option is labelled; all are plausible.
**Mechanic 2 — Consequence Cascade:** Choice leads to a body-state outcome (shown as somatic feedback). Player then faces a follow-up choice that tests whether they can course-correct or double-down.
**Mechanic 3 — Integration Prompt:** After 3 scenarios, player is asked: "What pattern do you notice in your choices?" (optional reflection, LLM-scored if provided).
**Scenario types:**
- Boundary vs. Connection: "Your body is absorbing their grief. Do you stay present, create distance, or..."
- Self-care vs. Attunement: "You're depleted but they need co-regulation. Do you..."
- Depth vs. Safety: "A somatic opening is happening that feels unfamiliar. Do you..."
- Individual vs. Group: "The group's energy is pulling you. Do you merge, anchor, or..."
**Progression:** Dyadic scenarios → group scenarios → transpersonal-edge scenarios → compound dilemmas.

## 4. Item Pool

| Scenario type | Dilemma core | Shadows revealed |
|---|---|---|
| Boundary-Connection | Partner's pain is flooding your body | DA (merge) vs. DAll (wall) |
| Self-care-Attunement | Exhausted but someone needs you somatically | DA (sacrifice) vs. DAll (dismiss) |
| Depth-Safety | Unfamiliar transpersonal body-opening | GAll (refuse) vs. GA (perform) |
| Individual-Group | Group rhythm pulling you out of self | DA (dissolve) vs. Agency (anchor) |
| Return-after-merge | You've been deeply attuned; now come back | DA (can't return) vs. DAll (never left) |

Minimum pool: 40 scenarios across 5 types, 3 complexity tiers. Each scenario has 3–4 choice options with distinct drive-mappings. LLM generates adaptive follow-ups.

## 5. Technical Requirements

**Input:** Multiple-choice selection (3–4 options per dilemma), optional free-text reflection.
**Scoring engine:** Each choice maps to a drive-vector (Agency/Communion/Eros/Agape) and shadow-indicator (DA/DAll/GA/GAll). Pattern across scenarios yields drive-profile.
**LLM integration:** Optional reflection scoring (same rubric as language-reflective). Adaptive scenario selection based on emerging shadow-pattern.
**Telemetry:** Choice distribution across drives, shadow-pattern consistency, course-correction frequency, reflection depth (if provided).
**Scoring output:** Agency ← boundary-maintaining choices, Communion ← attunement-deepening choices, Eros ← depth-risking choices, Agape ← grounding/return choices. Shadow scores from pattern consistency.
**Session data:** 3–5 scenarios per session (9–15 choice-points). Minimum 2 sessions for stable pattern.
