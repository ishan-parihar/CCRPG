# Moral / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of moral reasoning — how the player talks about ethics reveals depth vs. performance.  **Why this axis for this module:** Orange principled reasoning must be articulable; language reveals whether reasoning is genuine or performed, and whether sophistication has backbone.

---

## 1. Game Identity

**Title:** The Moral Voice  
**Genre:** Dialogue-based moral reasoning with LLM-scored articulation  
**Session length:** 5–10 minutes (infinite checkpoint)  
**Core loop:** Moral prompt → player writes/speaks reasoning → LLM evaluates depth, coherence, authenticity → adaptive follow-up probes

The player articulates moral reasoning in their own words. The system distinguishes genuine principled reasoning from parroted sophistication, felt conviction from intellectual performance, and examined principles from unexamined conventions.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange moral — the capacity to articulate WHY, not just WHAT  
**Shadow surfacing:** GA (premature relativist) surfaces when language is sophisticated but ungrounded. DA (calculator) surfaces when language is precise but affectless — all logic, no moral weight.  
**Progression:** Diagnosis (sessions 1–3) → Healing (4–8) → Evolution (9+)

Healing catalyst: follow-up probes that ask "but why does that principle matter?" force the relativist to find backbone. Probes that ask "what would it feel like to be the person affected?" force the calculator toward embodied reasoning. Evolution catalyst: prompts inviting contextual nuance without abandoning principle.

## 3. Game Design

**Mechanics:**
- Open-ended moral prompts (e.g., "A law protects the majority but harms a minority. Should it stand? Why?")
- Player responds via text or voice (transcribed)
- LLM rubric scores on 5 dimensions: principled grounding, logical coherence, moral weight (felt-sense language), consistency with prior responses, genuine vs. performed sophistication
- Adaptive follow-ups probe weak dimensions

**Difficulty staircase:**
- Level 1: Single-issue prompts with clear principled answer
- Level 2: Prompts requiring justification chains (3+ reasoning steps)
- Level 3: Devil's-advocate follow-ups challenging stated principles
- Level 4: Prompts where player's own prior reasoning creates tension
- Level 5: Prompts requiring integration of principle AND context

**Shadow-specific mechanics:**
- GA probe: prompts that reward relativistic language — does player default to "it depends" without grounding?
- DA probe: prompts about individual suffering — does language remain purely analytical?
- DAll probe: prompts asking "why is this rule right?" — does player cite authority or reason?
- GAll probe: prompts introducing legitimate contextual exceptions — does player rigidify?

## 4. Item Pool

- 80 base moral prompts across domains (justice, care, rights, liberty, fairness, harm)
- 200 adaptive follow-up probes keyed to rubric-dimension weaknesses
- 40 devil's-advocate challenges per moral domain
- LLM rubric definitions with anchor examples at each scoring level
- Consistency-tracking corpus: player's own prior articulations as reference
- Voice-tone analysis parameters (optional): affect markers in speech

## 5. Technical Requirements

- LLM scoring engine with validated rubric (5 dimensions × 5 levels)
- Voice-to-text pipeline (optional modality)
- Longitudinal consistency tracker: compares current articulation to historical corpus
- Sophistication-vs-depth discriminator: trained to distinguish performed from genuine reasoning
- Adaptive prompt selector: chooses follow-ups based on weakest rubric dimension
- Privacy: all moral articulations stored locally, never transmitted without consent
- Drive-health mapping: rubric patterns → DA/DAll/GA/GAll signature scores
