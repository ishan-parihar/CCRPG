# Interpersonal / Orange — Scenario-Choice Game Concept

> **Axis:** Relational dilemmas where contract conflicts with care, or boundaries conflict with connection.  **Why this axis for this module:** Orange interpersonal capacity is tested at its edges — when contractual clarity collides with human messiness, the player's shadow structure is revealed by which pole they sacrifice.

---

## 1. Game Identity

**Title:** The Negotiation Table  
**Core loop:** Player faces branching relational dilemmas where no option is purely correct. Each choice reveals drive-balance and shadow-preference. Dilemmas pit contractual precision against relational warmth, boundary maintenance against connection, and strategic benefit against genuine care.  
**Infinite checkpoint:** Each dilemma is a 3–5 minute vignette. Choices are final. Progress saves after each decision point.

## 2. Catalyst Delivery

**Shadow provocation by design:**
- DA surfaces when player consistently chooses options that maximise personal benefit in relational exchanges — the "strategic" choice that instrumentalises the other
- DAll surfaces when player chooses withdrawal/avoidance over engagement — "I'd rather not deal with this person at all"
- GA surfaces when player chooses premature vulnerability/depth over establishing clear terms — "let's just be real with each other" without structural support
- GAll surfaces when player chooses rigid contractual enforcement over human flexibility — "we agreed to X, period"

**Drive probing:** Each dilemma has 4–6 response options mapped to drive×shadow coordinates. No option is "the answer" — the pattern across 10+ dilemmas reveals the shadow structure.

## 3. Game Design

**Mechanics:** Narrative vignettes present relational situations with escalating stakes. Player selects from 4–6 response options (never binary). Some options are blended (partial contract + partial care). Consequences unfold across linked vignettes — choices in dilemma 3 affect the situation in dilemma 7.  
**Difficulty staircase:** Early dilemmas have clear "healthy" options alongside shadow options. Later dilemmas make all options partially shadow-laden — the player must choose which shadow to risk. Final-tier dilemmas have no clean resolution, only trade-offs.  
**Feedback:** Narrative consequences only — never explicit scoring. The player sees how their choices shaped the relational field. Implicit learning through outcome observation.  
**Progression:** Dilemma chains build relational histories. Characters recur. Trust accumulates or erodes based on prior choices.

## 4. Item Pool

- 48 core dilemmas across 4 tiers (12 per tier)
- Each dilemma: 4–6 response options with drive×shadow mapping
- 16 recurring characters with relational memory
- 8 dilemma-chains (6 linked vignettes each) for longitudinal consequence tracking
- Adaptive selection: dilemmas targeting detected shadow-gaps prioritised
- Contextual modifiers: power dynamics, cultural context, prior history with character

## 5. Technical Requirements

- Branching narrative engine with consequence propagation across dilemma-chains
- Choice-mapping system: each option tagged with drive scores and shadow-affinity
- Character memory system: NPC relational state persists across sessions
- Shadow-signal extraction: rolling pattern analysis across 10+ choices
- No LLM required — pre-authored dilemmas with fixed mappings
- Adaptive dilemma selection algorithm based on shadow-gap analysis
