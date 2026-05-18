# Willpower / Red — Social-Cooperative Game Concept

> **Axis:** The social-cooperative axis probes willpower through RELATIONAL VOLITIONAL DYNAMICS — can you maintain your will alongside others? Can you coordinate commitments? Can you hold your vow when others break theirs? This modality accesses the RELATIONAL dimension of will.
>
> **Why this axis for Willpower/Red:** At Red, others are instruments — allies are force-multipliers. But even egocentric coordination requires volitional capacity: keeping your vow when your ally breaks theirs, committing to a shared goal, lending your will to another's cause. This axis tests whether will can RELATE.

---

## 1. Game Identity

- **Title:** "The Vow-Band"
- **Core mechanic:** The player coordinates volitional commitments with NPC allies — shared vows, synchronised effort, vow-lending, and maintaining personal commitment when the group's will wavers.
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Shared Vows → Synchronised Effort → Vow-Lending → Will Under Pressure → The Band's Oath

---

## 2. Catalyst Delivery

**Catalyst:** Volitional challenges that require MORE than one will — shared goals, coordinated commitment, mutual support. The contact boundary is: "Can your will work WITH another will without losing itself?"

**Unconscious response:**
- *Submergent:* Do they dominate (dark-addiction — "MY will leads")? Dissolve (dark-allergy — lose their will in the group)? Perform coordination without genuine commitment (golden-addiction)? Refuse to coordinate (golden-allergy)?
- *Emergent:* Can they hold their own will AND join another's? Can they lend volitional force without losing sovereignty?

**Integration path:** Rewards GENUINE volitional coordination — maintaining own commitment while supporting others. Neither domination nor dissolution but sovereign joining.

**Successful integration:** The player maintains volitional sovereignty in relational contexts — keeps own vows, supports allies' vows, coordinates timing, and holds when others waver.

---

## 3. Game Design

### Setup
The Vow-Band: a war-band of 2-3 NPC allies with distinct volitional styles (Burst-Willer/Steady-Willer/Fierce-Willer). They face challenges requiring coordinated commitment. The aesthetic: Red-stage war-camp, oath-circles, shared fire, the sound of vows spoken together.

### Interaction
- **Shared Vows:** Both declare the same goal; both must keep it. Synchronised commitment.
- **Synchronised Effort:** Hold together — same duration, same intensity, same timing.
- **Vow-Lending:** Player holds harder so ally can rest; lending volitional force.
- **Will Under Pressure:** Ally breaks their vow. Does the player maintain theirs?
- **The Band's Oath:** Full coordinated volitional challenge — multiple allies, multiple vows, shared timing.

### Feedback
- Successful coordination → amplified power (shared vows > solo vows); band-celebration
- Failed coordination → visible desynchronisation; reduced power
- Maintained vow when ally broke → "Your will stands alone. That is sovereignty."
- Lent will successfully → "You carried them. That is strength."

### Difficulty Adaptation
- Partners: 1 → 2 → 3; Coordination complexity: same vow → complementary → sequential
- Independence demand: supported → independent → ally-breaks-you-hold
- Lending demand: none → brief → sustained

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Shared Vows | 1-5 | 1 partner, same vow, generous timing |
| Synchronised Effort | 5-15 | Tighter timing, intensity-matching |
| Vow-Lending | 15-30 | Lending will to ally, holding harder for others |
| Will Under Pressure | 30-50 | Maintaining when ally breaks, sovereign will in group |
| The Band's Oath | 50+ | Full multi-ally coordination, complex shared campaigns |

---

## 4. Item Pool Specification

### Item types
- **Shared vow configurations:** Coordinated commitments at varied difficulties
- **Synchronisation targets:** Timing/intensity matching challenges
- **Lending scenarios:** Situations requiring volitional support of allies
- **Pressure scenarios:** Ally-failure situations testing sovereign will
- **Band challenges:** Multi-ally coordinated volitional campaigns

### Minimum pool size
- 30+ shared vow configs, 25+ sync targets, 20+ lending scenarios, 15+ pressure scenarios, 10+ band challenges

### Generation/drive/shadow mapping
- Lead/follow ratio → Agency; vow-maintenance when ally breaks → Communion; escalation patterns → Eros; simple coordination quality → Agape
- Slow-pace intolerance → dark-addiction; collapse without support → dark-allergy; mechanical coordination → golden-addiction; structure-breaking → golden-allergy

---

## 5. Technical Requirements

### Input types
- Synchronised tap/hold (timing coordination with NPC)
- Sustained hold (for lending and shared vows)
- Independent hold (maintaining when ally releases)

### Timing requirements
- Millisecond precision for synchronisation measurement
- NPC timing must be consistent and predictable

### NPC/AI requirements
- 2-3 ally NPCs with distinct volitional styles (Burst/Steady/Fierce)
- NPCs must be predictable (player can learn their patterns)
- NPCs must sometimes BREAK vows (testing player's sovereignty)

### LLM requirements
- **Medium:** Scenario generation, coordination feedback, NPC dialogue. Core scoring algorithmic.

### State persistence
- Coordination accuracy history; sovereignty maintenance rate; lending quality; partner relationship history; drive/shadow signals; fatigue state; checkpoint position
