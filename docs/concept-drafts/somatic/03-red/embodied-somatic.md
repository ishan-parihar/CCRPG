# Somatic / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes somatic capacity THROUGH THE BODY ITSELF — body intelligence expressed as body-action. This is "somatic squared": the most direct, unmediated access to body intelligence. No words, no choices, no planning — just the body doing what the body does, and the quality of that doing revealing the depth of somatic intelligence.
>
> **Why this axis for Somatic/Red:** For the somatic line, this IS the home modality. The body probing itself through itself. At Red, this means: raw physical expression — power, speed, rhythm, presence — experienced and assessed through the felt-sense of movement itself. Not reaction-time scores (deterministic) but the QUALITY of embodiment: is the movement alive? Present? Powerful? Or mechanical, dissociated, rigid?

---

## 1. Game Identity

- **Title:** "The Living Blade"
- **Core mechanic:** The player engages in free-form physical expression — movement sequences, rhythm creation, power expression, stillness practice — where the QUALITY of embodiment (not just accuracy or speed) is the primary assessment. The body speaks through movement, and the game listens.
- **Duration:** 3-8 minutes per session (fatigue-aware; infinite checkpoints)
- **Internal progression:** Power Expression → Rhythm Creation → Dynamic Stillness → Flow States → The Body Speaks

---

## 2. Catalyst Delivery

**Catalyst:** The game invites the body to EXPRESS rather than PERFORM. The contact boundary is: "Can you move with genuine presence — not just correctly, but ALIVE?" At Red, this means: can you strike with your whole self? Can you hold with genuine power (not just duration)? Can you rhythm with felt-sense (not just timing)?

**Unconscious response:**
- *Submergent:* The player's QUALITY of embodiment surfaces. Is the movement alive or mechanical? Present or dissociated? Powerful or performative? The body reveals its relationship to itself.
- *Emergent:* The pull toward deeper embodiment — can the movement become more present? More alive? More integrated?

**Integration path:** The game rewards PRESENCE in movement — not just accuracy. A strike that is fully embodied (whole-body engagement, breath-integrated, present) scores higher than one that is technically correct but physically flat. The body learns: being HERE is the skill.

**Successful integration:** The player moves with genuine presence — power that comes from inhabiting the body fully, rhythm that comes from felt-sense rather than counting, stillness that is alive rather than frozen.

---

## 3. Game Design

### Setup
A sacred training space — not the Forge (that's deterministic) but the DOJO: a space for the body to speak. Dim firelight, open floor, the sound of breath. The Blade-Keeper (NPC) observes but rarely speaks. The space itself invites embodiment. Aesthetic: Red-stage but intimate — personal power, not competitive power.

### Interaction
- **Power Expression:** "Strike the target. Not fast — POWERFUL. Let your whole body be in it." (Force + presence measurement)
- **Rhythm Creation:** "Find YOUR rhythm. Not the drum's — yours. Let your body set the beat." (Self-generated rhythm quality)
- **Dynamic Stillness:** "Hold. Be still. But be ALIVE in the stillness. Not frozen — present." (Stillness quality — alive vs. dead)
- **Flow States:** "Move continuously. No stopping, no thinking. Let the body lead." (Sustained movement quality — presence over time)
- **The Body Speaks:** "Your body has something to say. Let it move however it needs to." (Free expression — the most open prompt)

### Feedback
- Present movement → the game-world RESPONDS (environment brightens, resonates, amplifies)
- Dead/mechanical movement → the game-world dims, goes quiet, withdraws
- Powerful movement → impact effects, screen shake, satisfying sound
- Alive stillness → subtle glow, breath-synchronised ambient pulse
- The feedback is FELT, not scored — the player experiences the quality of their embodiment through the world's response

### Difficulty Adaptation
- Presence duration: 3s → 5s → 10s → 30s → sustained
- Movement complexity: single gesture → sequence → continuous flow
- Stillness challenge: no interference → mild interference → strong interference
- Expression freedom: guided → semi-guided → fully free
- Integration demand: single quality → multiple qualities simultaneously

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Power Expression | 1-5 | Single powerful gestures; force + presence; short duration |
| Rhythm Creation | 5-15 | Self-generated rhythm; sustained timing; body-led beat |
| Dynamic Stillness | 15-25 | Alive stillness; presence without movement; increasing duration |
| Flow States | 25-40 | Continuous movement; sustained presence; body-led exploration |
| The Body Speaks | 40+ | Free expression; full embodiment; the body as autonomous intelligence |

---

## 4. Item Pool Specification

### Item types
- **Movement invitations:** Prompts for specific qualities of movement (powerful, gentle, fast, slow, alive, still)
- **Rhythm seeds:** Starting tempos/patterns for self-generated rhythm development
- **Stillness challenges:** Contexts for alive stillness (with varied interference types)
- **Flow prompts:** Invitations for sustained movement with varied qualities
- **Free expression contexts:** Open invitations with varied emotional/physical framing

### Minimum pool size
- 30+ movement invitations (quality × intensity × duration combinations)
- 20+ rhythm seeds (tempo × complexity × duration)
- 20+ stillness challenges (duration × interference × context)
- 15+ flow prompts (quality × duration × freedom level)
- 15+ free expression contexts (emotional tone × physical framing × duration)

### Generation rules
- Invitations generated from quality vocabulary (power, presence, aliveness, rhythm, stillness)
- Difficulty scales with duration, complexity, and freedom (more freedom = harder to assess)
- All invitations must be achievable through TOUCH INPUT (not actual body movement — the phone IS the body-interface)
- Presence quality assessed through input characteristics (pressure variation, timing consistency, micro-adjustments)
- LLM generates contextual framing; algorithmic systems assess input quality

### Drive/shadow mapping
- Self-generated movement quality → Agency probing
- Mirroring/response quality → Communion probing
- Mastered-movement satisfaction → Eros probing
- Simple-presence quality → Agape probing
- Stillness intolerance → dark-addiction signal
- Flat/mechanical input quality → dark-allergy signal
- Precision without force → golden-addiction signal
- Structure-breaking → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- **Pressure-sensitive touch** (primary — force expression through press intensity)
- **Sustained hold** (stillness — maintaining contact with specific quality)
- **Rhythmic tap** (self-generated rhythm — timing and force patterns)
- **Continuous gesture** (flow — sustained movement across screen with varied pressure/speed)
- **Multi-touch** (complex expression — multiple contact points with varied qualities)

### Timing requirements
- Millisecond precision for rhythm assessment
- Pressure sampling at ≥60Hz for force-expression quality
- Continuous input tracking for flow-state assessment
- No external timing demands (player sets own pace) — but internal timing quality is assessed

### NPC/AI requirements
- Blade-Keeper NPC: minimal verbal presence; observes; offers rare, potent feedback
- Mirror NPC: provides movement for mirroring/response challenges
- The ENVIRONMENT is the primary "NPC" — it responds to embodiment quality

### LLM requirements
- **Medium:** Invitation generation, qualitative feedback, contextual framing
- Generates movement invitations adapted to player's edge
- Provides felt-sense feedback (not just scores): "That felt alive" vs. "That felt mechanical"
- Core assessment is algorithmic (input signal analysis), not LLM-dependent

### State persistence
- Presence quality history (running estimate of embodiment depth)
- Force expression patterns (power range, consistency, aliveness)
- Rhythm quality history (groove, variation, self-generation capacity)
- Stillness tolerance history (duration, quality, interference tolerance)
- Flow sustainability history (duration of sustained presence)
- Drive-health signals from movement quality patterns
- Shadow signals from embodiment patterns
- Fatigue state (somatic load tracking)
- Checkpoint position and phase
