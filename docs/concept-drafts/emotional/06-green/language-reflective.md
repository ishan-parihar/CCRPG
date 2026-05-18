# Emotional / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of empathic life — how the player talks about holding multiple feelings reveals depth vs. performance.  **Why this axis for this module:** Green empathy lives in language — the capacity to name contradictory affects, articulate others' perspectives without reducing them, and speak FROM empathy rather than ABOUT it is the linguistic signature of genuine pluralistic affect.

---

## 1. Game Identity

**Title:** The Empathic Voice  
**Core loop:** Player encounters emotionally complex scenes and responds in free-text — describing what multiple characters feel, articulating their own empathic response, and bridging between perspectives using language. LLM evaluates depth, differentiation, and authenticity.  
**Session length:** 5–10 minutes (infinite checkpoint).  
**Progression:** Scene complexity increases; prompts shift from description → articulation → bridging → holding-without-resolving.

## 2. Catalyst Delivery

**Catalyst type:** Linguistic-reflective under empathic complexity.  
**Shadow surfacing:**
- DA surfaces as undifferentiated language — "everyone is hurting," "I feel all of it," merging distinct perspectives into emotional soup.
- DAll surfaces as clinical distancing — "Character A appears frustrated; Character B seems disappointed" — accurate but affectively absent.
- GA surfaces as transpersonal vocabulary without grounding — "the field is heavy," "collective grief is present" — bypassing particular perspectives.
- GAll surfaces as rich pluralistic language that abruptly stops at transpersonal prompts — "I won't go there."

**Drive probing:** Agency via self-referential clarity ("I feel X while they feel Y"); Communion via bridging language; Eros via willingness to articulate beyond current comfort; Agape via returning to concrete relational language after abstraction.

## 3. Game Design

**Mechanics:**
- **Perspective-naming:** Scene presented; player writes what each character feels. Scored on differentiation (distinct language per character), accuracy (alignment with scene cues), and emotional granularity.
- **Self-in-relation:** Player articulates their own empathic response. Scored on boundary clarity (self vs. other), complexity (holding multiple responses), and authenticity markers.
- **Affect-bridging:** Player writes a statement connecting two opposing emotional perspectives without dismissing either. Scored on bridge quality, non-reduction, and generativity.
- **Holding prompts:** Player articulates what sitting with unresolved emotional tension feels like. Scored on tolerance (doesn't rush to resolution), depth, and embodiment.

**LLM rubric dimensions:** Differentiation, granularity, boundary-clarity, bridge-quality, tolerance, embodiment, authenticity-markers (hedging, self-correction, felt-sense language vs. conceptual performance).

**Difficulty staircase:** Scene emotional complexity increases; characters become more culturally distant; contradictions become more acute; holding-prompts extend duration.

## 4. Item Pool

- 80+ emotionally complex scenes (interpersonal conflict, collective grief, joy-amid-suffering, cultural misunderstanding)
- 30 bridging prompts (connect perspectives X and Y without reducing either)
- 20 holding prompts (sit with this unresolved tension)
- LLM rubric calibrated against expert empathy ratings (IRI benchmarks)
- Cultural-context variants ensuring out-group empathy is tested
- Transpersonal ceiling prompts (for GA/GAll detection)

## 5. Technical Requirements

- LLM integration for free-text evaluation (rubric-based, not sentiment-only)
- Rubric versioning and calibration pipeline
- Response latency tracking (rushed responses flag avoidance)
- Linguistic marker extraction: hedging frequency, self-correction, felt-sense vocabulary, conceptual-vs-embodied ratio
- Session persistence at prompt boundaries
- Shadow detection: undifferentiated-language > threshold flags DA; clinical-distance > threshold flags DAll; transpersonal-without-grounding flags GA; abrupt-ceiling-refusal flags GAll
- Privacy: free-text responses stored encrypted, used only for scoring
