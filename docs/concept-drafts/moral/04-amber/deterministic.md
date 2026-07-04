# Moral / Amber — Deterministic Game Concept

> **Axis:** Objective moral reasoning measurement — rule-application accuracy, guilt-response latency, vow-consistency across time.  **Why this axis for this module:** Conventional morality's core is internalised rule-following; deterministic mechanics isolate this from language, body, or social confounds.

---

## 1. Game Identity

**Title:** The Oath Ledger
**Core Mechanic:** Player receives a moral code (set of rules), then faces sequences of situations requiring rule-application. Accuracy, response time, guilt-markers on violation, and vow-consistency across sessions are measured deterministically.
**Duration:** 4-8 minutes per session, infinite checkpoint.
**Internal Progression:** Simple binary rules → compound rules with priority → rules that conflict with personal gain → rules maintained across sessions (vow-persistence).

## 2. Catalyst Delivery

**Unique Presentation:** Abstract symbolic situations — icons representing actions, outcomes, and code-violations. No narrative framing, no language production, no social context. Pure rule→situation→judgment.
**Differs From Others:** No verbal articulation (language-reflective), no dilemma framing (scenario-choice), no body involvement (embodied-somatic), no planning horizon (strategic), no group dynamics (social), no free-play (immersive).
**Uniquely Surfaces:** DA through perfect compliance + zero-tolerance patterns; DAll through rule-ignoring + absent guilt-response; GA through applying "higher principles" that override the given code; GAll through rote compliance without engaging reasoning items.
**Successful Integration:** Player follows the code accurately, shows appropriate guilt-latency on violation, maintains vows across sessions, AND can engage with ambiguous items without rigidity or dismissal.

## 3. Game Design

**Setup:** Player is presented with "The Code" — 3-7 moral rules expressed as symbolic if→then statements. Rules are memorised, then situations begin.

**Interaction Phases:**
1. **Code Reception** — Absorb and internalise the rule-set (encoding)
2. **Clear Application** — Situations with unambiguous rule-matches (baseline)
3. **Compound Judgment** — Situations requiring multiple rules simultaneously (complexity)
4. **Cost Application** — Following the rule costs the player points/resources (commitment)
5. **Vow Persistence** — Rules from previous sessions must still be honoured (temporal consistency)

**Feedback Examples:**
1. Correct rule-application → subtle resonance tone, code-symbol glows
2. Rule violation → guilt-marker appears (player cannot dismiss it immediately — latency measured)
3. Consistent vow-keeping across sessions → oath-chain grows visibly
4. Rigid over-application to ambiguous items → code-symbol cracks (too brittle)
5. Rule-ignoring pattern → code fades from view (not internalised)

**Difficulty Adaptation:** Rule-set complexity scales with demonstrated capacity. Ambiguity introduced only after baseline competence. Cost-magnitude adapts to player's commitment threshold.

**Internal Progression Table:**

| Level | Rule Complexity | Ambiguity | Personal Cost | Vow Span |
|---|---|---|---|---|
| 1 | 3 binary rules | None | None | Within-session |
| 2 | 5 compound rules | Low | Low | 2 sessions |
| 3 | 7 prioritised rules | Medium | Medium | 5 sessions |
| 4 | 7+ conflicting rules | High | High | Persistent |

## 4. Item Pool

**Rule Types (20+):** Protect the weak, honour agreements, speak truth, share resources, maintain hierarchy, respect elders, keep secrets, punish betrayal, forgive the repentant, attend rituals, defend the group, obey authority, maintain purity, honour debts, keep promises, respect boundaries, serve the community, uphold tradition, witness for others, maintain order.

**Situation Types (25+):** Resource allocation, promise-keeping tests, authority conflicts, loyalty tests, truth-telling costs, group-vs-individual, tradition-vs-efficiency, mercy-vs-justice, duty-vs-desire, secret-keeping under pressure, hierarchy challenges, ritual obligations, debt-honour scenarios, boundary violations by others, community service demands, purity tests, forgiveness opportunities, punishment decisions, witnessing obligations, order-maintenance, elder-respect conflicts, agreement-honouring costs, betrayal-response, repentance-recognition, tradition-preservation.

**Cost Categories (15+):** Point loss, resource depletion, status reduction, time penalty, opportunity cost, comfort reduction, advantage forfeiture, alliance strain, progress delay, reputation risk, energy expenditure, position loss, reward forfeiture, path closure, capability restriction.

**Guilt-Response Items (15+):** Violation acknowledgment, repair action selection, guilt-duration tolerance, self-forgiveness timing, recommitment speed, shame-vs-guilt discrimination, proportional response, confession impulse, hiding impulse, blame-deflection, minimisation, rationalisation, genuine remorse, repair-action quality, vow-renewal.

**Ambiguity Items (15+):** Two rules conflict, rule spirit vs letter, novel situation (no rule applies), disproportionate consequence, authority violates code, group overrides rule, rule from different context, partial violation, accidental violation, coerced violation, violation to prevent greater violation, interpretation disagreement, edge-cases, temporal conflicts, competing loyalties.

## 5. Technical Requirements

**Input Types:** Tap/click selection (binary and multiple-choice), timed responses, drag-to-prioritise.
**Timing:** Response latency measured per item (guilt-response window: 500ms-3000ms). Session-to-session vow-tracking requires persistent state.
**NPC/AI:** None — purely abstract symbolic interactions.
**LLM:** None — all items pre-authored and deterministically scored.
**State Persistence:** Vow-registry (rules accepted across sessions), guilt-response history, rule-application accuracy trends, oath-chain length, shadow-signal accumulation.
