# Cognitive / Orange — Social-Cooperative Game Concept

> **Axis:** Collaborative reasoning with NPC partners — shared problem-solving, distributed cognition, teaching others.  **Why this axis for this module:** Orange's GAll shadow (Rationalist Fortress) is invisible in solo tasks; only when formal reasoning must be shared, explained, and integrated with others' perspectives does the fortress become visible.

---

## 1. Game Identity

**Title:** The Reasoning Circle  
**Core Mechanic:** Player solves cognitive problems collaboratively with 2–3 NPC partners who have different reasoning styles, partial information, and genuine contributions. The player must integrate others' perspectives, teach their own reasoning, and build shared understanding.  
**Duration:** 6–12 minutes per session, infinite checkpoint.  
**Internal Progression:** Solo-Thinker → Contributor → Integrator → Teacher (can explain formal reasoning to others and learn from their approaches).

## 2. Catalyst Delivery

**Unique Presentation:** A council of reasoning partners — each NPC has a distinct cognitive style (one is intuitive, one is systematic, one is creative). Problems require all perspectives to solve completely. No single reasoner has enough information alone.  
**Differs from others:** Not solo measurement (deterministic), not self-reflection (language-reflective), not branching investigation (scenario-choice), not embodied (somatic), not sustained planning (strategic), not free-play (immersive). This is cognition-in-relationship specifically.  
**Uniquely Surfaces:** GAll (refuses others' perspectives — "my reasoning is correct, I don't need their input") and GA (performs collaboration without substance — agrees with everything, contributes jargon, doesn't actually integrate).  
**Successful Integration:** Player can reason rigorously AND genuinely incorporate others' perspectives; can teach without condescension; can learn without abandoning their own reasoning; can hold multiple valid approaches simultaneously.

## 3. Game Design

**Setup:** Player joins a reasoning circle with 2–3 NPC partners. A complex problem is presented that requires distributed information and multiple reasoning approaches to solve fully.

**Interaction Phases:**
1. **Problem Presentation** — Complex scenario presented; each participant (including player) receives partial information
2. **Individual Reasoning** — Player forms their own hypothesis based on their information
3. **Sharing Round** — Each NPC shares their perspective; player shares theirs; information is pooled
4. **Integration** — Player must synthesise multiple perspectives into a coherent solution that accounts for all evidence
5. **Teaching/Learning** — Player explains their reasoning to an NPC who doesn't understand, OR learns a new approach from an NPC

**Feedback Examples:**
1. Genuine integration (uses all perspectives): solution is richer than any individual's, circle celebrates
2. GAll detected (dismisses NPC input): solution fails because it missed information only NPCs had
3. GA detected (agrees without integrating): NPC challenges — "You said you agree, but how does my point change your conclusion?"
4. Successful teaching: NPC demonstrates understanding, player's explanation was clear and non-condescending
5. Successful learning: player adopts NPC's approach and applies it to novel problem

**Difficulty Adaptation:** Number of perspectives required (2→4), information distribution asymmetry (slight→extreme), reasoning style conflicts (compatible→contradictory), teaching complexity (simple→abstract), problem ambiguity (one solution→multiple valid solutions).

**Internal Progression Table:**

| Level | Partners | Information Gap | Conflict Level | Teaching Demand | Solution Type |
|---|---|---|---|---|---|
| Solo-Thinker | 1 NPC | Slight | None | None | Single correct |
| Contributor | 2 NPCs | Moderate | Mild disagreement | Explain own view | Single correct |
| Integrator | 2–3 NPCs | Large | Genuine conflict | Explain + justify | Multiple valid |
| Teacher | 3 NPCs | Extreme | Deep contradiction | Teach formal method | Synthesis required |

## 4. Item Pool

**Distributed Problems (25+):** Logic puzzles with split clues, scientific mysteries with different data sets, engineering challenges with different constraints, social scenarios with different observations — all requiring formal-operational synthesis.  
**NPC Reasoning Styles (15+):** Intuitive-holistic, systematic-sequential, creative-lateral, empirical-observational, analogical, narrative-based — each genuinely contributes something formal reasoning alone misses.  
**Integration Challenges (20+):** Contradictory evidence requiring synthesis, complementary perspectives requiring combination, hierarchical information requiring ordering, parallel valid solutions requiring acknowledgment.  
**Teaching Scenarios (15+):** Explain deduction to intuitive thinker, explain hypothesis-testing to empiricist, explain abstraction to concrete thinker, explain revision to committed thinker.  
**Learning Opportunities (15+):** Intuitive insight that formal reasoning missed, empirical observation that contradicts deduction, creative reframing that dissolves the problem, narrative context that changes the meaning.

## 5. Technical Requirements

**Input Types:** Multiple-choice for reasoning contributions, drag-to-connect for integration mapping, free-text for teaching explanations (LLM-evaluated), tap-to-select for adopting NPC perspectives.  
**Timing:** Turn-based conversation pacing. No hard time pressure. Soft urgency at higher levels (problem evolves if circle takes too long).  
**NPC/AI:** 2–3 NPC reasoning partners with distinct personalities, consistent reasoning styles, genuine partial information, and the ability to be taught/to teach. Must feel like real collaborators, not puppets.  
**LLM:** Core dependency. Powers NPC dialogue, evaluates player's teaching quality, assesses genuine integration vs. performative agreement, generates adaptive follow-up challenges based on player's collaboration pattern.  
**State Persistence:** Integration quality scores, GAll frequency (dismissal of others), GA frequency (performative agreement), teaching effectiveness trajectory, learning receptivity, solo-vs-collaborative performance gap.
