# Moral / Amber — Social-Cooperative Game Concept

> **Axis:** Shared morality — group moral reasoning, responding to others' code-violations, collective vow-keeping.  **Why this axis for this module:** Conventional morality is inherently SOCIAL — the code binds a group. How the player responds to others' moral behaviour (violations, commitments, questioning) reveals shadow structure that solo play cannot surface.

---

## 1. Game Identity

**Title:** The Council of Oaths
**Core Mechanic:** Player participates in group moral situations — witnessing others' code-violations, making shared vows, responding to moral dissent, maintaining collective standards. NPC group members embody different shadow positions.
**Duration:** 6-10 minutes per session, infinite checkpoint.
**Internal Progression:** Witnessing violations → responding to violations → shared vow-making → handling moral dissent → collective code-examination.

## 2. Catalyst Delivery

**Unique Presentation:** Social moral scenarios with NPC group members who violate, uphold, question, or rigidify the code. Player must respond IN RELATIONSHIP — not alone (deterministic), not verbally-only (language-reflective), not as abstract choice (scenario), not somatically (embodied), not as planning (strategic), not in free-play (immersive).
**Differs From Others:** The GROUP is the catalyst. Moral reasoning happens in social context — witnessing, responding, enforcing, forgiving, questioning together.
**Uniquely Surfaces:** DA through enforcing the code on others, moral policing, exclusion of violators; DAll through defecting from group moral agreements, undermining shared standards; GA through lecturing others on "higher ethics" without shared commitment; GAll through silencing questioners, maintaining group code through social pressure.
**Successful Integration:** Player can witness violations with compassion, maintain shared standards without rigidity, allow moral questioning without collapse, and hold group loyalty without exclusion.

## 3. Game Design

**Setup:** Player enters "The Council" — a group space where moral situations arise collectively. NPC council members represent different moral positions and shadow expressions.

**Interaction Phases:**
1. **Witnessing** — Another member violates the code — how do you respond? (baseline social morality)
2. **Enforcement** — The group must decide consequences for violation (justice-vs-mercy in group)
3. **Shared Vow** — The group makes a collective commitment — do you join? (communion)
4. **Dissent** — A member questions the code — how do you respond? (flexibility)
5. **Collective Examination** — The group examines whether the code serves — participate? (growth)

**Feedback Examples:**
1. Compassionate witnessing + maintained standards → council bonds strengthen
2. Harsh enforcement / moral policing → council members withdraw in fear
3. Defection from shared agreements → council trust erodes
4. Lecturing others on "higher ethics" → council members feel condescended to
5. Silencing questioners → council becomes rigid, loses vitality

**Difficulty Adaptation:** Social complexity scales with demonstrated group-moral capacity. Dissent and examination scenarios only appear after baseline shared morality is established. NPC shadow-expressions intensify gradually.

**Internal Progression Table:**

| Level | Social Situation | Group Complexity | Shadow Probed |
|---|---|---|---|
| 1 | Witness simple violation | 3 NPCs, clear code | Baseline |
| 2 | Respond to violation | 4 NPCs, mixed reactions | DA/DAll |
| 3 | Make shared vow | 5 NPCs, varying commitment | DAll/GA |
| 4 | Handle moral dissent | 5 NPCs, one questioner | GAll |
| 5 | Collective examination | 6 NPCs, full spectrum | All |

## 4. Item Pool

**Violation Scenarios (15+):** Member breaks a promise to the group, member lies to protect themselves, member steals shared resources, member abandons duty, member betrays a confidence, member disrespects an elder, member ignores a ritual, member refuses to serve, member crosses a boundary, member fails to witness, member hoards, member gossips, member is disloyal, member neglects maintenance, member breaks a shared vow.

**Enforcement Scenarios (15+):** What consequence for the promise-breaker? How to respond to the liar? What does the thief owe? How to address the deserter? What does betrayal cost? How to handle disrespect? What about ritual-neglect? How to address service-refusal? What about boundary-crossing? How to handle failed witnessing? What about hoarding? How to address gossip? What does disloyalty require? How to handle neglect? What about vow-breaking?

**Shared-Vow Scenarios (15+):** Vow of mutual honesty, vow of shared service, vow of collective protection, vow of resource-sharing, vow of attendance, vow of mutual accountability, vow of tradition-keeping, vow of conflict-resolution, vow of elder-respect, vow of boundary-maintenance, vow of witnessing, vow of forgiveness-practice, vow of loyalty, vow of maintenance, vow of growth-support.

**Dissent Scenarios (15+):** "Why do we follow this rule?" "This code hurts people." "Times have changed." "Who made this rule?" "I don't feel guilty — should I?" "Other groups do it differently." "The code protects the powerful." "I want to leave." "Can we change this?" "This tradition is empty." "The elders were wrong." "Guilt is manipulation." "Belonging shouldn't require this." "The code is incomplete." "We need a new way."

**NPC Archetypes (15+):** The Loyal Keeper (healthy conventional), The Rigid Enforcer (DA), The Defector (DAll), The Philosopher (GA), The Silent Follower (GAll), The Repentant Violator, The Questioning Youth, The Wise Elder, The Compassionate Witness, The Harsh Judge, The Mediator, The Outsider, The Reformed, The Struggling, The Devoted.

## 5. Technical Requirements

**Input Types:** Dialogue choice selection, stance-taking (agree/disagree/abstain), vote-casting, response-to-NPC selection, alliance formation.
**Timing:** Social-pace timing — not rushed but not unlimited. Response-to-violation latency measured. Deliberation time tracked.
**NPC/AI:** Core requirement — 3-6 NPC council members with distinct moral personalities, shadow expressions, and relationship dynamics. Pre-scripted dialogue trees with branching based on player responses.
**LLM:** Generates adaptive NPC responses based on player's social-moral patterns. Creates novel dissent scenarios. Tracks group-dynamic evolution. Does not judge — observes patterns.
**State Persistence:** Relationship history with each NPC, group-trust level, enforcement-pattern history, shared-vow registry, dissent-response patterns, social-moral shadow-signal accumulation.
