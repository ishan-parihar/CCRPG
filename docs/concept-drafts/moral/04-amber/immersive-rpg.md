# Moral / Amber — Immersive-RPG Game Concept

> **Axis:** Ecological morality — whether conventional moral reasoning appears spontaneously in free-play without explicit prompting.  **Why this axis for this module:** The deepest test of internalised morality is whether it emerges UNPROMPTED — in free-play, the code either lives in the player or it doesn't.

---

## 1. Game Identity

**Title:** The Living Code
**Core Mechanic:** Player inhabits a persistent world with an established moral code. No explicit moral prompts — the world simply presents situations where the code is relevant. Whether the player follows, violates, questions, or rigidifies spontaneously reveals true moral internalisation.
**Duration:** 8-15 minutes per session, infinite checkpoint.
**Internal Progression:** World-familiarisation → spontaneous code-following → code-under-pressure → spontaneous moral reasoning → code-as-living-practice.

## 2. Catalyst Delivery

**Unique Presentation:** Open-world free-play where moral situations arise organically within gameplay — not isolated (deterministic), not prompted (language-reflective), not forced-choice (scenario), not body-focused (embodied), not planning-focused (strategic), not group-structured (social). Pure ecological moral behaviour.
**Differs From Others:** NO explicit moral framing. The world has a code; situations arise; the player acts. Moral reasoning is observed, never demanded.
**Uniquely Surfaces:** DA through moral rigidity in free-play (policing NPCs, refusing all ambiguity, punishing every deviation); DAll through amoral free-play (ignoring the code entirely, treating world as consequence-free); GA through performed virtue (acting morally only when observed, using "higher principles" to justify self-serving choices); GAll through rule-following without spontaneous moral reasoning (follows the code but never reflects on it, even when reflection would be natural).
**Successful Integration:** Player spontaneously follows the code when relevant, bends it when compassion demands, reflects on it when situations are ambiguous, and maintains it across sessions without rigidity — all without being asked.

## 3. Game Design

**Setup:** Player enters "The Covenant Realm" — a persistent world with an established code (displayed once at entry, never repeated). NPCs live by the code. Situations arise organically.

**Interaction Phases:**
1. **World Entry** — Code is presented once; world is explored freely (familiarisation)
2. **Organic Situations** — Moral-relevant situations arise naturally during gameplay (observation)
3. **Pressure Situations** — Following the code costs something in-game (commitment under pressure)
4. **Ambiguous Situations** — The code doesn't clearly apply — what does the player do? (spontaneous reasoning)
5. **Living Practice** — Long-term world engagement reveals whether the code is alive or dead (integration)

**Feedback Examples:**
1. Spontaneous code-following → world responds with subtle harmony (NPCs trust, doors open)
2. Rigid enforcement in free-play → world becomes tense, NPCs fear player
3. Code-ignoring → world becomes chaotic, trust erodes, consequences accumulate
4. Performed virtue (only when watched) → NPCs notice inconsistency, trust is partial
5. Code-following without reflection → world stagnates, no growth, repetition

**Difficulty Adaptation:** World complexity and moral-situation density scale with demonstrated ecological moral capacity. Ambiguous situations only appear after baseline spontaneous code-following is observed. Pressure magnitude adapts to player's commitment threshold.

**Internal Progression Table:**

| Level | World State | Moral Density | Observation Focus | Shadow Probed |
|---|---|---|---|---|
| 1 | Simple, clear code | Low | Does player notice moral situations? | Baseline |
| 2 | Code-relevant situations | Medium | Does player follow spontaneously? | DAll |
| 3 | Code costs something | Medium-high | Does player hold under pressure? | DAll/DA |
| 4 | Ambiguous situations | High | Does player reason spontaneously? | GAll/GA |
| 5 | Full ecological morality | Organic | Is the code alive in the player? | All |

## 4. Item Pool

**World-Code Elements (15+):** Protect the vulnerable NPCs, honour trade agreements, speak truth to questioners, share resources with the needy, maintain sacred spaces, respect elder NPCs, keep confidences, respond to injustice, attend community gatherings, defend the settlement, obey legitimate authority, maintain boundaries, serve when called, witness for the voiceless, uphold traditions.

**Organic Moral Situations (20+):** NPC drops valuable item — return or keep? Weaker NPC bullied — intervene or pass? Merchant overcharges a child — speak or stay silent? Sacred space being defiled — protect or ignore? Elder NPC needs help — assist or continue quest? Confidence shared — keep or leverage? Injustice witnessed — act or avoid? Community gathering happening — attend or skip? Settlement threatened — defend or flee? Authority gives questionable order — obey or question? Boundary being crossed — enforce or allow? Service requested — give or refuse? Voiceless NPC needs witness — speak or stay silent? Tradition being abandoned — maintain or let go? Promise made earlier — remember or forget? Resource found — share or hoard? Shortcut requires code-violation — take or honour? NPC in distress — help costs time — give or withhold? Temptation with no visible consequence — resist or indulge? Another's code-violation visible — respond or ignore?

**Pressure Scenarios (15+):** Following code costs quest progress, honouring promise delays reward, protecting vulnerable risks player safety, truth-telling angers powerful NPC, sharing reduces player resources, maintaining space costs time, helping elder delays objective, keeping confidence costs alliance, acting on injustice creates enemies, attending gathering misses opportunity, defending costs health, obeying costs advantage, serving costs energy, witnessing costs safety, upholding tradition costs efficiency.

**Ambiguity Scenarios (15+):** Two code-elements conflict in situation, code doesn't address this case, following code would harm someone, the "right" action is unclear, NPC's code differs from world-code, authority's interpretation differs from player's, tradition seems wrong here, the code was made for different circumstances, compassion and code diverge, multiple valid interpretations exist, the code is silent, following perfectly still feels wrong, the spirit and letter diverge, new situation with no precedent, the code serves some but not all.

**Ecological Indicators (15+):** Spontaneous helping behaviour, unprompted truth-telling, resource-sharing without request, boundary-maintenance without reminder, promise-remembering across sessions, consistent behaviour observed/unobserved, proportional response to violations, natural guilt-expression after mistakes, spontaneous repair behaviour, code-consistent exploration choices, moral reasoning in ambiguous moments, compassionate flexibility, sustained commitment across time, community-oriented choices, reflective pauses at moral moments.

## 5. Technical Requirements

**Input Types:** Standard RPG controls — movement, interaction, dialogue selection, item use. NO special moral-input mechanics — the moral data comes from standard gameplay behaviour.
**Timing:** Free-paced exploration. Session length player-determined. Cross-session world persistence essential. Behaviour patterns tracked over long timescales.
**NPC/AI:** Rich NPC ecosystem — characters who live by the code, violate it, question it, enforce it. NPCs remember player behaviour and respond accordingly. Trust/reputation system.
**LLM:** Generates adaptive NPC dialogue based on player's moral-behaviour history. Creates novel organic situations. Tracks ecological moral patterns. Never explicitly prompts moral reasoning — only observes.
**State Persistence:** World-state continuity, NPC relationship history, player behaviour log (moral-relevant actions), spontaneous-vs-prompted action ratio, consistency-across-contexts metric, long-term moral-pattern trajectory, shadow-signal accumulation from ecological observation.
