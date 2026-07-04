# Willpower / Green — Language-Reflective Game Concept

> **Axis:** Verbal articulation of commitment-relationship.  **Why this axis for this module:** How a player talks about their goals reveals whether they hold pluralistic tension with depth or scatter into paralysis — language is the mirror of will's structure.

---

## 1. Game Identity

**Name:** Vow & Revision  
**Core loop:** Player is presented with commitment scenarios and responds in natural language — articulating what they would commit to, why, and how they would handle competing claims. LLM evaluates depth, coherence, and shadow-markers in the language itself.  
**Session length:** 4–7 minutes per prompt cycle.  
**Infinite checkpoint:** Yes — each prompt-response pair is self-contained.

## 2. Catalyst Delivery

**Catalyst → Experience → Integration:**  
- *Catalyst:* Prompts present genuine pluralistic dilemmas — "You have committed to X. Now Y emerges as equally valid. Speak your relationship to both."  
- *Experience:* The act of articulating forces the player to confront their actual commitment-structure — scattered, collapsed, bypassed, or genuinely pluralistic.  
- *Integration:* Over sessions, language patterns shift from shadow-markers toward integrated pluralistic commitment language.

**Shadow surfacing:**  
- DA: Detected in hedging language, endless qualifications, inability to state a clear commitment ("but also... and yet... on the other hand...").  
- DAll: Detected in dismissive language toward collaboration ("I just need to decide and act"), absence of relational framing.  
- GA: Detected in premature transcendence language ("it's all one anyway", "I serve whatever emerges") without concrete commitment.  
- GAll: Detected in refusal to prioritise language ("they're all equally important, I won't rank them").

## 3. Game Design

**Mechanics:**  
- Prompts escalate in pluralistic complexity: single commitment → dual tension → multi-stakeholder → community-vs-self → integral invitation.  
- LLM rubric scores on: commitment-clarity, relational awareness, revision-willingness, prioritisation capacity, embodiment (concrete vs. abstract).  
- Player receives no explicit score — only narrative reflection ("The council heard your words and felt..." — diegetic feedback).  
- Revision rounds: player can revisit earlier responses and revise them, demonstrating growth.

**Difficulty staircase:**  
- Floor: Simple "what would you commit to?" prompts with clear stakes.  
- Ceiling: Multi-layered scenarios where every commitment has legitimate counter-claims and the player must articulate a living relationship to all.

**Drive probing:**  
- Agency: Presence of first-person sovereign voice ("I choose..." vs. passive "one might...").  
- Communion: Relational language, acknowledgment of others' stakes, collaborative framing.  
- Eros: Forward-reaching language, willingness to name priorities, growth-orientation.  
- Agape: Grounding language, embodied commitment, return to what is already promised.

## 4. Item Pool

| Prompt Category | Example Seed | Shadow Targeted |
|---|---|---|
| Dual-commitment tension | "You promised A. B now needs you equally. Speak." | DA (paralysis in articulation) |
| Solo-vs-group | "You can achieve this alone faster. Why involve others?" | DAll (lone-achiever language) |
| Transcendence invitation | "What if none of these commitments ultimately matter?" | GA (bypass language trigger) |
| Prioritisation demand | "You must choose one to do FIRST. Speak your reasoning." | GAll (anti-hierarchy language) |
| Revision prompt | "You said X last session. Has anything changed?" | Integration tracking |
| Embodiment check | "Where in your body do you feel this commitment?" | Somatic grounding |

**Adaptive generation:** LLM generates prompts targeting detected shadow-language patterns. If hedging dominates, prompts invite clarity. If dismissiveness dominates, prompts invite relational depth.

## 5. Technical Requirements

- **LLM rubric dimensions:** Commitment-clarity (0–1), relational-depth (0–1), revision-openness (0–1), prioritisation-capacity (0–1), embodiment (0–1), shadow-marker density per quadrant.  
- **Shadow detection:** NLP markers — hedge-word frequency, passive voice ratio, transcendence-vocabulary density, dismissal-markers, qualification chains.  
- **Scoring:** Weighted composite of rubric dimensions; shadow-marker density as drag coefficient.  
- **State persistence:** Full response history; revision-tracking across sessions.  
- **Cross-line hooks:** Moral line (ethical language patterns), Intrapersonal line (self-awareness markers), Emotional line (affect-language).
