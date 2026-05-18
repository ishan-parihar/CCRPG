# Interpersonal / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes interpersonal intelligence through LIVE RELATIONAL DYNAMICS — real-time coordination with allies, managing alliance health, navigating trust and betrayal as they unfold. This is interpersonal intelligence in its NATIVE habitat: actual relationships.
>
> **Why this axis for Interpersonal/Red:** At Red, the war-band IS the interpersonal test. Can you coordinate with allies in real-time? Can you maintain trust under pressure? Can you detect betrayal AS IT HAPPENS? Can you lead, follow, or coordinate based on what the moment requires? This modality tests interpersonal intelligence through DOING, not reading or planning.

---

## 1. Game Identity

- **Title:** "The War-Band"
- **Core mechanic:** The player operates within a live alliance — coordinating actions with NPC allies, maintaining alliance health through reciprocity, detecting and responding to betrayal in real-time, and navigating the relational dynamics of a Red-stage war-band.
- **Duration:** 4-8 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** First Alliance → Reciprocity → Trust Under Fire → Betrayal and Repair → The War-Band's Bond

---

## 2. Catalyst Delivery

**Catalyst:** "You have allies. They have needs. You have needs. The enemy is coming. Can you hold the war-band together?" The contact boundary is: "Can you DO interpersonal — not just read it or plan it, but LIVE it?"

**Unconscious response:**
- *Submergent:* How does the player ACTUALLY relate when the pressure is on? Do they dominate? Withdraw? Perform? Refuse commitment?
- *Emergent:* Can they maintain alliance health under increasing pressure? Can they repair rupture?

**Integration path:** Rewards SUSTAINED ALLIANCE HEALTH — the war-band stays together, coordinates effectively, and grows stronger over time. Not just one good interaction but MAINTAINED relational quality.

**Successful integration:** The player maintains a functional war-band — coordinating, reciprocating, detecting threats to the alliance, and repairing ruptures when they occur.

---

## 3. Game Design

### Setup
The War-Band: a live alliance in a Red-stage world. The player and 1-2 NPC allies face challenges together. Alliance health is a visible resource. Coordination produces power. Neglect produces decay. The aesthetic: Red-stage war-band on campaign, shared fire, shared danger, the bonds of warriors.

### Interaction
- **First Alliance:** Form an alliance; execute one coordinated action. (1-5)
- **Reciprocity:** Ally helps you; you help ally. Maintain the exchange. (5-15)
- **Trust Under Fire:** Coordinate under pressure (enemy attacking; timing matters). (15-30)
- **Betrayal and Repair:** Ally's behaviour shifts (or appears to); detect and respond. (30-50)
- **The War-Band's Bond:** Full alliance management — coordinate, reciprocate, detect, repair, lead, follow. (50+)

### Feedback
- Good coordination → "The war-band strikes as one. Your bond is your blade."
- Alliance health rising → "They trust you more. The bond strengthens."
- Alliance health falling → "The bond frays. What does your ally need?"
- Repair successful → "The rupture healed. Stronger for the breaking."

### Difficulty Adaptation
- Allies: 1 → 2; Pressure: low → moderate → high → adversarial
- Coordination complexity: simple timing → complex sequences → adaptive
- Betrayal subtlety: obvious → subtle → ambiguous (is it betrayal or misunderstanding?)
- Repair difficulty: easy (ally forgives quickly) → hard (ally needs sustained repair)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| First Alliance | 1-5 | 1 ally, simple coordination, no pressure |
| Reciprocity | 5-15 | Give-and-take; alliance health visible |
| Trust Under Fire | 15-30 | Coordination under combat pressure |
| Betrayal and Repair | 30-50 | Detecting shifts; repairing ruptures |
| The War-Band's Bond | 50+ | Full alliance management; 2 allies; adversity |

---

## 4. Item Pool Specification

### Item types
- **Coordination challenges:** Timed joint actions with allies
- **Reciprocity scenarios:** Give/receive exchanges maintaining balance
- **Pressure scenarios:** Coordination under threat
- **Betrayal/shift scenarios:** Ally behaviour changes requiring detection and response
- **Repair scenarios:** Alliance ruptures requiring mending

### Minimum pool size
- 25+ coordination, 20+ reciprocity, 20+ pressure, 15+ betrayal/shift, 10+ repair

### Drive/shadow mapping
- Command >> coordinate → dark-addiction; zero coordination → dark-allergy
- Performed teamwork without quality → golden-addiction; exits under pressure → golden-allergy

---

## 5. Technical Requirements

### Input types
- Timed tap (coordination); resource allocation (reciprocity); response selection (repair)

### Timing requirements
- Coordination timing within 300ms windows; alliance health updated per action; session-level reciprocity tracking

### NPC/AI requirements
- 1-2 ally NPCs with distinct personalities and needs
- Allies must RESPOND to player behaviour (reward coordination, punish neglect)
- Allies must have DETECTABLE betrayal/shift patterns at advanced levels
- Alliance health must be a visible, meaningful resource

### LLM requirements
- **Medium:** NPC ally dialogue, alliance dynamics narration, repair scenario generation. Core scoring algorithmic.

### State persistence
- Alliance health per ally; coordination quality history; reciprocity balance; betrayal detection accuracy; repair effectiveness; command/coordinate ratio; leadership patterns; drive/shadow signals; fatigue state; checkpoint position
