# Spiritual / Red — Deterministic Game Concept

> **Axis:** The deterministic axis provides OBJECTIVE measurement of spiritual capacity — does the player's behaviour show value-coherence? Do their actions align with their stated values? This is the ground-truth anchor: not what they SAY matters, but what their BEHAVIOUR reveals matters.
>
> **Why this axis for Spiritual/Red:** Spiritual intelligence is uniquely vulnerable to performance. Anyone can SAY "I value honour." The deterministic modality measures whether behaviour DEMONSTRATES value-coherence — do they actually ACT in alignment with stated values when it costs them?

---

## 1. Game Identity

- **Title:** "The Value-Reader"
- **Core mechanic:** The player states their primary value, then faces situations where acting on that value has a COST. The game measures whether behaviour aligns with stated value — pure behavioural coherence scoring.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Declaration → The Cost → The Conflict → The Sustained Hold → The Living Value

---

## 2. Catalyst Delivery

**Catalyst:** "You said X matters most. Now X costs you something. Do you still choose X?" The contact boundary is: "Is your value REAL — does it survive pressure?"

**Unconscious response:**
- *Submergent:* The gap between stated value and actual behaviour surfaces. Zealot invokes value aggressively. Nihilist has no value to test. Premature Mystic states abstract values that don't predict behaviour. Sacred-Refuser states value then abandons it.
- *Emergent:* Can they maintain value-coherence under increasing cost?

**Integration path:** Rewards BEHAVIOURAL value-coherence. Not eloquence about values but ACTING on them when it costs. A simple "I value winning" that's consistently demonstrated scores higher than an elaborate "I value honour" that's violated under pressure.

**Successful integration:** The player's stated value predicts their behaviour under pressure. Value-coherence is demonstrated, not just claimed.

---

## 3. Game Design

### Setup
The Value-Reader: a behavioural coherence game. The player declares a value, then faces situations where maintaining that value has varying costs. The game measures whether behaviour aligns with declaration. The aesthetic: Red-stage oath-taking — the warrior declares before the war-band, then must LIVE the oath.

### Interaction
- **The Declaration (1-5):** State your primary value. Face one low-cost situation. Does behaviour match?
- **The Cost (5-15):** Value-maintenance now costs something (reward sacrificed, effort required).
- **The Conflict (15-30):** Two values compete. Which wins? Is the priority consistent?
- **The Sustained Hold (30-50):** Maintain value-coherence across 5+ decisions with escalating cost.
- **The Living Value (50+):** Full value-coherence ecology — declaration, cost, conflict, sustained hold, all demonstrated.

### Feedback
- Value-coherent → "You said it mattered. You proved it. Your oath holds."
- Value-violated → "You said honour. You chose reward. The oath broke. Which is true?"
- No value → "You declared nothing. Your actions had no direction. Name something. Anything."
- Abstract → "You said 'unity.' What does that LOOK like? What did you DO differently?"

### Difficulty Adaptation
- Cost level: zero → low → moderate → high → extreme
- Conflict complexity: single value → binary conflict → multi-value priority
- Sustained duration: 1 decision → 3 → 5 → session-long
- Temptation intensity: mild → moderate → severe

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Declaration | 1-5 | State value; low-cost coherence test |
| The Cost | 5-15 | Value-maintenance with sacrifice |
| The Conflict | 15-30 | Competing values; priority testing |
| The Sustained Hold | 30-50 | Extended coherence under escalating cost |
| The Living Value | 50+ | Full value-coherence ecology |

---

## 4. Item Pool Specification

### Item types
- **Low-cost coherence tests:** Situations where value-maintenance is easy
- **Sacrifice scenarios:** Maintaining value costs reward/power/safety
- **Value-conflict scenarios:** Two values compete; must prioritise
- **Sustained-hold sequences:** Multiple decisions requiring consistent coherence
- **Temptation scenarios:** High reward for value-violation

### Minimum pool size
- 30+ low-cost, 25+ sacrifice, 20+ conflict, 15+ sustained-hold, 10+ temptation

### Drive/shadow mapping
- Aggressive coherence → dark-addiction; zero coherence → dark-allergy
- Abstract value + no coherence → golden-addiction; commit-then-abandon → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (value declaration from options or free-text); tap-to-choose (action selection in value-testing scenarios)

### Timing requirements
- No millisecond precision; value-coherence measured at decision level
- Cross-session tracking essential for sustained-hold and stability

### NPC/AI requirements
- Scenario system that presents value-testing situations with calibrated costs
- Temptation system with escalating rewards for value-violation
- Conflict system that pits declared values against each other

### LLM requirements
- **Low:** Contextual framing and feedback narration. All scoring is algorithmic (declared value vs. action alignment).

### State persistence
- Declared value history; value-coherence rates per session; cost-tolerance curves; priority patterns; sustained-hold records; cross-context coherence; value-stability across sessions; drive/shadow signals; fatigue state; checkpoint position
