# 19 — The Choice & Polarity Engine

> **Lateral:** The macro-polarity accumulation system — how every micro-choice across the player's entire game-lifetime aggregates into a crystallising STO/STS orientation, how that orientation propagates consequences across encounters, and what thresholds gate the harvest. This is NOT the in-encounter drive-balancing mechanic (foundations/05, foundations/12); it is the game-lifetime vector that emerges from thousands of micro-choices.
>
> **Depends on:** 15 (macro-architecture theory), 05 (drives and polarities), 06 (Law-of-One cosmology)
> **Forward-references:** 16 (Significator architecture), 17 (Transformation mechanics), 18 (Great Way world-system), 20 (Veil of Forgetting), 21 (Incarnation Architecture / encounter scheduler), 22 (Holon Context Engine / LLM consequence threading)

---

## 1. The Choice as teleological singularity

Of the twenty-two archetypes in the Archetypal Mind, Ra states that only Archetype Twenty-Two — The Choice — is "relatively fixed and single." Every other archetype admits sub-octave variation, individual colouring, and fluid relationship. The Choice does not. It is the absolute attractor toward which all third-density experience converges: the crystallisation of macro-polarity.

**Design implication for CCRPG:** STO/STS is not a flavour layer, a cosmetic alignment slider, or a branching-narrative gimmick. It is the *spine* of the game's macro-arc. Every system in the game — the 8 lines of intelligence, the 8 stages of consciousness, the 7 modalities, the 4 drives, the shadow model, the encounter scheduler, the world-state — exists ultimately to provide the conditions under which the player's polarity authentically crystallises. The Choice is the teleological singularity; everything else is catalyst in service of it.

The lesser cycle (Matrix → Potentiator → Catalyst → Experience) processes individual moments. The greater cycle (Significator → Transformation → Great Way → Choice) processes the lifetime. The Choice is where the greater cycle terminates — or rather, where it *opens* into the next octave.

**The singular nature of The Choice means:**
- There is no "third path." The player polarises STO, polarises STS, or remains uncrystallised.
- The game does not judge which polarity is "correct." Both are valid evolutionary paths per the source cosmology (see foundations/06 §6).
- The game's job is to provide *authentic conditions for crystallisation* — not to steer the player toward either pole.

---

## 2. STO vs STS at each stage altitude

### 2.1 Precise definitions

| Polarity | Orientation | Energetic signature | Relationship to the One |
|---|---|---|---|
| **Service-to-Others (STO)** | Radiation, empathy, integration | Outward flow; the open heart | Service to the One *through the many* — seeing the Creator in each other-self |
| **Service-to-Self (STS)** | Absorption, control, separation | Inward pull; the closed circuit | Service to the One *through the self* — seeing the Creator only in the self |

Both are pursued by viable Significators. Both produce harvestable entities (at different thresholds — see §7). CCRPG must model both with **mechanical fairness**: neither path is harder to play, neither is punished by the system, neither receives fewer encounters or less content. The asymmetry is in the *threshold* (§7), not in the *availability*.

### 2.2 Polarity expression at each stage

The same polarity looks radically different at different altitudes. What follows is the canonical expression table:

| Stage | STO expression | STS expression |
|---|---|---|
| **Infrared** | Protective nurturer — shields the vulnerable, shares resources | Survival predator — hoards, eliminates competitors |
| **Magenta** | Tribal healer — binds the group through ritual and care | Tribal sorcerer — controls the group through fear and magic |
| **Red** | Protective warrior — uses power to defend the weak | Conqueror — uses power to dominate and subjugate |
| **Amber** | Devoted servant — upholds the order for the good of all | Inquisitor — enforces the order to control all |
| **Orange** | Ethical innovator — creates systems that elevate others | Ruthless strategist — creates systems that extract from others |
| **Green** | Compassionate pluralist — holds space for all voices | Manipulative empath — uses sensitivity to control narratives |
| **Turquoise** | Integral steward — serves the whole spiral | Integral tyrant — manages the whole spiral for personal sovereignty |
| **White** | Transparent vessel — radiates without agenda | Absolute sovereign — absorbs all into the self without remainder |

These are *archetypes*, not stereotypes. A player's actual expression will be far more nuanced, blended, and contextual. The table defines the *pure signal* the polarity engine looks for.

---

## 3. The polarity vector data structure

The polarity vector lives on the PlayerProfile (architecture specified in foundations/16). It is **never visible to the player** (see §8).

### 3.1 Core structure

```ts
interface PolarityVector {
  // Global polarity
  direction: number;        // -1.0 (pure STS) … 0.0 (uncrystallised) … +1.0 (pure STO)
  magnitude: number;        // 0.0 (no crystallisation) … 1.0 (fully crystallised)

  // Per-line polarity (early game: lines can diverge; late game: they coordinate)
  linePolarity: Record<Line, { direction: number; magnitude: number }>;

  // Momentum — how fast the vector is currently moving
  momentum: number;         // rate of change; decays over time without reinforcing choices

  // The Choice trail — history of polarising events
  choiceTrail: PolarityEvent[];
}

interface PolarityEvent {
  encounterId: string;
  timestamp: number;
  choiceId: string;
  vectorContribution: number;   // -1.0 … +1.0 (direction of this choice)
  weight: number;               // 0.0 … 1.0 (magnitude of this choice's impact)
  stageAtTime: Stage;
  lineAtTime: Line;
  catalyticIntensity: number;   // how much this choice was a genuine catalyst vs routine
}
```

### 3.2 Derived quantities

- **Global direction** = weighted average of `linePolarity[*].direction`, weighted by each line's developmental altitude and recent activity.
- **Global magnitude** = function of consistency (low variance across lines), duration (how long the orientation has been stable), and intensity (how many high-weight choices reinforce it).
- **Crystallisation index** = `magnitude × abs(direction)` — the product of how polarised AND how crystallised. This is what gates the harvest (§7).

### 3.3 Per-line divergence and coordination

In the early game (Infrared through Red), per-line polarity can diverge significantly. A player might be STO in their Emotional line but STS in their Cognitive line. This is *normal* — it reflects the uncrystallised state of early development.

As the player advances (Amber onward), the system applies **coordination pressure**: encounters increasingly require cross-line consistency. A player whose Moral line is STO but whose Interpersonal line is STS will encounter catalysts that force reconciliation. By Turquoise, significant divergence between lines becomes a *barrier to advancement* — the Significator cannot integrate without internal coherence.

---

## 4. Micro-choice aggregation

### 4.1 Choice classification

Every encounter contains zero or more **choice-points** — moments where the player's action carries polarity signal. Each choice-point is classified by the encounter designer (concept-draft author) with:

| Classification | Meaning | Example |
|---|---|---|
| **STO-signal** | Action radiates outward; serves other-selves | Sharing a resource, protecting an NPC, choosing mercy |
| **STS-signal** | Action absorbs inward; serves the self at others' expense | Hoarding, dominating, choosing cruelty for advantage |
| **Neutral** | Action carries no polarity signal | Routine navigation, skill execution without moral dimension |
| **Ambiguous-by-design** | Action's polarity depends on context and intent | Killing an enemy (protective? predatory?), withholding information (prudent? manipulative?) |

Ambiguous choices are the most valuable catalytically. Their polarity contribution is determined by the *pattern* of surrounding choices, not by the action in isolation. The LLM context engine (foundations/22) resolves ambiguity by reading the player's choice trail.

### 4.2 Vector magnitude per choice

Not all choices carry equal weight. Magnitude is determined by:

| Factor | Effect on weight | Rationale |
|---|---|---|
| **Catalytic intensity** | High intensity → high weight | A choice made under pressure, with real stakes, carries more signal |
| **Stage altitude** | Higher stage → higher weight | Choices at higher altitudes require more integrated consciousness |
| **Novelty** | First-time dilemma → higher weight | Repeated identical choices decay in weight (habituation) |
| **Cost** | Higher personal cost → higher weight | Sacrifice amplifies signal; easy choices carry less |
| **Ambiguity** | More ambiguous → higher weight (if resolved clearly) | Choosing clearly in fog is more polarising than choosing in sunlight |

Routine choices (weight < 0.1) accumulate slowly. Catalytic moments (weight 0.5–1.0) can shift the vector significantly in a single event.

### 4.3 Aggregation algorithm

The polarity vector uses **momentum-weighted exponential accumulation**:

```
newDirection = (1 - α) × oldDirection + α × choiceVector
newMomentum = β × oldMomentum + (1 - β) × abs(choiceVector × weight)
newMagnitude = f(consistency, duration, totalWeightAccumulated)
```

Where:
- `α` (learning rate) scales with the choice's weight and inversely with current magnitude. Early choices move the needle easily; late choices require more weight to shift a crystallised vector.
- `β` (momentum decay) ensures that a player who stops making polarising choices gradually loses momentum (but NOT direction — direction is sticky once crystallised).
- `f(consistency, duration, totalWeight)` is a sigmoid that saturates toward 1.0 as the player accumulates consistent, high-weight choices over time.

### 4.4 Crystallisation dynamics

Crystallisation is not linear. It follows a **phase-transition model**:

1. **Exploration phase** (magnitude < 0.3): The vector is fluid. Small choices move it easily. The player is "trying on" orientations. Direction fluctuates.
2. **Consolidation phase** (0.3 ≤ magnitude < 0.6): The vector has momentum. It takes increasingly large contrary choices to reverse direction. The player is developing a *tendency*.
3. **Crystallisation phase** (magnitude ≥ 0.6): The vector is stable. Only major catalytic events (high-weight, high-cost, high-ambiguity) can shift direction. The player has a *character*.
4. **Locked phase** (magnitude ≥ 0.85): The vector is effectively fixed. Reversal requires a Transformation event (foundations/17) — a genuine frame-change, not just a contrary choice.

### 4.5 Reversal mechanics

A polarised player CAN reverse — but it is costly and rare:

- **In consolidation:** Sustained contrary choices (10+ high-weight choices against current direction) can reverse. Magnitude drops before direction shifts.
- **In crystallisation:** Requires a Transformation event. The player must undergo a genuine frame-change — a crisis that dissolves the current Significator structure. Magnitude drops to ~0.3 before rebuilding in the new direction.
- **In locked phase:** Requires a *catastrophic* Transformation — the equivalent of a dark night of the soul. The game provides this catalyst only if the player's behaviour genuinely signals reconsideration (not just a single contrary choice).

Reversal is never *prevented* — free will is absolute. But it is *expensive* — crystallisation has inertia, as it should.

---

## 5. Polarity-conditioned encounter selection

As the polarity vector crystallises, the encounter scheduler (foundations/21) shifts the catalyst landscape:

### 5.1 The principle

The game provides catalyst *appropriate to the player's current polarity orientation*. This is not reward or punishment — it is the Great Way mirroring the Significator (see foundations/15, §Great Way).

| Player state | Encounter shift |
|---|---|
| **Uncrystallised** (magnitude < 0.3) | Maximum diversity — both STO and STS catalysts presented equally; ambiguous choices dominate |
| **Consolidating STO** | More opportunities for STO expression; STS *temptations* as tests of commitment |
| **Consolidating STS** | More opportunities for STS expression; STO *challenges* as tests of commitment |
| **Crystallised STO** | Deep STO catalysts — sacrifice, leadership, integration of the collective shadow |
| **Crystallised STS** | Deep STS catalysts — dominion, mastery, integration of the personal shadow |

### 5.2 The temptation/challenge mechanic

A consolidating player receives *counter-polarity catalysts* — not to punish, but to *test and strengthen* crystallisation. An STO-consolidating player encounters moments where STS would be easier, more rewarding in the short term, or more "rational." If they hold their orientation, magnitude increases. If they flip, magnitude decreases and direction shifts.

This is the game's equivalent of Ra's teaching: "The temptation is the refining fire."

### 5.3 NPC and faction responsiveness

NPCs and factions develop *memory* of the player's polarity expression:
- STO-leaning players attract allies, mentors, and communities that resonate with radiation.
- STS-leaning players attract subordinates, rivals, and hierarchies that resonate with absorption.
- Uncrystallised players encounter *both* — and both factions attempt to recruit them.

The specifics of NPC memory and faction dynamics are in foundations/18 (Great Way) and foundations/22 (Holon Context Engine). This document specifies only the *principle*: polarity conditions encounter selection.

---

## 6. The consequence propagation engine

### 6.1 Propagation layers

When a player makes a polarising choice, consequences ripple through five layers:

| Layer | Scope | Persistence | Example |
|---|---|---|---|
| **Local** | The immediate encounter | Encounter-duration | An NPC lives or dies; a resource is shared or hoarded |
| **Holonic** | The affected holons (NPCs, factions, environments) | Permanent (state change) | The NPC remembers; the faction's disposition shifts |
| **Polarity** | The player's polarity vector | Permanent (accumulated) | Direction and magnitude update per §4 |
| **Future-encounter** | The encounter scheduler's available pool | Session-to-session | New quests unlock; old paths close; NPCs seek or avoid the player |
| **World-state** | The Great Way's macro-environment | Cross-session, stage-bound | A tyrant overthrown shifts a region's political structure |

### 6.2 The propagation graph

Consequences propagate along a directed acyclic graph:

```
Choice-point
  ├─→ Local outcome (immediate)
  ├─→ Polarity vector update (immediate)
  ├─→ Holonic state updates (deferred — processed between encounters)
  │     ├─→ NPC memory graph
  │     ├─→ Faction disposition matrix
  │     └─→ Environment state
  ├─→ Encounter scheduler re-weighting (next encounter selection)
  └─→ World-state delta (aggregated across many choices; stage-bound)
```

### 6.3 Ripple distance

Not all choices ripple equally far:

- **Stage-bound ripple:** Most choices affect only the current stage's world-state. A Red-stage choice does not directly alter the Amber-stage world.
- **Cross-stage ripple:** High-weight choices (catalytic intensity > 0.7) can ripple one stage up or down. A pivotal Red-stage choice might alter the conditions the player encounters upon entering Amber.
- **Global ripple:** Only locked-phase choices (magnitude > 0.85, weight > 0.9) ripple globally — affecting the entire world-state. These are rare, late-game, and narratively momentous.

Line-boundedness: choices made in one line's encounters primarily affect that line's future encounters. Cross-line ripple occurs when the choice involves multiple lines simultaneously (e.g., a Moral choice that also tests Interpersonal capacity).

### 6.4 Persistence model

| Data | Retention | Decay |
|---|---|---|
| NPC memory of player | Permanent within the NPC's lifetime | None — NPCs remember |
| Faction disposition | Permanent | Slow drift toward neutral if no reinforcing contact |
| World-state deltas | Permanent within the stage | None — the world is changed |
| Encounter scheduler weights | Session-to-session | Gradual rebalancing toward diversity (prevents lock-in) |
| Polarity vector | Permanent | Momentum decays; direction and magnitude do not |

### 6.5 LLM consequence awareness

The Holon Context Engine (foundations/22) receives a **consequence summary** after each choice-point:

- The choice made and its classification
- The polarity vector delta
- The affected holons and their new states
- The ripple distance and affected systems

This summary is injected into the LLM's context window for subsequent encounter generation, ensuring narrative coherence. The LLM does not *compute* consequences — the polarity engine does. The LLM *narrates* them. Detail in foundations/22.

---

## 7. Crystallisation thresholds and harvestability

### 7.1 The Ra thresholds

Per the Ra material:
- **STO harvest:** ~51% service-to-others orientation (barely more than half)
- **STS harvest:** ~95% service-to-self orientation (near-total)

The asymmetry is canonical: STO requires only a slight majority of radiation; STS requires near-absolute absorption. This reflects the cosmological principle that love is the default state — even a slight opening of the heart is sufficient — while separation requires extraordinary, sustained effort.

### 7.2 In-game equivalents

Translating to the polarity vector:

| Threshold | Vector requirement | Meaning |
|---|---|---|
| **STO harvestable** | direction ≥ +0.51, magnitude ≥ 0.85 | Consistent, crystallised orientation toward service-to-others |
| **STS harvestable** | direction ≤ -0.95, magnitude ≥ 0.85 | Near-total, crystallised orientation toward service-to-self |
| **Uncrystallised** | magnitude < 0.85 OR direction in (-0.51, +0.51) | Insufficient polarisation for harvest |

### 7.3 The White-stage gate

The harvest endgame (foundations/06 §7.4) requires:
1. Arrival at White stage (all prior stages healthy — the holon is never outgrown)
2. Crystallisation index (magnitude × abs(direction)) above the relevant threshold
3. Violet-ray integration quality (foundations/06 §7.5) — all prior rays distinct and activated

A player who reaches White but is uncrystallised experiences the **Samsara ending**: the game does not end. The player continues in a post-White loop, receiving increasingly intense catalysts designed to force crystallisation. The game is patient — it will wait. There is no "game over" for the uncrystallised; there is only "not yet."

### 7.4 Completion vs polarisation

**Design commitment:** CCRPG does not require polarisation for *completion* of individual stages or encounters. A player can progress through all 8 stages without crystallising. Polarisation gates only the *harvest* — the transition beyond the game's octave. This ensures:
- Players are never punished for exploring both polarities
- The exploration phase is genuinely free
- Crystallisation emerges organically from accumulated choices, not from a forced binary at a checkpoint

---

## 8. The Veil-validity requirement (no scoreboard)

### 8.1 The principle

Per the Veil of Forgetting (foundations/20): The Choice carries ontological weight ONLY if made in conditions of unknowing. If the player knows they are being measured on STO/STS, their choices become strategic calculations rather than authentic expressions of orientation. The polarity engine becomes a game to be gamed rather than a mirror of the self.

### 8.2 Design commitments

1. **No polarity UI.** The polarity vector is NEVER displayed to the player. No meter, no bar, no percentage, no alignment indicator.
2. **No STO/STS language.** The terms "Service-to-Others" and "Service-to-Self" are never surfaced in gameplay UI, quest descriptions, or choice prompts. They may appear in the deep codex (post-Turquoise) as cosmological theory — never as gameplay feedback.
3. **No moral labelling of choices.** Choice prompts never say "good" or "evil," "light" or "dark," "selfless" or "selfish." They present *actions* with *consequences* — the player infers the moral weight.
4. **Consequences, not judgements.** The game responds to choices with *narrative consequences* (NPCs react, the world shifts, new paths open or close) — never with moral evaluation. The player feels the weight of their choices through the world's response, not through a score.
5. **No post-hoc reveal.** The game never tells the player "you chose STO" or "you chose STS." Even at harvest, the experience is *felt* (the world responds to who you have become) rather than *scored*.

### 8.3 The paradox of documentation

This document specifies the polarity engine in full technical detail — for developers and designers. The *player* never sees this document's contents reflected in the game's surface. The engine operates entirely beneath the narrative layer. The LLM (foundations/22) is instructed to never reference polarity mechanics in player-facing text.

---

## 9. The 9th-stage opening

### 9.1 Beyond White

After the White stage, the harvest opens into **4th-density experience** — the density of love/understanding, where entities form social-memory complexes (foundations/06 §7.4). This is the game's outermost narrative shell.

### 9.2 STO harvest

The STO-harvestable player experiences:
- Dissolution of the individual boundary into the social-memory complex
- The player's character becomes a **mentor presence** in other players' worlds (multiplayer) or in the game's NPC ecosystem (single-player)
- The closing reflection — a contemplative rite where the player authors their character's final wisdom
- The graduation into violet-ray radiance — the character is *retired*, not deleted; their psychograph preserved as an immutable record

### 9.3 STS harvest

The STS-harvestable player experiences:
- Crystallisation of absolute sovereignty — the self as the only real entity
- The player's character becomes a **dark mentor** or **adversarial presence** — appearing in other players' worlds as a high-level antagonist
- The closing reflection — a contemplative rite where the player authors their character's final declaration of dominion
- The graduation into violet-ray absorption — the character is retired into the game's antagonist pantheon

### 9.4 The uncrystallised

The uncrystallised player does not harvest. They remain in the 3rd-density loop — the game continues to provide catalyst. This is not punishment; it is the cosmological reality that the Choice has not yet been made. The game is infinitely patient.

---

## 10. What this document does NOT cover (cross-references)

| Topic | Document |
|---|---|
| The pure theory of the macro-architecture (Significator, Transformation, Great Way, Choice as archetypes) | foundations/15 |
| The in-encounter drive-balancing mechanic (Agency/Communion/Eros/Agape within a single encounter) | foundations/05 |
| The dual-domain drive probes and scoring | foundations/12 |
| The 4th-density harvest cosmology, ray system, and violet-ray integration | foundations/06 |
| The Significator's architecture (the vessel that polarises) | foundations/16 |
| Transformation events (the frame-changes that polarity can gate or trigger) | foundations/17 |
| The Great Way world-system (the macro-environment that responds to polarity) | foundations/18 |
| The Veil of Forgetting (the full specification of why unknowing is required) | foundations/20 |
| The encounter scheduler (how polarity-conditioned selection is implemented) | foundations/21 |
| The Holon Context Engine (how the LLM is informed of consequences and narrates them) | foundations/22 |

---

*"In the Creator is all that there is. The positive and negative polarities are attempts to understand and use this truth."* — Ra, Session 78
