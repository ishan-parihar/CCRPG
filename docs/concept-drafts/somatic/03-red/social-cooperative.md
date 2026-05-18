# Somatic / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes somatic capacity through PHYSICAL COORDINATION WITH OTHERS — synchronising bodies, coordinating movement, and solving physical problems that require multiple bodies working together. This modality accesses the RELATIONAL dimension of body intelligence: not "can your body do it alone" but "can your body work WITH other bodies?"
>
> **Why this axis for Somatic/Red:** At Red, others' bodies are instruments — allies are force-multipliers, enemies are obstacles. But even egocentric physical coordination requires SOMATIC capacity: timing with another, matching rhythm, complementing movement. This axis tests whether the player's body can RELATE to other bodies — "If I strike high, you strike low."

---

## 1. Game Identity

- **Title:** "The War-Pack"
- **Core mechanic:** The player coordinates physical actions with NPC allies — synchronised strikes, complementary movements, rhythm-matching, and physical call-and-response — to overcome challenges that no single body can handle alone.
- **Duration:** 4-8 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Rhythm Matching → Synchronised Strikes → Complementary Movement → Physical Dialogue → The Pack Hunts

---

## 2. Catalyst Delivery

**Catalyst:** The game presents physical challenges that CANNOT be solved by one body alone — they require coordination. The contact boundary is: "Can your body attune to another body well enough to move together?" At Red, this is egocentric: "Can I USE their body alongside mine?"

**Unconscious response:**
- *Submergent:* The player's relationship to physical-with-others surfaces. Do they dominate (dark-addiction — my rhythm, my timing, my way)? Withdraw (dark-allergy — cannot be physically present with another)? Perform coordination without genuine attunement (golden-addiction)? Refuse to coordinate (golden-allergy)?
- *Emergent:* The pull toward genuine physical relating — can they feel another body's rhythm and JOIN it without losing their own?

**Integration path:** The game rewards GENUINE physical coordination — not just correct timing but FELT attunement. Two bodies moving as one because they FEEL each other, not because they're counting the same beat. The body learns: relating IS a physical skill.

**Successful integration:** The player demonstrates physical coordination appropriate to Red: can match another's rhythm, can synchronise a 2-action sequence, can complement another's movement — all while maintaining own physical centre.

---

## 3. Game Design

### Setup
The player is part of a war-pack — 2-3 NPC allies with distinct physical styles (fast/strong/steady). They face physical challenges that require coordinated body-action. The aesthetic: Red-stage hunting ground, pack dynamics, physical trust earned through shared movement. Firelight, open terrain, the sound of bodies moving together.

### Interaction
- **Rhythm Matching:** An ally drums a beat. The player matches it. Then they drum together — same rhythm, same force, same feel.
- **Synchronised Strikes:** "Strike the target TOGETHER. Same moment. Same force." Timing coordination with visible shared impact.
- **Complementary Movement:** "You strike high, they strike low. You hold, they advance." Different actions, same timing, shared goal.
- **Physical Dialogue:** "They move. You respond. Not copy — ANSWER with your body." Creative physical call-and-response.
- **The Pack Hunts:** Full coordinated physical challenge — multiple bodies, multiple actions, shared timing, shared goal. The hunt succeeds or fails as a pack.

### Feedback
- Successful coordination → amplified impact (two strikes together > two strikes apart); pack-howl celebration
- Failed coordination → visible desynchronisation; reduced impact; ally frustration
- Felt attunement (groove) → visual resonance between bodies; shared glow; pack-bond strengthening
- Mechanical coordination → correct but flat; no resonance; ally acknowledges timing but not connection
- The game distinguishes between "correct timing" and "genuine attunement" in feedback

### Difficulty Adaptation
- Number of coordination partners: 1 → 2 → 3
- Rhythm complexity: steady → syncopated → polyrhythmic
- Action complexity: same action → complementary → sequential
- Attunement demand: timing only → timing + force → timing + force + feel
- Coordination duration: single moment → short sequence → sustained

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Rhythm Matching | 1-5 | 1 partner, steady rhythm, generous timing window |
| Synchronised Strikes | 5-15 | Simultaneous action, tighter timing, force-matching |
| Complementary Movement | 15-30 | Different actions coordinated, role-assignment, sequencing |
| Physical Dialogue | 30-50 | Creative response, call-and-response, genuine attunement |
| The Pack Hunts | 50+ | Full multi-body coordination, complex challenges, sustained attunement |

---

## 4. Item Pool Specification

### Item types
- **Rhythm patterns:** Shared rhythms at varied tempos and complexities
- **Synchronisation targets:** Challenges requiring simultaneous action
- **Complementary configurations:** Role-assignments requiring different-but-coordinated actions
- **Dialogue seeds:** Starting movements for call-and-response sequences
- **Hunt scenarios:** Multi-body challenges requiring sustained coordination

### Minimum pool size
- 30+ rhythm patterns (tempo × complexity × duration)
- 25+ synchronisation targets (timing precision × force matching × number of bodies)
- 20+ complementary configurations (role types × coordination complexity)
- 15+ dialogue seeds (movement quality × response freedom)
- 10+ hunt scenarios (body count × challenge complexity × duration)

### Generation rules
- Rhythms generated from tempo + complexity parameters; always physically achievable
- Synchronisation targets scaled to demonstrated timing capacity
- Complementary roles assigned based on player's physical strengths
- Dialogue seeds matched to player's movement vocabulary
- Hunt scenarios composed from mastered coordination types

### Drive/shadow mapping
- Lead/follow ratio → Agency probing
- Self-centre maintenance during matching → Communion probing
- Familiar vs. novel partner engagement → Eros probing
- Simple coordination quality → Agape probing
- Inability to match slow rhythms → dark-addiction signal
- Timing degradation in shared space → dark-allergy signal
- Metronomic coordination without groove → golden-addiction signal
- Pattern-breaking in shared sequences → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Synchronised tap (timing coordination with NPC)
- Rhythm tap (sustained rhythm-matching)
- Force-matched tap (pressure/duration matching)
- Sequence tap (ordered actions coordinated with partner)
- Call-and-response (creative physical response to NPC movement)

### Timing requirements
- **Critical:** Millisecond precision for synchronisation measurement
- NPC timing must be consistent and predictable (modelable by the player)
- Audio-visual synchronisation critical (< 20ms A/V offset)
- Groove assessment requires micro-timing analysis (natural variation patterns)

### NPC/AI requirements
- **Critical:** 2-3 ally NPCs with distinct, consistent physical styles
- NPCs must be PREDICTABLE (the player can learn their rhythm)
- NPCs must RESPOND to player's timing (not just play a fixed pattern)
- NPC physical styles: Fast (quick, light), Strong (powerful, heavy), Steady (reliable, consistent)

### LLM requirements
- **Medium:** Scenario generation, coordination feedback, NPC dialogue
- Generates hunt scenarios within coordination-difficulty constraints
- Provides qualitative feedback on attunement quality
- Adapts NPC behaviour descriptions to player's coordination style
- Not required for core synchronisation scoring (algorithmic)

### State persistence
- Synchronisation accuracy history (per partner, per challenge type)
- Groove quality history (felt-attunement development)
- Force-matching accuracy (per partner)
- Coordination duration history (sustained attunement capacity)
- Lead/follow patterns (for drive-health assessment)
- Partner relationship history (familiarity, attunement quality per NPC)
- Drive-health signals from coordination behaviour
- Shadow signals from coordination patterns
- Fatigue state
- Checkpoint position and phase
