# Emotional / Green — Immersive-RPG Game Concept

> **Axis:** Ecological empathy — whether pluralistic empathy appears spontaneously in free-play.  **Why this axis for this module:** The ultimate test of Green emotional capacity is whether it emerges unprompted. In an open world with no explicit empathy instructions, does the player naturally attend to multiple perspectives, co-regulate, and bridge affects — or do shadows govern their spontaneous behaviour?

---

## 1. Game Identity

**Title:** The Living World  
**Core loop:** Player navigates an open narrative environment populated with NPCs who have rich, shifting emotional lives. No explicit empathy tasks are presented — the world simply IS emotionally complex. Player's spontaneous behaviour reveals their empathic ecology: who they attend to, how they respond to distress, whether they bridge or avoid, whether they maintain boundaries or dissolve.  
**Session length:** 8–15 minutes (infinite checkpoint).  
**Progression:** World emotional complexity increases; NPC relationships deepen; moral-emotional stakes escalate; transpersonal opportunities emerge.

## 2. Catalyst Delivery

**Catalyst type:** Ecological-behavioural in unstructured emotional environment.  
**Shadow surfacing:**
- DA surfaces as NPC fusion — player gravitates toward distressed NPCs compulsively, neglects own quest/needs, becomes emotionally reactive to every NPC encounter.
- DAll surfaces as NPC avoidance — player engages only with task-relevant NPCs, ignores emotional cues, treats the world as a problem-space rather than a relational field.
- GA surfaces as performed ecological empathy — player makes "empathic" choices that look good but don't track actual NPC states (responding to archetypes rather than individuals).
- GAll surfaces as genuine pluralistic engagement that avoids transpersonal depth — player co-regulates beautifully but disengages when the world offers moments of collective emotional deepening.

**Drive probing:** Agency via quest-maintenance alongside empathic engagement (doesn't abandon self for others); Communion via spontaneous relational behaviour; Eros via engagement with transpersonal moments; Agape via concrete attention to individual NPCs.

## 3. Game Design

**Mechanics:**
- **Open world:** Environment with 8–20 NPCs in various emotional states, relationships, and conflicts. Player has a personal quest (non-empathic goal) that provides Agency anchor.
- **Spontaneous encounters:** NPCs express emotional states through ambient behaviour — no prompts tell player to "help" or "attend." Player's choice to engage (or not) is the data.
- **Relational depth:** NPCs remember player's previous empathic engagement. Relationships deepen or atrophy based on attention quality.
- **Transpersonal moments:** Rare world-events where collective emotional experience is available (shared grief, communal joy, group crisis). Player's engagement with these reveals GA/GAll.
- **Boundary tests:** Some NPCs are emotionally demanding/manipulative. Player's response reveals DA vs. healthy boundary.

**Scoring:** Empathic breadth (how many NPCs attended to), depth (quality of engagement per NPC), boundary integrity (self-quest maintenance), spontaneity (unprompted empathic behaviour), ecological coherence (overall pattern of relational engagement), transpersonal openness (engagement with collective moments).

**Difficulty staircase:** NPC count, emotional complexity, manipulative-NPC frequency, transpersonal-moment intensity, competing demands on player attention.

## 4. Item Pool

- 40+ NPC profiles with emotional arcs (not static states — they evolve across sessions)
- 15 world-event scenarios (collective emotional experiences)
- 10 boundary-test NPCs (emotionally demanding/manipulative)
- 20 ambient emotional cues (environmental storytelling)
- 8 personal quest lines (non-empathic goals that test Agency maintenance)
- Transpersonal depth moments (rare, high-intensity collective experiences)
- Relational memory system (NPC responses shaped by player history)

## 5. Technical Requirements

- Open-world narrative engine with NPC emotional state machines (independent, reactive, memory-bearing)
- Behavioural telemetry: track player attention patterns, engagement duration, response quality — all implicit, no explicit prompts
- Relational memory: NPC-player relationship state persists across sessions
- Scoring model: ecological pattern analysis (not per-trial scoring) — aggregate behaviour over session reveals empathic ecology
- Shadow detection: compulsive-NPC-engagement + self-quest-neglect flags DA; NPC-avoidance + task-only-engagement flags DAll; archetype-response + individual-mismatch flags GA; collective-moment-disengagement flags GAll
- Session persistence continuous (no discrete trial boundaries)
- World-state evolution: NPCs change between sessions based on player's previous engagement (or neglect)
