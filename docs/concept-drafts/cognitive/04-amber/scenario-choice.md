# Cognitive / Amber — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes cognitive intelligence through RULE-BASED DECISIONS — dilemmas where the player must apply rules to situations. At Amber, this is: "The code says X. The situation is Y. What do you do? Which rule applies? What happens when two rules conflict?"
>
> **Why this axis for Cognitive/Amber:** Concrete operational thinking includes APPLYING rules to situations — not just following them in isolation but deciding WHICH rule applies WHEN. This modality tests whether the player can navigate rule-governed decisions, revealing rigidity vs. flexibility.

---

## 1. Game Identity

- **Title:** "The Code's Dilemma"
- **Core mechanic:** The player faces situations where rules must be APPLIED — sometimes clearly, sometimes ambiguously, sometimes in conflict. Rule-application dilemmas: "The code says honour your elder. The code says speak truth. Your elder speaks falsehood. What does the code require?"
- **Duration:** 3–5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Clear Code → The Applied Rule → The Two Rules → The Edge Case → The Living Judge

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** Rule-governed dilemmas — situations where the player must decide WHICH rule applies, not just whether to follow rules. The contact boundary is: "Can you apply rules to situations with cognitive flexibility?"

**How it differs from the other 6:** Other modalities test rule-knowledge (pattern), rule-sequencing (puzzle), or rule-memory (recall). Scenario-choice tests rule-APPLICATION — the judgment of which rule fits which situation, and what to do when rules conflict.

**What it uniquely surfaces:** Rigidity (always applies first rule), rule-breaking (ignores code entirely), premature abstraction (invents meta-rules to bypass concrete application), and complexity-avoidance (refuses edge cases).

**Successful integration:** The player can apply rules to complex situations — the decision-making foundation of concrete operational thought.

---

## 3. Game Design

### Setup
A judgment-hall where situations are presented and the player must apply the code. Scenarios appear as illuminated scenes; the code's rules are visible on the walls. Aesthetic: Amber-stage court — a hall of judgment with the code inscribed in stone, situations presented as living tableaux.

### Interaction Phases
- **The Clear Code (1–5):** Simple rule-application. One rule, one situation, clear fit.
- **The Applied Rule (5–15):** Multiple rules available; choose which applies.
- **The Two Rules (15–30):** Rule-conflict. Two rules both apply but point different ways.
- **The Edge Case (30–50):** Ambiguous situations where no rule clearly fits.
- **The Living Judge (50+):** Full integration: clear + selective + conflicting + ambiguous.

### Feedback
- Contextual application → "Well judged. The right rule for the right moment."
- Rigid application → "Look again. Does that rule FIT here? Which one serves THIS moment?"
- Rule-ignoring → "The code is here. Which rule speaks to this situation?"
- Meta-bypass → "Not the principle. The RULE. Which specific rule applies?"
- Complexity-avoidance → "Two rules. Both real. Just see both. Both are true here."

### Difficulty Adaptation
- Clarity: obvious fit → multiple options → conflicting rules → ambiguous
- Rules available: 2 → 3–4 → 5+ (more to choose from)
- Context complexity: simple situation → multi-factor → competing needs
- Social pressure: solo judgment → others disagree → authority disagrees
- Stakes: low-consequence → moderate → high-consequence dilemmas

### Progression Table
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Clear Code | 1–5 | Simple one-rule application |
| The Applied Rule | 5–15 | Selecting from multiple rules |
| The Two Rules | 15–30 | Navigating rule-conflict |
| The Edge Case | 30–50 | Handling ambiguity |
| The Living Judge | 50+ | Full rule-application integration |

---

## 4. Item Pool

| Type | Pool size | Description |
|---|---|---|
| Clear-fit scenarios | 20+ | One rule obviously applies (warm-up) |
| Selection scenarios | 20+ | Multiple rules; player selects correct one |
| Conflict scenarios | 15+ | Two+ rules both apply but conflict |
| Edge-case scenarios | 10+ | No rule clearly fits; reason from code-spirit |
| Social-pressure scenarios | 10+ | Others advocate different rule-application |

---

## 5. Technical Requirements

- **Inputs:** Tap/select (choose which rule applies); text/voice (explain reasoning — optional); drag (match rule to situation)
- **Timing:** Decision latency tracked; no time pressure; deliberation time noted (very fast = impulsive; very slow = frozen)
- **NPC/AI:** Scenario generation (varying rule-applicability); rule-conflict system; response evaluation; difficulty adaptation (clarity, complexity, social pressure)
- **LLM level:** Medium — scenario generation, response evaluation, contextual sensitivity assessment. Core rule-matching partially algorithmic; nuanced scenarios require LLM.
- **State persistence:** Decision history; accuracy per scenario-type; rigidity indicators; flexibility metrics; conflict-navigation quality; checkpoint position
