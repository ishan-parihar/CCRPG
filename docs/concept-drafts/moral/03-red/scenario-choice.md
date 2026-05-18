# Moral / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes moral intelligence through DILEMMAS — situations where the player must CHOOSE between competing moral options. At Red, these are not sophisticated ethical dilemmas — they are CONSEQUENCE dilemmas: "Take the gold and risk the guard, or leave it and stay safe?" The choice reveals moral structure.
>
> **Why this axis for Moral/Red:** Deterministic measures whether you CAN calculate consequences. Language-reflective measures whether you can ARTICULATE them. Scenario-choice measures what you DO when consequences compete. This is moral WISDOM at Red: choosing well when multiple self-interests conflict.

---

## 1. Game Identity

- **Title:** "The Bandit-Lord's Bargain"
- **Core mechanic:** The player faces consequence-dilemmas — situations where multiple self-interested options compete. Each choice reveals moral structure: risk tolerance, time-horizon, exploitation tendency, fairness capacity.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Binary Consequences → Competing Rewards → Risk/Reward Dilemmas → Reciprocity Dilemmas → The Bandit-Lord's Bargain

---

## 2. Catalyst Delivery

**Catalyst:** "Two paths. Both serve you. But differently. Which do you choose?" The contact boundary is: "What is your moral STRUCTURE when consequences compete?"

**Unconscious response:**
- *Submergent:* The player's choice-pattern reveals their shadow. Always-exploit (Predator). Never-choose (Paralysed). Always-sacrifice (Premature Saint). Always-dismiss (Cynic).
- *Emergent:* Can they hold competing consequences in mind and choose WISELY? Can they delay gratification? Can they engage reciprocity?

**Integration path:** Rewards CONTEXTUAL moral choice — not always the same answer, but the RIGHT answer for the situation. Rigid patterns (always X) are diagnostic of shadow.

**Successful integration:** The player makes contextually appropriate moral choices — sometimes taking, sometimes giving, sometimes waiting — based on accurate consequence-calculation.

---

## 3. Game Design

### Setup
The Bandit-Lord's Bargain: a Red-stage world of deals, trades, and competing interests. The player faces consequence-dilemmas presented by NPCs (the Bandit-Lord, the Merchant, the Rival, the Ally). Each dilemma has clear consequences — no hidden information at early levels. The aesthetic: Red-stage trading post, war-camp negotiation, the deal-making of power.

### Interaction
- **Binary Consequences (1-5):** "Take the gold (risk guard) or leave it (stay safe)." Simple risk/reward.
- **Competing Rewards (5-15):** "Take gold now OR take more gold later." Delayed gratification.
- **Risk/Reward Dilemmas (15-30):** "High risk/high reward OR low risk/low reward." Risk tolerance.
- **Reciprocity Dilemmas (30-50):** "Help them now (cost to you) and they help you later (uncertain)." Trust and exchange.
- **The Bandit-Lord's Bargain (50+):** Complex multi-party dilemmas with competing consequences, uncertain outcomes, and relational stakes.

### Feedback
- Contextual choice → "You read the situation. That was the right choice FOR THIS MOMENT."
- Rigid exploitation → "You always take. But the well runs dry. What then?"
- Rigid sacrifice → "You always give. But you're empty now. Who helps the helper?"
- Rigid avoidance → "You didn't choose. But not-choosing IS a choice. And it cost you."
- Rigid dismissal → "You said it doesn't matter. But you lost. It mattered."

### Difficulty Adaptation
- Options: 2 → 3 → 4; Consequence visibility: fully visible → partially hidden → uncertain
- Time horizon: immediate → short-delay → long-delay
- Relational complexity: solo → dyadic → multi-party
- Stakes: low → medium → high

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Binary Consequences | 1-5 | 2 options, immediate, fully visible |
| Competing Rewards | 5-15 | Delayed gratification; time-horizon choices |
| Risk/Reward Dilemmas | 15-30 | Probabilistic outcomes; risk tolerance |
| Reciprocity Dilemmas | 30-50 | Trust, exchange, relational consequences |
| The Bandit-Lord's Bargain | 50+ | Multi-party, uncertain, high-stakes |

---

## 4. Item Pool

### Item types
- **Risk/reward dilemmas:** Clear trade-offs between safety and gain
- **Delayed-gratification dilemmas:** Now vs. later
- **Reciprocity scenarios:** Help now for uncertain future return
- **Multi-party dilemmas:** Competing interests from multiple NPCs
- **Exploitation-vs-sustainability scenarios:** Take all now vs. maintain the source

### Minimum pool size
- 30+ binary, 25+ competing-reward, 20+ risk/reward, 15+ reciprocity, 10+ multi-party

### Drive/shadow mapping
- Always-exploit → dark-addiction; never-choose → dark-allergy
- Always-sacrifice → golden-addiction; random/dismissive → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (choose option); hold-to-examine (inspect consequences before choosing); swipe (reject/accept in rapid dilemmas)

### Timing requirements
- Decision latency measured (diagnostic); no time pressure at early levels; time-limited at advanced levels (to prevent over-analysis)

### NPC/AI requirements
- Dilemma-presenting NPCs with consistent personalities (Bandit-Lord = exploitation; Merchant = fair trade; Rival = competition; Ally = reciprocity)
- NPCs must REMEMBER past choices and adjust offers accordingly
- Consequences must PLAY OUT visibly after choice

### LLM requirements
- **High:** Scenario generation, contextual choice evaluation, pattern analysis. Dilemma construction requires narrative quality. Choice-tracking algorithmic.

### State persistence
- Choice history (full pattern); exploitation rate; sacrifice rate; avoidance rate; dismissal rate; risk tolerance profile; reciprocity engagement; consequence-prediction accuracy; drive/shadow signals; fatigue state; checkpoint position
