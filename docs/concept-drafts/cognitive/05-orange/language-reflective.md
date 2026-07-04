# Cognitive / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of reasoning process — metacognitive depth revealed through how the player talks about their own thinking.  **Why this axis for this module:** Orange's defining emergence is metacognition; language is the window into whether the player can genuinely think about thinking or merely performs the appearance of it.

---

## 1. Game Identity

**Title:** The Mirror of Method  
**Core Mechanic:** Player solves cognitive puzzles then articulates their reasoning process in natural language. LLM evaluates metacognitive quality — not whether the answer is correct, but whether the player can accurately describe HOW they think.  
**Duration:** 5–10 minutes per session, infinite checkpoint.  
**Internal Progression:** Describer → Analyst → Metacognitor → Method-Maker (articulates novel strategies and their limits).

## 2. Catalyst Delivery

**Unique Presentation:** A reflective oracle that asks "how did you know?" after each puzzle. The oracle responds with probing follow-ups that deepen metacognitive articulation. Conversational, intimate, Socratic.  
**Differs from others:** Not measuring cognitive performance (that's deterministic) but measuring awareness OF cognitive performance. A player can score poorly on n-back but articulate their failure brilliantly — that's metacognitive health.  
**Uniquely Surfaces:** GA (verbal sophistication without operational depth — talks about "systems" and "emergence" but cannot describe their actual reasoning steps) and DA (over-analyses own process — 500-word explanations of simple pattern-matches, analysis as defence).  
**Successful Integration:** Player can accurately describe their reasoning, identify their errors, name their strategies, and acknowledge the limits of their self-knowledge — without compulsion or performance.

## 3. Game Design

**Setup:** Player completes a brief cognitive challenge (drawn from deterministic pool but simplified). Then the Mirror activates — a conversational interface where the oracle asks about the player's process.

**Interaction Phases:**
1. **Task** — 60-second cognitive puzzle (simplified n-back, mini-ToL, pattern completion)
2. **Initial Reflection** — "How did you approach that?" Open-ended response
3. **Probing** — Oracle asks 2–3 follow-up questions targeting specificity, accuracy, and limits
4. **Contrast** — Oracle presents an alternative strategy; player evaluates it relative to their own
5. **Meta-Reflection** — "What do you notice about how you reflect?" (metacognition on metacognition)

**Feedback Examples:**
1. Vague response ("I just figured it out"): Oracle gently probes — "What was the first thing you noticed?"
2. Accurate process description: Mirror glows, oracle affirms specificity
3. Over-analysis detected: Oracle reflects — "That's very thorough. Was it really that complex for you?"
4. GA-pattern (jargon without substance): Oracle asks for concrete example — "Can you walk me through one specific step?"
5. Genuine metacognitive insight: Mirror deepens, new reflection tier unlocked

**Difficulty Adaptation:** Puzzle complexity increases with demonstrated metacognitive accuracy. Oracle probing depth increases. Contrast strategies become more sophisticated. Meta-reflection prompts become more abstract.

**Internal Progression Table:**

| Level | Puzzle Complexity | Oracle Depth | Contrast | Meta-Reflection |
|---|---|---|---|---|
| Describer | Simple patterns | "How?" | None | None |
| Analyst | 3-step reasoning | "How?" + "Why that way?" | Single alternative | "What do you notice?" |
| Metacognitor | Multi-step formal | 3 probing questions | Multiple alternatives | "How reliable is your self-report?" |
| Method-Maker | Novel problems | Socratic dialogue | Player generates alternatives | "What are the limits of introspection?" |

## 4. Item Pool

**Puzzle Types (20+):** Pattern completion, logical deduction, rule-discovery, sequence prediction, analogy, classification — all solvable via formal operations.  
**Oracle Prompts (30+):** "What was your first step?", "Where did you get stuck?", "What rule did you use?", "How confident are you?", "What would you do differently?", "Was that intuition or reasoning?"  
**Contrast Strategies (15+):** Brute-force vs. elimination, forward-chaining vs. backward, analogy vs. deduction, systematic vs. insight — each presented as a named method.  
**Meta-Reflection Prompts (15+):** "How accurate is your description?", "What are you leaving out?", "Is this how you always think?", "What triggers this strategy?", "When does this fail?"  
**GA-Detection Probes (15+):** "Can you give a specific example?", "Walk me through the exact sequence", "What would falsify that?", "How is that different from [simpler explanation]?"

## 5. Technical Requirements

**Input Types:** Free-text natural language (voice or typed), multiple-choice for contrast evaluation, slider for confidence ratings.  
**Timing:** No time pressure on reflection phases. Puzzle phase timed (60–120s). Session pacing is player-controlled.  
**NPC/AI:** The Oracle — a Socratic conversational agent with consistent personality (curious, non-judgmental, precise).  
**LLM:** Core dependency. Evaluates metacognitive quality on rubric: specificity (1–5), accuracy vs. actual performance (1–5), depth of self-knowledge (1–5), absence of jargon-without-substance (1–5). Generates adaptive follow-up questions.  
**State Persistence:** Full conversation logs, rubric scores per session, metacognitive accuracy trajectory (self-report vs. deterministic ground-truth), GA/DA pattern flags over time.
