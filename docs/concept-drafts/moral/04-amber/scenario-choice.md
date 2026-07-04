# Moral / Amber — Scenario-Choice Game Concept

> **Axis:** Moral dilemmas where the code conflicts with personal interest, competing codes, or compassion.  **Why this axis for this module:** Conventional morality is only tested when following the code COSTS something — dilemmas reveal whether the code is genuinely internalised or merely convenient.

---

## 1. Game Identity

**Title:** The Crossroads of Duty
**Core Mechanic:** Player faces branching moral dilemmas where the code conflicts with self-interest, love, competing loyalties, or mercy. Choices reveal shadow structure; consequences unfold across sessions.
**Duration:** 5-8 minutes per session, infinite checkpoint.
**Internal Progression:** Code-vs-comfort → code-vs-love → code-vs-code → code-vs-mercy → code-vs-growth.

## 2. Catalyst Delivery

**Unique Presentation:** Narrative vignettes with forced choices — not abstract (deterministic), not verbal production (language-reflective), not embodied (somatic), not planning (strategic), not group (social), not free-play (immersive). Pure dilemma-and-choice.
**Differs From Others:** The SITUATION is the catalyst, not the measurement method. Player faces genuine moral tension, not rule-application or articulation tasks.
**Uniquely Surfaces:** DA through always choosing code regardless of cost (even when code produces cruelty); DAll through always choosing self regardless of code; GA through choosing "higher principles" that conveniently avoid conventional commitment; GAll through choosing code but showing distress when asked to examine why.
**Successful Integration:** Player can hold moral tension — follows the code when appropriate, bends when compassion demands, without collapsing into rigidity or abandonment.

## 3. Game Design

**Setup:** Player enters "The Crossroads" — a liminal space where moral situations crystallise as branching paths. Each path represents a choice; consequences ripple forward.

**Interaction Phases:**
1. **Simple Duty** — Code-vs-comfort: following the rule costs convenience (baseline)
2. **Costly Duty** — Code-vs-desire: following the rule costs something valued (commitment depth)
3. **Competing Codes** — Two legitimate rules conflict (moral complexity)
4. **Mercy Tension** — Code demands punishment but compassion demands mercy (heart-vs-law)
5. **The Examination** — The code itself may be wrong here (growth edge)

**Feedback Examples:**
1. Genuine moral struggle visible in response time + choice → path illuminates with weight
2. Instant rigid choice (no struggle) → path hardens, becomes narrow
3. Instant self-serving choice (no guilt) → path dissolves behind player
4. "Higher principle" choice that avoids commitment → path floats, ungrounded
5. Choice made but examination refused → path continues but walls close in

**Difficulty Adaptation:** Dilemma intensity scales with demonstrated moral capacity. Competing-code and mercy-tension dilemmas only appear after baseline conventional morality is established.

**Internal Progression Table:**

| Level | Dilemma Type | Cost Magnitude | Shadow Probed |
|---|---|---|---|
| 1 | Code vs comfort | Low | Baseline |
| 2 | Code vs desire | Medium | DAll |
| 3 | Code vs code | High | DA/GAll |
| 4 | Code vs mercy | High | DA |
| 5 | Code vs growth | Existential | GA/GAll |

## 4. Item Pool

**Code-vs-Comfort Dilemmas (15+):** Keep promise despite inconvenience, tell truth when lie is easier, share when hoarding tempts, attend duty when tired, maintain standard when unwatched, honour debt when forgetting is possible, follow protocol when shortcut exists, maintain order when chaos is fun, respect boundary when crossing is easy, uphold tradition when novelty beckons, serve when resting is available, witness when ignoring is simpler, protect when risk is low, commit when freedom calls, maintain when neglect has no visible cost.

**Code-vs-Desire Dilemmas (15+):** Promise conflicts with opportunity, truth costs relationship, sharing costs security, duty costs pleasure, loyalty costs advancement, honour costs love, obedience costs dream, tradition costs innovation, purity costs experience, order costs spontaneity, service costs self-development, witnessing costs safety, protection costs comfort, commitment costs freedom, maintenance costs adventure.

**Competing-Code Dilemmas (20+):** Loyalty to friend vs loyalty to group, truth vs kindness, justice vs mercy, obedience vs protection, tradition vs compassion, duty to family vs duty to community, promise to one vs promise to another, honour vs survival, purity vs inclusion, order vs freedom, elder-respect vs child-protection, secrecy vs truth, punishment vs forgiveness, hierarchy vs equality, ritual vs emergency, debt to past vs duty to present, group code vs personal code, authority vs conscience, belonging vs integrity, service vs self-preservation.

**Mercy-Tension Dilemmas (15+):** Betrayer seeks forgiveness, rule demands harsh punishment, code excludes the repentant, justice requires cruelty, law punishes the desperate, tradition shames the different, duty demands abandonment of the fallen, order requires silencing the suffering, purity rejects the broken, hierarchy crushes the vulnerable, obedience enables harm, protocol ignores context, standard ignores capacity, code ignores circumstance, rule was made without mercy.

**Examination Dilemmas (15+):** The code produced suffering — was it wrong? The rule was made by flawed people — does it still bind? Everyone follows but no one knows why — question? The code worked then but not now — adapt or hold? Your code conflicts with another valid code — who is right? The code cannot account for this — what now? Following perfectly still produced harm — what does that mean? The code demands what love forbids — which is higher? Obedience here means complicity — what then? The tradition carries wisdom AND harm — separate them? The rule protects power not people — still follow? Your guilt says wrong but code says right — which to trust? The group changed the code — is the new one valid? You outgrew the code — betrayal or growth? The code is silent here — what guides you?

## 5. Technical Requirements

**Input Types:** Tap/click choice selection, optional timed pressure for some dilemmas, drag-to-rank for priority dilemmas.
**Timing:** Response time measured (instant = potential shadow signal). Some dilemmas have time pressure. Consequence tracking across sessions.
**NPC/AI:** Dilemma characters — the betrayer seeking forgiveness, the authority demanding obedience. Pre-scripted with branching responses.
**LLM:** Generates novel dilemma variations based on player's demonstrated shadow patterns. Adapts consequence narratives. Does NOT judge choices — only tracks patterns.
**State Persistence:** Choice history, consequence chains, response-time patterns, shadow-signal accumulation, dilemma-complexity level, moral-tension tolerance trajectory.
