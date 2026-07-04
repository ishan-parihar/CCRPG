# Cognitive / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of multi-perspectival reasoning — how the player talks about holding contradictions reveals depth vs. performance.  **Why this axis for this module:** Green cognition can be performed linguistically without genuine perspectival inhabitation; language-reflective probes distinguish authentic multi-perspectival depth from sophisticated mimicry.

---

## 1. Game Identity

**Name:** The Dialogue Garden
**Core loop:** Player encounters a multi-perspectival dilemma, then articulates — in their own words — how multiple valid viewpoints coexist. LLM evaluates depth of perspectival inhabitation, not correctness of conclusion.
**Session length:** 5-10 minutes (2-3 prompts per session, infinite checkpoint).
**Felt experience:** A contemplative garden where ideas grow as living plants — the player tends contradictions into bloom rather than pruning them into agreement.

## 2. Catalyst Delivery

**Catalyst type:** Open-ended verbal reasoning about genuinely multi-perspectival problems.
**Shadow provocation:** GA surfaces as premature synthesis language ("it's all one"). GAll surfaces as articulate refusal to prioritise. DA surfaces as endless qualification without landing. DAll surfaces as dismissal of the prompt's complexity.
**Drive engagement:** Agency = taking a position while honouring others. Communion = genuinely inhabiting perspectives not one's own. Eros = reaching toward synthesis. Agape = returning to honour each perspective's validity.
**Progression:** Diagnosis (baseline articulation depth) → Healing (targeted prompts that provoke specific shadows) → Evolution (spontaneous dialectical sophistication).

## 3. Game Design

**Mechanics:**
- Dilemma presented as narrative vignette (2-4 characters holding different valid positions)
- Player writes/speaks their response (voice-to-text available)
- LLM rubric scores on 6 dimensions: perspective count, inhabitation depth, contradiction tolerance, synthesis quality, commitment presence, contextual sensitivity
- Follow-up probe: LLM asks one targeted question based on detected shadow pattern
- Player responds to probe; second scoring pass

**LLM Rubric (scored 0-4 per dimension):**
- Perspective count: how many distinct viewpoints genuinely articulated (not just listed)
- Inhabitation depth: does player speak FROM each perspective or merely ABOUT it
- Contradiction tolerance: can player hold incompatible conclusions without forced resolution
- Synthesis quality: if synthesis attempted, is it genuine dialectic or premature collapse
- Commitment presence: does player take contextual action-stance or remain permanently suspended
- Contextual sensitivity: does player acknowledge that "correct" depends on framework

**Shadow-specific follow-up probes:**
- DA detected: "If you HAD to act right now, what would you do and why?"
- DAll detected: "Can you articulate why someone intelligent might disagree with you?"
- GA detected: "Can you stay with just ONE of these perspectives — what does the world look like from there alone?"
- GAll detected: "If these perspectives aren't all equal, which matters most here and why?"

## 4. Item Pool

**Dilemma categories:** Interpersonal (care vs. justice), Epistemological (empiricism vs. hermeneutics), Political (individual rights vs. collective good), Ecological (development vs. preservation). 16 dilemmas per category, 64 total.
**Perspective archetypes per dilemma:** 4 characters embodying distinct valid frameworks. Each position is internally coherent and genuinely defensible.
**Follow-up probe bank:** 12 probes per shadow type, contextualised to dilemma content.
**Difficulty scaling:** Level 1: 2-perspective, familiar domains. Level 2: 3-perspective, mixed. Level 3: 4-perspective, abstract. Level 4: 4-perspective with time pressure and commitment demand.

## 5. Technical Requirements

**LLM integration:** Rubric-based scoring via structured prompt. Model receives: dilemma text, player response, scoring rubric, shadow definitions. Returns: 6 dimension scores + shadow probability vector + recommended follow-up probe.
**Latency:** <3s for scoring pass (async, player sees "garden growing" animation).
**Privacy:** Player text processed ephemerally; no long-term storage of raw text, only dimension scores and shadow vectors.
**Metrics captured:** Per-dimension scores (6), shadow probability vector (4), response length, response latency, follow-up compliance, session trajectory.
**Calibration:** Initial 5 sessions establish baseline; shadow-specific prompts introduced session 6+.
**Accessibility:** Voice input with real-time transcription, adjustable time limits, dyslexia-friendly font option.
