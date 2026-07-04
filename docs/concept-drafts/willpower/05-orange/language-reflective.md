# Willpower / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of goal-relationship — how the player talks about their goals reveals shadow.  **Why this axis for this module:** Achievement-will is uniquely revealed through the language of commitment, justification, and self-narrative around goals.

---

## 1. Game Identity

**Name:** The Goal Journal  
**Core loop:** Player responds to LLM-generated prompts about their real or in-game goals. Responses are analyzed for shadow markers — rigidity, avoidance, bypass, compulsion — through linguistic patterns rather than content judgment.  
**Session length:** 4–10 minutes (1–3 prompts per session).  
**Infinite checkpoint:** Yes — each prompt-response pair is complete.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange willpower — the relationship between self and goal as revealed through language.  
**Shadow surfacing:** DA surfaces through language of obligation ("I have to," "I can't stop"), inability to articulate rest, productivity-identity fusion. DAll surfaces through dismissal language ("goals are pointless," "why bother"), external locus, passive voice. GA surfaces through premature transcendence language ("I'm beyond needing goals," "I just flow") without evidence of prior pursuit. GAll surfaces through rigidity language ("I can't change course," "questioning is weakness"), catastrophizing around revision.  
**Drive probing:** Eros in aspiration language. Agape in integration/rest language. Agency in ownership language. Communion in relational-goal language.

## 3. Game Design

**Mechanic 1 — Goal Articulation Prompts:** "Describe a goal you're currently pursuing." "What would happen if you paused this goal for a month?" "When did you last change a goal?" LLM scores linguistic markers (not content correctness).  
**Mechanic 2 — Shadow-Probing Follow-ups:** Based on initial response, LLM generates targeted follow-ups. DA-suspected: "What does rest look like for you?" DAll-suspected: "What's the longest you've pursued something by choice?" Adaptive depth — never confrontational, always curious.  
**Mechanic 3 — Reframe Invitations:** Player is offered alternative framings of their goal-relationship. Willingness to engage reframes (vs. dismissal or rigid defense) indicates shadow flexibility. Game-framed as "perspective quests."  
**Mechanic 4 — Temporal Tracking:** Same prompts recur across sessions (spaced 7–14 days). Linguistic shift over time = developmental movement. Stagnation in shadow-language = shadow-drag maintained.

## 4. Item Pool

| Item Type | Count | Adaptive Range | Shadow Diagnostic |
|---|---|---|---|
| Goal-articulation prompts | 80+ | Concrete → abstract | Reveals goal-relationship depth |
| Shadow-probing follow-ups | 40 per shadow | Gentle → direct | Surfaces specific shadow |
| Reframe offerings | 60+ | Minor shift → major revision | Flexibility vs. rigidity |
| Temporal comparison pairs | Auto-generated | 7–30 day intervals | Tracks developmental movement |

## 5. Technical Requirements

**LLM integration:** Required. Prompt generation, response analysis, follow-up selection. Rubric-based scoring (not open-ended judgment). Shadow-marker lexicons per quadrant.  
**Privacy:** Goal-content never stored raw. Only linguistic-feature vectors retained. Player can delete all data.  
**Scoring outputs:** Shadow-language density per quadrant, reframe-engagement ratio, temporal-shift velocity. Feed module-spec §5 parameters.  
**Rubric anchors:** Each shadow has 5-level linguistic rubric (absent → pervasive). Inter-rater reliability target: κ ≥ 0.75 between LLM passes.
