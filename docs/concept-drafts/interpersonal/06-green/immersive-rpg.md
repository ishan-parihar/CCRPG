# Interpersonal / Green — Immersive-RPG Game Concept

> **Axis:** Ecological authentic relating — whether mutual vulnerability appears spontaneously in free-play.  **Why this axis for this module:** The ultimate test of Green interpersonal capacity is not whether the player can perform authenticity when prompted, but whether genuine mutuality emerges naturally in an open relational environment.

---

## 1. Game Identity

**Name:** The Living Village  
**Core loop:** Player inhabits a persistent relational world populated by NPC characters with their own lives, needs, conflicts, and growth-edges. No explicit relational tasks are assigned — the game observes whether and how the player initiates authentic relating, responds to relational bids, navigates emergent conflicts, and deepens connections spontaneously.  
**Session length:** 8–15 minutes per checkpoint (one village day).  
**Infinite checkpoint:** Player exits at any moment; world state persists.

## 2. Catalyst Delivery

**Shadow surfacing:** GAll surfaces when player maintains comfortable relational patterns but avoids NPCs who invite deeper territory — staying in "good enough" relationships without growth. GA surfaces when player gravitates toward "wise elder" NPCs and performs transpersonal connection while avoiding messy one-to-one vulnerability with peers.  
**Drive probing:** Agency measured by whether player initiates relational contact (vs. only responding) and maintains boundaries when NPCs push. Communion measured by quality of spontaneous relational engagement. Eros measured by whether player seeks relational growth-edges or stays comfortable. Agape measured by whether player returns to embody presence in existing relationships or constantly seeks new connections.  
**Catalyst→Experience→Integration:** The village presents relational opportunities at player's edge. NPCs make bids, conflicts emerge, deepening invitations appear. The game observes player's spontaneous response — no prompting, no forced choices.

## 3. Game Design

**World structure:** A village of 12–20 NPCs with interconnected relationships. NPCs have daily routines, personal struggles, relational histories, and evolving emotional states. The village has communal spaces (gathering hall, garden, workshop) and private spaces (homes, meditation spots).  
**Relational ecology:**  
- *Bids:* NPCs make relational bids of varying depth — casual greeting, sharing a concern, asking for help, offering vulnerability, inviting conflict resolution.  
- *Emergent conflicts:* NPC-NPC conflicts arise that the player can engage with or avoid. How (and whether) the player engages reveals shadow patterns.  
- *Deepening arcs:* Each NPC has a relational arc that deepens over sessions if the player engages authentically. Arcs stall if player performs or avoids.  
- *Community dynamics:* Group tensions, celebrations, and crises emerge that require collective relational navigation.  
**Measurement:** Behavioural observation — which NPCs player approaches, how long exchanges last, whether player initiates or only responds, whether player engages conflict or avoids, whether relational depth increases over sessions.  
**Adaptive difficulty:** Village complexity increases as player demonstrates capacity. New NPCs with more challenging relational styles arrive. Conflicts become more nuanced.

## 4. Item Pool

**Structure:** 20+ NPC archetypes with procedurally varied personalities. Each archetype has 5+ relational arcs. Village configurations rotate to prevent over-familiarity.  
**Shadow-specific NPCs:** DA-triggering NPCs are emotionally hungry and boundary-dissolving. DAll-triggering NPCs are warm and persistently inviting. GA-triggering NPCs are "spiritual" and invite performed transcendence. GAll-triggering NPCs invite uncomfortable deepening.  
**Emergent events:** 50+ village events (conflicts, celebrations, crises, arrivals, departures) that create relational catalysts without forcing player response.  
**Refresh:** Village configurations rotate on 30-day cycles. NPC arcs evolve based on player engagement. No two village-days are identical.

## 5. Technical Requirements

**World simulation:** Persistent NPC state (emotional, relational, daily-routine). NPC-NPC interactions simulated off-screen. Event generation based on village state + player shadow profile.  
**Behavioural tracking:** Player movement, interaction initiation, exchange duration, response quality (LLM-scored), conflict engagement/avoidance, deepening trajectory per NPC relationship.  
**Scoring:** Shadow patterns derived from behavioural clusters over 5+ sessions. No single-session diagnosis. Drive-health updated from spontaneous relational behaviour (highest ecological validity of all modalities).  
**Adaptive engine:** Village event generation calibrated to under-probed shadows. NPC bid frequency adjusted to player's engagement level. Cross-modality validation flags at 0.7 confidence.  
**Rendering:** Top-down or isometric village with character sprites. Dialogue system for NPC exchanges. Environmental storytelling (NPC positions, activities, expressions visible before interaction).  
**Accessibility:** Full keyboard navigation. Screen-reader narration of village state. Adjustable game speed. No reflex requirements.
