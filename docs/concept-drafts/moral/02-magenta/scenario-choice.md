# Moral / Magenta — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes moral intelligence through DECISIONS — can the player choose the sacred action? At Magenta, this is proto-dilemma: "The spirit offers a bargain. Do you accept? The taboo path is shorter. Do you take it?" Moral choice through magical consequence.
>
> **Why this axis for Moral/Magenta:** Before rational moral reasoning (Orange+) or egocentric calculation (Red), moral choice is MAGICAL — "if I take the forbidden path, something bad will happen." This modality tests whether the player can make moral choices guided by sacred sensing.

---

## 1. Game Identity

- **Title:** "The Sacred-Path"
- **Core mechanic:** The player faces proto-dilemmas where one path honours the sacred and another violates it. Not rational trade-offs — MAGICAL moral choices. "The trickster offers a shortcut through the forbidden grove. Do you take it?" Choice guided by sacred sensing, not calculation.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Forbidden-Path → The Trickster's Offer → The Two-Sacreds → The Hidden-Cost → The Moral Heart

---

## 2. Catalyst Delivery

**Catalyst:** "Two paths. One honours the sacred. One violates it but offers something. Which do you choose? Not because of rules — because of what you SENSE." The contact boundary is: "Can you choose based on sacred sensing?"

**Unconscious response:**
- *Submergent:* How does the player choose? The Taboo-Slave cannot choose (both paths might be wrong). The Profane-Breaker chooses by convenience (no sacred weight sensed). The Premature Rule-Maker applies rules ("the rule says this one"). The Ritual-Refuser senses the sacred path but takes the other.
- *Emergent:* Can they choose based on genuine sacred sensing — neither paralysed nor blind nor mechanical nor refusing?

**Integration path:** Rewards SACRED-GUIDED CHOICE — choosing based on genuine moral sensing. Not paralysis, not convenience, not rules, not refusal.

**Successful integration:** The player makes moral choices guided by felt sacred weight — the foundation of all moral decision-making.

---

## 3. Game Design

### Setup
The Sacred-Path: a moral choice space. Paths diverge. One honours the sacred; one violates it. The player chooses. The aesthetic: Magenta-stage crossroads — a fork in a magical forest. One path glows faintly with sacred light; the other is convenient but dark.

### Interaction
- **The Forbidden-Path (1-5):** Clear binary → sacred path vs. forbidden path. High contrast.
- **The Trickster's Offer (5-15):** Trickster offers shortcut through taboo → accept or refuse?
- **The Two-Sacreds (15-30):** Both paths have sacred weight → which is MORE sacred? Discrimination.
- **The Hidden-Cost (30-50):** Sacred path has a cost → choose sacred despite cost?
- **The Moral Heart (50+):** Full moral choice: ambiguous + costly + novel + shared.

### Feedback
- Sacred-guided choice → "You honoured it. The sacred path. You felt it and you chose it."
- Paralysis → "It's safe. Just this one. Which feels sacred? Trust your sensing. Choose."
- Convenience → "Feel again. Not which is easier. Which has WEIGHT. Which matters."
- Rule-based → "Not because it's 'right.' Because you FEEL it. Which path has weight in you?"
- Refusal → "You knew. You felt it. What would happen if you honoured that? Just once."

### Difficulty Adaptation
- Moral contrast: high (obvious sacred/profane) → moderate → subtle
- Cost: no cost → small cost → significant cost for sacred path
- Ambiguity: clear → moderate → both-sacred dilemmas
- Novelty: familiar moral territory → novel dilemmas
- Complexity: binary → multiple paths → sequential choices

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Forbidden-Path | 1-5 | Clear binary (high contrast) |
| The Trickster's Offer | 5-15 | Temptation (shortcut through taboo) |
| The Two-Sacreds | 15-30 | Discrimination (which is MORE sacred?) |
| The Hidden-Cost | 30-50 | Sacred choice with cost |
| The Moral Heart | 50+ | Full moral choice integration |

---

## 4. Item Pool Specification

### Item types
- **Clear dilemmas:** Obvious sacred vs. profane (high contrast)
- **Temptation dilemmas:** Profane path offers tangible benefit
- **Discrimination dilemmas:** Both paths sacred; choose the MORE sacred
- **Cost dilemmas:** Sacred path requires sacrifice
- **Novel dilemmas:** Unfamiliar moral territory

### Minimum pool size
- 25+ clear, 20+ temptation, 15+ discrimination, 15+ cost, 10+ novel

### Drive/shadow mapping
- Paralysis/no-choice → dark-addiction; convenience-choice → dark-allergy
- Rule-based choice → golden-addiction; sensing-then-refusing → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-choose (path selection); swipe (direction); hold (deliberation indicator)

### Timing requirements
- Choice latency tracked (hesitation = data); deliberation time; no time pressure

### NPC/AI requirements
- Dilemma generation system (sacred/profane paths with varying contrast)
- Trickster NPC (offers temptation)
- Consequence system (sacred choice → reward; profane → cost)
- Difficulty adaptation (contrast, cost, ambiguity)

### LLM requirements
- **Medium:** Dilemma generation, felt-sense vs. rule-based assessment, novel dilemma creation. Core choice-alignment partially algorithmic.

### State persistence
- Choice-alignment rates; felt-sense indicators; cost-tolerance scores; discrimination quality; consistency across sessions; paralysis indicators; convenience indicators; rule-based indicators; refusal indicators; drive/shadow signals; fatigue state; checkpoint position
