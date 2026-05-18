# Intrapersonal / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of the plural self — how the player talks about their multiplicity reveals depth vs. fragmentation.  **Why this axis for this module:** Language is the primary medium through which multiplicity is either genuinely held or performatively claimed; verbal structure reveals shadow type directly.

---

## 1. Game Identity

**Title:** Many Voices  
**Core loop:** Player responds to open-ended self-reflective prompts. LLM evaluates linguistic markers of genuine multiplicity (both/and language, paradox tolerance, contextual self-reference) vs. shadow markers (dissolution, rigidity, bypass, fortress). Prompts escalate in complexity across sessions.  
**Session length:** 5–10 minutes per checkpoint (3–5 prompts).  
**Infinite checkpoint:** Yes — each prompt cluster is self-contained.

## 2. Catalyst Delivery

**Catalyst type:** Reflective prompts that invite the player to articulate their inner multiplicity, creating the developmental demand to HOLD complexity in language.  
**Shadow surfacing:** DA surfaces as incoherent or contradictory language without integration ("I'm everything, I don't know"). DAll surfaces as rigid first-person singular, dismissal of complexity ("I'm just me"). GA surfaces as spiritual/meta language that avoids specifics ("I am the awareness"). GAll surfaces as exhaustive listing without prioritisation ("all parts are equal, I can't choose").  
**Drive probes:** Agency = first-person ownership language. Communion = relational self-reference. Eros = language reaching toward synthesis. Agape = language returning to embody specifics.

## 3. Game Design

**Mechanic 1 — Self-Portrait Prompts:** "Describe yourself in a situation where two parts of you want different things." LLM scores for: number of distinct voices, coherence between them, tolerance of contradiction, presence of centre.  
**Mechanic 2 — Dialogue Completion:** Two inner voices are presented mid-conversation. Player completes the dialogue. Scored for: genuine engagement between parts (not collapse, not bypass, not paralysis).  
**Mechanic 3 — Paradox Articulation:** "How can you be both X and Y?" Player must articulate the holding without resolving. LLM evaluates depth of paradox tolerance vs. premature resolution or dissolution.  
**Progression:** Early prompts are concrete (work vs. play self). Later prompts are existential (the self that wants freedom vs. the self that wants belonging). Final prompts probe the edge of integral commitment.

## 4. Item Pool

- 30 self-portrait prompts (graded by complexity: concrete → relational → existential)
- 20 dialogue-completion stems (covering all 4 shadow types as potential attractors)
- 15 paradox-articulation challenges (mapped to specific drive axes)
- LLM rubric: 12 linguistic markers scored 0–4 (e.g., both/and syntax, self-as-process language, contextual qualification, embodied specificity)

## 5. Technical Requirements

**Input:** Text entry (keyboard or voice-to-text).  
**LLM integration:** Rubric-based scoring with 12 markers. Shadow classification from linguistic pattern. No free-form LLM judgment — all scoring via predefined rubric dimensions.  
**Metrics captured:** Per-marker scores, shadow-type probability vector, drive-balance from language patterns, complexity trajectory across sessions.  
**Privacy:** All text processed locally or with explicit consent. No storage of raw text beyond session — only extracted scores persisted.  
**Accessibility:** Voice input supported. Prompts available in simplified language for younger players. No time pressure on responses.
