# Cognitive / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes cognitive capacity through decision-making under uncertainty — branching choices with consequences, cost-benefit reasoning, and strategic trade-offs. This modality accesses the APPLIED dimension of cognition: not "can you solve a puzzle" but "can you THINK through a real decision."
>
> **Why this axis for Cognitive/Red:** At Red, decisions are egocentric and concrete: "What gets me what I want?" The player can reason about 2-step consequences but not systemic effects. Choice reveals cognitive structure — HOW they decide exposes whether they're planning or impulsing, whether they can hold two options simultaneously, whether they can project one step ahead.

---

## 1. Game Identity

- **Title:** "The Warlord's Gambit"
- **Core mechanic:** The player faces a series of tactical dilemmas in a Red-stage power context — resource allocation, alliance decisions, battle choices — where each option has concrete, visible 1-2 step consequences. The quality of reasoning (not just the choice) is assessed.
- **Duration:** 4-8 minutes per session (infinite checkpoints)
- **Internal progression:** Binary choices → Weighted trade-offs → Multi-option → Chained consequences → Adversarial reasoning

---

## 2. Catalyst Delivery

**Catalyst:** The game presents decisions where the "right" answer requires holding multiple factors in mind simultaneously. At Red, this means: "I want X, but getting X costs Y — is it worth it?" The contact boundary is the limit of how many factors the player can hold.

**Unconscious response:**
- *Submergent:* The player's decision-making structure surfaces. Do they over-analyse every choice (dark-addiction)? Decide impulsively without considering consequences (dark-allergy)? Choose based on what seems "smartest" rather than what they actually want (golden-addiction)? Refuse to engage with harder decisions (golden-allergy)?
- *Emergent:* The pull toward more sophisticated reasoning — can they hold one more factor? Can they project one step further?

**Integration path:** The game shows consequences of choices (immediate feedback). Good reasoning → good outcomes (in Red terms: more power, more resources, more control). The player learns that THINKING about decisions produces better results than impulsing.

**Successful integration:** The player makes decisions that demonstrate concrete-operational reasoning — holding 2 factors, projecting 1-2 steps, choosing based on actual cost-benefit rather than impulse or performance.

---

## 3. Game Design

### Setup
The player sits in a war-room with a tactical map. A "War-Council" of NPCs presents dilemmas. The aesthetic is Red-stage: battle-maps, resource tokens (gold, soldiers, weapons), territory markers. Every choice has VISIBLE, CONCRETE stakes.

### Interaction
- **Binary choices:** "Attack the fort (costs 20 soldiers, gains territory) or defend the pass (costs 10 soldiers, keeps current territory)?"
- **Weighted trade-offs:** "Spend 30 gold on weapons (attack +2) or 30 gold on walls (defense +3)? You have 50 gold total."
- **Multi-option:** "Three paths to the enemy: mountain (slow, safe), river (fast, risky), tunnel (unknown)."
- **Chained consequences:** "If you attack now, they'll counterattack tomorrow. If you wait, they'll fortify. If you negotiate, they might betray."
- **Adversarial reasoning:** "The enemy knows you're coming. What do they expect you to do? Do the opposite."

### Feedback
- Choice made → consequence shown immediately (concrete: +/- resources, territory, allies)
- Good reasoning → better outcomes (visible reward)
- Poor reasoning → worse outcomes (visible cost, but never catastrophic)
- Pattern: the game shows "what would have happened" for unchosen options (counterfactual learning)

### Difficulty Adaptation
- Number of factors to consider: 2 → 3 → 4
- Consequence chain length: 1-step → 2-step → 3-step
- Uncertainty: known outcomes → probabilistic → adversarial
- Time pressure: unlimited → generous → moderate (never punishing)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Binary Choices | 1-5 | 2 options, 1-2 visible factors, immediate consequences |
| Weighted Trade-offs | 5-15 | 2-3 options, quantified factors, 1-step consequences |
| Multi-Option | 15-30 | 3-4 options, multiple factors, some uncertainty |
| Chained Consequences | 30-50 | 2-3 step consequence chains, delayed outcomes |
| Adversarial Reasoning | 50+ | Opponent modelling, counter-strategy, meta-reasoning |

---

## 4. Item Pool

### Item types
- **Resource dilemmas:** Allocate limited resources between competing needs (gold, soldiers, time)
- **Alliance dilemmas:** Trust/betray/negotiate with NPCs who have their own interests
- **Battle dilemmas:** Tactical choices with concrete military consequences
- **Territory dilemmas:** Expand/defend/consolidate with visible map consequences
- **Succession dilemmas:** Power-structure choices (who leads, who follows, who's expelled)

### Minimum pool size
- 40+ binary choice scenarios (varied contexts)
- 30+ weighted trade-off scenarios
- 20+ multi-option scenarios
- 20+ chained-consequence scenarios
- 15+ adversarial reasoning scenarios

### Generation rules
- LLM generates scenarios within Red-stage constraints (concrete, egocentric, power-framed)
- All consequences must be VISIBLE and COUNTABLE (no abstract outcomes)
- Difficulty scales with: factor count, chain length, uncertainty level
- Scenarios reference the player's actual game state (resources, allies, territory)

### Drive/shadow mapping
- Solo vs. alliance choices → Agency probing
- Majority-visible choices → Communion probing
- Safe vs. risky choices → Eros probing
- Simple revisit choices → Agape probing
- Excessive deliberation on simple choices → dark-addiction signal
- Instant choice on complex scenarios → dark-allergy signal
- Abstract justification for concrete choices → golden-addiction signal
- Disengagement at higher complexity → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Choice selection (tap on option)
- Optional: text explanation of reasoning (for language-reflective cross-scoring)
- Drag-and-drop (for resource allocation variants)

### Timing requirements
- Decision time tracked (diagnostic, not punishing at early stages)
- Later stages introduce time pressure on tactical decisions
- No millisecond precision needed

### NPC/AI requirements
- War-Council NPCs: present dilemmas, react to choices, show consequences
- Adversary NPC: models opponent reasoning at higher checkpoints
- Advisor NPC: provides scaffolding for golden-allergy healing

### LLM requirements
- **Medium-High:** Scenario generation, reasoning evaluation, consequence narration
- Generates contextual dilemmas tied to player's game state
- Evaluates reasoning quality (concrete vs. abstract, proportional vs. excessive)
- Narrates consequences in Red-stage language

### State persistence
- Decision history (last 50 choices with reasoning and outcomes)
- Factor-integration capacity estimate (how many factors they reliably consider)
- Consequence-projection depth estimate (how far ahead they reason)
- Drive-health signals from choice patterns
- Shadow signals from decision-time and engagement patterns
- Resource/territory/alliance state (carries across sessions)
