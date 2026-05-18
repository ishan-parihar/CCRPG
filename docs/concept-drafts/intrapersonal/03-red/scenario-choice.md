# Intrapersonal / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes self-knowledge through DILEMMAS THAT REQUIRE SELF-KNOWLEDGE TO RESOLVE — situations where the "right" choice depends on knowing yourself. At Red, this means: "Do you know what you actually want? Do you know what you'll actually do under pressure?"
>
> **Why this axis for Intrapersonal/Red:** Some situations can only be navigated by someone who KNOWS THEMSELVES. The warrior who doesn't know his fear walks into traps. The warrior who doesn't know his rage loses control. This modality tests whether self-knowledge is FUNCTIONAL — does it guide choice?

---

## 1. Game Identity

- **Title:** "The Self-Knower's Dilemma"
- **Core mechanic:** The player faces dilemmas where the optimal choice depends on accurate self-knowledge. "Which path suits YOUR strengths?" "Which challenge will YOU handle better?" The game tests whether self-knowledge GUIDES decision-making.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Know Your Strength → Know Your Weakness → Know Your Pattern → Know Your Edge → The Self-Knower's Choice

---

## 2. Catalyst Delivery

**Catalyst:** "Two paths. One requires strength you may or may not have. One requires patience you may or may not have. Which do you choose — and WHY?" The contact boundary is: "Does your self-knowledge actually GUIDE your choices?"

**Unconscious response:**
- *Submergent:* How does self-knowledge (or its absence) affect choice? The Narcissist chooses based on fantasy-self. The Unexamined chooses randomly. The Premature Witness over-analyses. The Identity-Clinger always chooses the identity-confirming path.
- *Emergent:* Can they use self-knowledge to make BETTER choices? Can they choose paths that match their actual (not imagined) capacity?

**Integration path:** Rewards choices that MATCH actual capacity. Choosing the strength-path when you're actually strong = good. Choosing the strength-path when you're actually weak (because you THINK you're strong) = diagnostic.

**Successful integration:** The player's choices reflect accurate self-knowledge — they choose paths that match their demonstrated capacity, avoid paths that exceed it, and grow by choosing paths at their genuine edge.

---

## 3. Game Design

### Setup
The Self-Knower's Dilemma: a branching path where each fork requires self-knowledge to navigate optimally. The player must know their actual strengths, weaknesses, patterns, and edges to choose well. The aesthetic: Red-stage crossroads — the warrior at the fork, choosing which battle to fight based on self-knowledge.

### Interaction
- **Know Your Strength (1-5):** Binary dilemmas: "Path A requires strength. Path B requires speed. Which are you better at?" Verified against demonstrated capacity.
- **Know Your Weakness (5-15):** Dilemmas requiring admission of limitation: "This path will test your patience. Can you handle it honestly?"
- **Know Your Pattern (15-30):** Dilemmas where past patterns predict success: "Last time you faced this, you did X. Will you do X again?"
- **Know Your Edge (30-50):** Dilemmas at the boundary of self-knowledge: "You've never faced this. What do you THINK you'll do?"
- **The Self-Knower's Choice (50+):** Complex dilemmas requiring integrated self-knowledge across multiple dimensions.

### Feedback
- Self-knowledge-guided success → "You knew yourself. You chose right. That's wisdom."
- Fantasy-guided failure → "You chose the warrior's path. But you're not that warrior yet. Know your truth."
- Random choice → "You didn't ask yourself. Next time — one question before you choose: 'What am I?'"
- Over-analysis → "You knew the answer 30 seconds ago. Trust your self-knowledge. Act."

### Difficulty Adaptation
- Dilemma complexity: binary → multi-path → compound
- Self-knowledge demand: obvious strengths → subtle patterns → edge-of-knowledge
- Consequence weight: low stakes → moderate → high
- Time pressure: unlimited → generous → moderate (never punishing)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Know Your Strength | 1-5 | Binary capacity-matching; obvious strengths |
| Know Your Weakness | 5-15 | Limitation-admission; honest self-assessment |
| Know Your Pattern | 15-30 | Pattern-based prediction; historical self-knowledge |
| Know Your Edge | 30-50 | Novel situations; uncertainty management |
| The Self-Knower's Choice | 50+ | Integrated multi-dimensional self-knowledge |

---

## 4. Item Pool Specification

### Item types
- **Capacity-matching dilemmas:** Choose path based on actual strength/weakness
- **Limitation-admission dilemmas:** Optimal path requires admitting weakness
- **Pattern-prediction dilemmas:** Past behaviour predicts optimal choice
- **Edge-of-knowledge dilemmas:** Novel situations requiring self-knowledge extrapolation
- **Identity-expansion dilemmas:** Optimal path contradicts current identity

### Minimum pool size
- 30+ capacity-matching, 20+ limitation-admission, 20+ pattern-prediction, 15+ edge-of-knowledge, 10+ identity-expansion

### Drive/shadow mapping
- Fantasy-based choices → dark-addiction; random choices → dark-allergy
- Over-analysis without action → golden-addiction; rigid identity-confirming → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (path choice); optional text (reasoning); timing (deliberation duration)

### Timing requirements
- Deliberation time tracked (diagnostic for over-analysis); no punishing time pressure at early levels; moderate time limits at advanced levels

### NPC/AI requirements
- Path-outcome system (chosen path produces success/failure based on capacity match)
- Ally NPC for joint-decision dilemmas
- Historical capacity data for pattern-prediction dilemmas

### LLM requirements
- **High:** Scenario generation, dilemma construction, reasoning evaluation. Core scoring (choice vs. capacity alignment) algorithmic.

### State persistence
- Choice history + outcomes; capacity-alignment scores; limitation-awareness patterns; pattern-utilisation rates; identity-flexibility scores; deliberation time trends; drive/shadow signals; fatigue state; checkpoint position
