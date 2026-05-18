# Spiritual / Green — Immersive-RPG Game Concept

> **Axis:** Ecological pluralistic faith — whether interfaith appreciation appears spontaneously in free-play.  **Why this axis for this module:** The ultimate test of pluralistic faith is whether it emerges naturally when the player isn't being explicitly tested — does interfaith appreciation live in the player's spontaneous behavior, or only in their deliberate responses?

---

## 1. Game Identity

**Name:** The City of Many Temples  
**Core loop:** Player inhabits a richly-rendered city where multiple spiritual traditions coexist — temples, shrines, sacred groves, meditation halls, churches, mosques, synagogues, and indigenous sacred sites. The player is free to explore, engage, ignore, or interact with any tradition's spaces and practitioners. No explicit spiritual tasks are assigned — the game observes what the player does spontaneously with spiritual diversity.  
**Session length:** 8–15 minutes per checkpoint (longer free-play sessions).  
**Infinite checkpoint:** The city evolves based on player behavior; traditions the player engages with deepen their presence; ignored traditions fade. The city becomes a mirror of the player's actual spiritual ecology.

## 2. Catalyst Delivery

**Catalyst type:** Unstructured encounter with spiritual diversity — ecological validity through free-play observation.  
**Shadow surfacing:** DA surfaces as rapid temple-hopping — visiting every sacred space briefly without lingering, collecting experiences without depth. DAll surfaces as avoiding sacred spaces entirely or entering them only to observe architecture/history without spiritual engagement. GA surfaces as immediately seeking "the universal temple" or trying to merge traditions' spaces rather than appreciating each. GAll surfaces as spending equal time in every space with rigid fairness rather than following genuine attraction.  
**Drive probes:** Eros observed through spontaneous attraction to unfamiliar sacred spaces. Agape observed through return-visits to spaces already explored (deepening). Agency observed through confident navigation of the spiritual landscape without anxiety. Communion observed through spontaneous engagement with tradition-practitioners encountered in the city.

## 3. Game Design

**World design:** A living city with 12+ distinct sacred districts, each architecturally and atmospherically authentic to its tradition. Districts have: outer zones (public, accessible), inner zones (require relationship/trust to access), and deep zones (require sustained engagement to discover). NPCs populate each district with varying levels of openness to outsiders.  
**Emergent encounters:** Random events occur — a funeral procession from one tradition passes through another's district; a festival invites participation; a practitioner in crisis asks for help; two traditions' celebrations conflict in shared space. Player response is observed but never forced.  
**Depth mechanics:** Each tradition's space has hidden layers that only reveal themselves through sustained engagement — a monastery's inner garden, a mosque's Sufi circle, a synagogue's Kabbalistic study group. These reward depth over breadth.  
**Shadow-mode triggers:** When DA pattern detected (rapid movement, no lingering), the city subtly slows — distances increase, making temple-hopping costly. When DAll detected (avoidance of sacred spaces), secular NPCs begin discussing spiritual experiences naturally. When GA detected (seeking universal space), the city presents irreducible differences between traditions. When GAll detected (rigid equality), the city presents situations where one tradition's response is clearly more developed.

## 4. Item Pool

**Sacred spaces:** 12+ fully-realized tradition-districts with 3 depth-layers each = 36+ distinct sacred environments.  
**NPC population:** 50+ tradition-practitioners with individual personalities, stories, and relationship-progression arcs. NPCs remember the player across sessions.  
**Emergent events:** 100+ scripted events that trigger based on player location, time-in-city, relationship-levels, and shadow-profile. Events range from subtle (overhearing a prayer) to dramatic (interfaith crisis requiring response).  
**Discovery items:** Sacred texts, practice instructions, ritual objects, and wisdom-teachings hidden throughout the city — each requiring tradition-specific engagement to find and understand.  
**City evolution:** The city's state reflects cumulative player behavior — neglected districts decay; deeply-engaged districts flourish and reveal new content.

## 5. Technical Requirements

**Behavioral telemetry:** Movement patterns (speed, lingering-duration, return-frequency per district), interaction patterns (who player talks to, how long, how deep), exploration patterns (breadth vs. depth of city coverage), spontaneous-engagement frequency (unprompted sacred participation).  
**Scoring:** Entirely observational — no explicit scores shown to player. Internal scoring based on: depth-of-engagement per tradition (time × interaction-quality × return-frequency), breadth-of-genuine-engagement (traditions engaged above threshold), spontaneous-sacred-behavior (unprompted participation in practices), and relationship-depth with NPCs.  
**Shadow indicators:** DA = high movement-speed + low lingering + many districts visited briefly. DAll = sacred-space avoidance + analytical-only interactions. GA = seeking connections between traditions before engaging any deeply. GAll = perfectly-equal time distribution + discomfort when depth-differences emerge.  
**World persistence:** Full city-state saved between sessions. NPC relationships, district evolution, discovered content, and event-history all persist. The city is a living record of the player's spiritual ecology.  
**Performance:** LOD system for district rendering; only active district fully loaded. NPC AI runs on behavior-trees with LLM-enhanced dialogue for deep interactions.
