# Cognitive / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes cognitive capacity through RELATIONAL INTERACTION — coordinating with others, modelling others' thinking, and solving problems that require social cognition. This modality accesses the INTERPERSONAL dimension of cognition: not "can you think alone" but "can you think WITH and ABOUT others."
>
> **Why this axis for Cognitive/Red:** At Red, others are instruments — allies are tools, enemies are obstacles. But even egocentric social cognition requires COGNITIVE capacity: modelling what the other wants, predicting their behaviour, coordinating actions. This axis tests whether the player can apply their 2-step planning to SOCIAL situations — "If I do X, they will do Y."

---

## 1. Game Identity

- **Title:** "The War-Band"
- **Core mechanic:** The player leads a small war-band of NPC allies through tactical challenges that require coordinating cognitive tasks across multiple agents — assigning roles, predicting ally/enemy behaviour, and solving problems that no single mind can solve alone.
- **Duration:** 4-8 minutes per session (infinite checkpoints)
- **Internal progression:** Pair coordination → Squad tactics → Role assignment → Prediction games → Alliance negotiation

---

## 2. Catalyst Delivery

**Catalyst:** The game presents problems that CANNOT be solved alone — they require coordinating with others. The contact boundary is: "Can you model another mind well enough to coordinate action?" At Red, this is egocentric modelling: "What do THEY want? How can I use that?"

**Unconscious response:**
- *Submergent:* The player's relationship to social cognition surfaces. Do they try to control everything themselves (dark-addiction/agency)? Refuse to engage with others' thinking (dark-allergy)? Perform sophisticated social reasoning they don't have (golden-addiction)? Refuse to develop social-cognitive complexity (golden-allergy)?
- *Emergent:* The pull toward genuine perspective-taking — can they hold their OWN plan AND another's simultaneously?

**Integration path:** The game rewards EFFECTIVE coordination (not just solo performance). The player learns that modelling others' minds IS a cognitive skill — it requires the same working memory and planning capacity as solo tasks, applied to social space.

**Successful integration:** The player demonstrates social-cognitive capacity appropriate to Red: can model 1 other agent's simple motivations, can coordinate 2-step plans with an ally, can predict basic behaviour based on visible self-interest.

---

## 3. Game Design

### Setup
The player leads a war-band of 2-4 NPC allies. Each ally has visible traits (strong/fast/smart/sneaky) and visible motivations (gold/glory/loyalty/survival). The war-band faces challenges that require different combinations of abilities. The aesthetic: Red-stage war-camp, around a fire, planning raids.

### Interaction
- **Pair coordination:** "You and Krag must hit both switches at once. Signal when ready." (Timing coordination)
- **Squad tactics:** "Assign roles: who breaches, who covers, who flanks?" (Role assignment based on ally traits)
- **Prediction games:** "Krag wants gold. The chest is trapped. What will Krag do?" (Social modelling)
- **Alliance negotiation:** "Krag wants the gold. You want the weapon. The chest has both. Negotiate." (Social problem-solving)
- **Betrayal detection:** "One ally will betray you tonight. Who? Watch their behaviour." (Pattern detection in social context)

### Feedback
- Successful coordination → war-band celebrates, loot shared, power gained
- Failed coordination → visible consequence (ally injured, loot lost, enemy escapes)
- Accurate prediction → "You read them well, war-chief" (social insight rewarded)
- Inaccurate prediction → consequence plays out; "You misjudged them" (learning opportunity)

### Difficulty Adaptation
- Number of allies to coordinate: 1 → 2 → 3
- Agent complexity: transparent motivations → hidden motivations → conflicting motivations
- Coordination complexity: simultaneous → sequential → conditional
- Social challenge type: prediction → negotiation → deception detection

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Pair Coordination | 1-5 | 1 ally, simple timing/turn-taking, transparent motivations |
| Squad Tactics | 5-15 | 2-3 allies, role assignment, visible trait matching |
| Prediction Games | 15-30 | Modelling ally behaviour based on known motivations |
| Alliance Negotiation | 30-50 | Competing interests, trade-offs, social problem-solving |
| Betrayal Detection | 50+ | Hidden motivations, deception, pattern detection in social behaviour |

---

## 4. Item Pool Specification

### Item types
- **Coordination challenges:** Timing/sequencing tasks requiring 2+ agents
- **Role-assignment puzzles:** Match ally traits to challenge requirements
- **Prediction scenarios:** "What will X do given Y motivation and Z situation?"
- **Negotiation scenarios:** Competing interests with possible win-win solutions
- **Betrayal scenarios:** One agent has hidden motivation; detect from behaviour patterns

### Minimum pool size
- 25+ coordination challenges (varied timing/sequencing requirements)
- 20+ role-assignment puzzles (varied trait/challenge combinations)
- 30+ prediction scenarios (varied motivations and situations)
- 15+ negotiation scenarios (varied interest configurations)
- 10+ betrayal scenarios (varied deception patterns)

### Generation rules
- LLM generates scenarios within Red-stage constraints (egocentric motivations, concrete stakes)
- Ally motivations drawn from Red-stage drives: gold, glory, survival, dominance, loyalty-to-strong
- Difficulty scales with: number of agents, motivation complexity, coordination requirements
- All scenarios must have CONCRETE, VISIBLE stakes (not abstract social outcomes)

### Drive/shadow mapping
- Solo vs. coordination choices → Agency probing
- Plan quality after disagreement → Communion probing
- Familiar vs. novel ally engagement → Eros probing
- Simple coordination quality → Agape probing
- Over-complex coordination schemes → dark-addiction signal
- Solo attempts on coordination-required tasks → dark-allergy signal
- Sophisticated-but-wrong social predictions → golden-addiction signal
- Disengagement at social complexity → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Choice selection (assign roles, make predictions, negotiate options)
- Timing input (coordination signals — tap when ready)
- Text input (optional: explain reasoning for predictions)
- Drag-and-drop (assign allies to positions/roles)

### Timing requirements
- Coordination timing: ±500ms window for simultaneous actions
- No millisecond precision needed for social reasoning
- Turn-based negotiation (no real-time pressure at early stages)

### NPC/AI requirements
- **Critical:** 2-4 ally NPCs with consistent personalities, visible motivations, and predictable-but-not-obvious behaviour
- Ally behaviour must be MODELABLE — the player can learn to predict them
- Enemy NPCs for adversarial scenarios
- LLM drives NPC dialogue and behaviour within personality constraints

### LLM requirements
- **High:** NPC behaviour generation, dialogue, scenario creation, negotiation evaluation
- NPCs must be consistent across sessions (same ally = same personality)
- Social scenarios must be grounded in Red-stage motivations (concrete, egocentric)
- Evaluation of negotiation quality requires LLM judgement

### State persistence
- Ally relationship history (interactions, predictions, outcomes)
- Coordination success rates (per ally, per challenge type)
- Prediction accuracy (running estimate of social modelling capacity)
- Drive-health signals from social engagement patterns
- Shadow signals from coordination/modelling patterns
- War-band composition and ally development (carries across sessions)
- Checkpoint position and phase
