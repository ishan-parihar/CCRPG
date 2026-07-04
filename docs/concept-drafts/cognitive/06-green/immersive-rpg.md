# Cognitive / Green — Immersive-RPG Game Concept

> **Axis:** Ecological perspectival cognition — whether multi-perspectival reasoning appears spontaneously in free-play.  **Why this axis for this module:** The ultimate test of Green cognition is not performance under instruction but spontaneous emergence in naturalistic contexts; immersive-RPG observes whether the player's default mode includes multi-perspectival awareness.

---

## 1. Game Identity

**Name:** The Fractured Commons
**Core loop:** Player navigates a living community where 4 factions hold genuinely different worldviews about a shared crisis. No quest markers tell the player to "consider all perspectives" — the game simply presents the world and observes how the player engages. All faction questlines are available simultaneously; player behaviour reveals cognitive default mode.
**Session length:** 10-20 minutes (infinite checkpoint, narrative persists across sessions).
**Felt experience:** A village at a crossroads where every NPC has a valid reason for their position — the player is a newcomer who must find their way without being told what "right" looks like.

## 2. Catalyst Delivery

**Catalyst type:** Ecological observation of spontaneous multi-perspectival behaviour in unstructured narrative.
**Shadow provocation:** All 4 shadows surface naturally through player choice patterns. DA = player talks to everyone but never commits to any faction's quest. DAll = player allies with one faction immediately, ignores others. GA = player attempts to "solve" the crisis with a meta-narrative move before understanding each faction. GAll = player engages all factions equally but refuses any quest that requires prioritising one over another.
**Drive engagement:** Agency = choosing faction engagement patterns. Communion = quality of NPC interactions across factions. Eros = narrative choices that reach toward integration. Agape = returning to factions previously engaged to maintain relationship.
**Progression:** Diagnosis (first 3 sessions: pure observation) → Healing (narrative events that provoke detected shadow) → Evolution (spontaneous multi-perspectival navigation).

## 3. Game Design

**Mechanics:**
- Open-world village with 4 faction districts, each with NPCs, lore, and questlines
- No explicit instruction to "consider all perspectives" — game presents, player chooses
- Faction reputation system: engagement with one faction visible to others (consequences)
- Dialogue trees with perspective-revealing options (player's choices coded for shadow patterns)
- Crisis escalation: if player ignores factions, crisis worsens (consequences for non-engagement)
- Integration moments: narrative beats where player can broker between factions (only available if sufficient multi-faction engagement)

**Behavioural telemetry (invisible to player):**
- Faction visit distribution (time, frequency, order)
- Dialogue option patterns (which perspective-types chosen)
- Quest acceptance/completion across factions
- NPC interaction depth (surface vs. deep dialogue trees)
- Integration-moment engagement (sought out vs. avoided)
- Response to faction conflict events (flee, side with one, attempt mediation)

**Shadow-specific narrative triggers:**
- DA detected: crisis deadline introduced (forces action)
- DAll detected: allied faction betrays player (forces perspective-shift)
- GA detected: meta-solution fails spectacularly (forces ground-level engagement)
- GAll detected: non-action leads to faction suffering (forces prioritisation)

## 4. Item Pool

**Factions:** 4 per crisis-scenario, each with distinct worldview, valid grievance, and internal coherence. 6 crisis-scenarios total (rotated across sessions).
**NPCs:** 8 per faction (32 total per scenario). Each has 3-depth dialogue tree revealing faction worldview progressively.
**Questlines:** 3 per faction per scenario (12 total). Quests are completable independently but some conflict across factions.
**Integration moments:** 4 per scenario, unlocked by multi-faction engagement thresholds. Each requires genuine understanding of ≥3 faction positions.
**Narrative events:** 8 per scenario (2 per shadow type), triggered by behavioural telemetry.

## 5. Technical Requirements

**World engine:** Phaser tile-map with faction-district zones. NPC state machines with dialogue-tree branching.
**Telemetry:** Continuous behavioural logging (faction visits, dialogue choices, quest states). Shadow inference model runs server-side every 60s of play-time.
**Narrative adaptation:** Event-trigger system responds to shadow probability vector. Narrative events injected seamlessly into world state.
**Metrics captured:** Full behavioural trace (faction engagement distribution, dialogue patterns, quest completion, integration-moment engagement). Shadow probability vector updated continuously.
**Storage:** ~500 bytes/minute of play (compressed behavioural trace + shadow vector).
**Accessibility:** Full text for all dialogue, adjustable movement speed, quest journal with faction-relationship summary, colour-coded faction indicators with shape redundancy.
