# Spiritual / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of pluralistic faith — how the player talks about multiple traditions reveals depth vs. tourism.  **Why this axis for this module:** Language is where spiritual tourism is most visible — the dilettante uses borrowed vocabulary without understanding; the genuine pluralist speaks with nuance, specificity, and reverence for difference.

---

## 1. Game Identity

**Name:** Many Tongues, One Silence  
**Core loop:** Player responds to open-ended prompts about spiritual traditions, interfaith experience, and sacred diversity. LLM evaluates responses for depth-markers (tradition-specific vocabulary used correctly), tourism-markers (generic "all paths lead to the same place" without specificity), and shadow-indicators across all four quadrants.  
**Session length:** 4–8 minutes (3–5 prompts per session).  
**Infinite checkpoint:** Each session explores a different facet of pluralistic faith; cumulative language-profile builds across sessions revealing developmental trajectory.

## 2. Catalyst Delivery

**Catalyst type:** Reflective articulation under progressively deeper prompts.  
**Shadow surfacing:** DA surfaces through generic language — "I love all traditions" without being able to say WHAT specifically is loved about any one. DAll surfaces through dismissive or reductive language — "it's all just cultural stories" or clinical detachment. GA surfaces through premature synthesis language — "ultimately they're all saying the same thing" without demonstrating what each says particularly. GAll surfaces through equality-enforcement language — "you can't say one tradition goes deeper" or defensive reactions to depth-prompts.  
**Drive probes:** Eros probed by prompts inviting upward reach ("what calls you beyond your current understanding?"). Agape probed by prompts inviting return ("what has a tradition given you that you carry daily?"). Agency probed by prompts requiring personal stance ("which tradition speaks most to YOU and why?"). Communion probed by prompts requiring relational appreciation ("how has encountering another's faith changed yours?").

## 3. Game Design

**Prompt categories:** (a) Tradition-specific: "Describe what you find most beautiful about [tradition X]." (b) Comparative: "How does [concept A in tradition X] relate to [concept B in tradition Y]?" (c) Personal: "Tell me about a time another tradition's practice moved you." (d) Tension: "When two traditions contradict each other, how do you hold that?" (e) Depth: "What does [tradition X] offer that no other tradition offers?"  
**LLM rubric dimensions:** Specificity (uses tradition-internal terms correctly), Nuance (acknowledges complexity within traditions), Reverence (tone of genuine appreciation vs. intellectual tourism), Commitment (evidence of sustained engagement vs. sampling), Tolerance-of-tension (can hold contradiction without collapsing it).  
**Shadow-mode:** When DA detected, prompts demand specificity — "name three practices from this tradition and describe your experience with each." When DAll detected, prompts invite felt-sense — "set aside analysis; what MOVES you?" When GA detected, prompts demand particularity before synthesis — "before you tell me how they're connected, tell me how they're DIFFERENT." When GAll detected, prompts gently introduce depth — "could one tradition's approach to suffering be more developed than another's?"

## 4. Item Pool

**Prompt bank:** 200+ prompts across 5 categories, tagged by shadow-target, drive-probe, difficulty, and tradition-focus.  
**Adaptive sequencing:** Early sessions use broad prompts to establish baseline. Mid-sessions target detected shadow with precision prompts. Late sessions probe integration — can the player demonstrate depth AND breadth AND tolerance-of-hierarchy simultaneously?  
**Tradition rotation:** Prompts cycle through traditions to prevent over-reliance on familiar territory. Player's demonstrated knowledge-gaps inform which traditions appear in prompts.  
**Difficulty progression:** Level 1: describe a tradition you know. Level 2: describe one you've encountered but don't practice. Level 3: articulate what a tradition offers that yours doesn't. Level 4: hold genuine contradiction between traditions without resolving it. Level 5: acknowledge depth-differences while maintaining pluralistic appreciation.

## 5. Technical Requirements

**LLM integration:** Responses evaluated by rubric-driven LLM scoring (not free-form judgment). Each rubric dimension scored 1–5 with specific behavioral anchors. Inter-rater reliability maintained through calibration prompts.  
**Response format:** Free-text (50–300 words per prompt). Voice-to-text option for accessibility.  
**Scoring:** Composite of rubric dimensions weighted by session-phase. Early sessions weight specificity and nuance. Later sessions weight tolerance-of-tension and commitment.  
**Telemetry:** Per-dimension scores, vocabulary-richness metrics, tradition-coverage breadth, depth-per-tradition scores, shadow-indicator composites, drive-health indicators from language patterns.  
**Privacy:** Responses stored locally only. LLM evaluation happens on-device or with anonymized server-side processing.
