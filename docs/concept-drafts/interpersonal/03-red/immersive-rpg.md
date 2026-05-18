# Interpersonal / Red — Immersive-RPG Game Concept

> **Axis:** The immersive-rpg (ecological) axis probes interpersonal intelligence through SPONTANEOUS RELATIONAL BEHAVIOUR in an open game world — not structured interpersonal tasks but free relational engagement in an environment populated with agents who have their own intentions, alliances, and conflicts. How does the player's interpersonal life LIVE when nobody's testing it?
>
> **Why this axis for Interpersonal/Red:** The other 6 modalities probe interpersonal intelligence through structured challenges. This one observes it in the wild. At Red, the player navigates a world of agents: do they read others spontaneously? Do they form alliances naturally? Do they detect betrayal without being prompted? Their SPONTANEOUS relational behaviour reveals their genuine interpersonal structure.

---

## 1. Game Identity

- **Title:** "The War-World"
- **Core mechanic:** An open-world Red-stage environment where interpersonal intelligence is assessed through the QUALITY of spontaneous relational engagement — reading NPCs without being asked, forming alliances naturally, coordinating without prompts, and navigating the social landscape of a living world.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Social Awareness → Alliance Formation → Relational Navigation → Social Leadership → The Living World

---

## 2. Catalyst Delivery

**Catalyst:** The world is populated with AGENTS. They have intentions. They form alliances. They betray. They trade. The player is never told "read this NPC" — they must NOTICE, ENGAGE, and NAVIGATE spontaneously.

**Unconscious response:**
- *Submergent:* The player's NATURAL interpersonal style surfaces. Do they dominate every interaction? Avoid all NPCs? Perform sophistication? Refuse commitment? Their ecological behaviour reveals their genuine structure.
- *Emergent:* Can they engage more of the social world? Read subtler agents? Navigate more complex relational terrain?

**Integration path:** The world rewards interpersonal intelligence NATURALLY. Players who read NPCs gain allies. Players who coordinate gain power. Players who maintain alliances gain compounding advantages. The reward is POWER (Red-resonant).

**Successful integration:** The player demonstrates interpersonal intelligence SPONTANEOUSLY — reading, coordinating, maintaining, and navigating without being prompted.

---

## 3. Game Design

### Setup
An open Red-stage world populated with agents. NPCs have intentions, form their own alliances, trade, fight, and betray. The player navigates freely. Social intelligence produces tactical advantage. Social blindness produces disadvantage. The aesthetic: Red-stage territory — war-camps, trading posts, contested borders, roaming war-bands.

### Interaction
- **Social navigation:** Moving through a world where relational awareness produces advantage
- **Spontaneous intent-reading:** Noticing NPC intentions without being prompted
- **Natural alliance formation:** Forming alliances through organic interaction
- **Coordination in context:** Coordinating with allies during world-events (raids, defences, hunts)
- **Alliance maintenance:** Returning to allies, reciprocating, maintaining bonds

### Feedback
- Natural consequences: interpersonal intelligence → allies, resources, territory, power
- Natural consequences: interpersonal blindness → isolation, missed opportunities, vulnerability
- No explicit "social score" — the world IS the feedback

### Difficulty Adaptation
- NPC intent clarity scales with demonstrated reading accuracy
- Alliance opportunities scale with demonstrated coordination quality
- Social complexity scales with demonstrated navigation capacity
- Betrayal subtlety scales with demonstrated detection ability

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Social Awareness | 1-5 | Obvious NPCs; clear intentions; simple world |
| Alliance Formation | 5-15 | Alliance opportunities; coordination contexts |
| Relational Navigation | 15-30 | Multi-NPC dynamics; competing factions |
| Social Leadership | 30-50 | Leading alliances; managing multiple relationships |
| The Living World | 50+ | Full social ecology; all capacities tested spontaneously |

---

## 4. Item Pool Specification

### Item types
- **NPC agent configurations:** Characters with varied intentions, alliance preferences, and betrayal thresholds
- **Social zones:** Areas with distinct relational dynamics (trading posts, war-camps, neutral ground)
- **World events:** Situations that create relational opportunities or pressures
- **Faction dynamics:** Competing groups the player can navigate between
- **Returning NPCs:** Characters who remember past interactions and compound rewards

### Minimum pool size
- 20+ NPC configs, 15+ social zones, 20+ world events, 10+ faction dynamics, 15+ returning NPCs

### Drive/shadow mapping
- All-dominance interactions → dark-addiction; zero NPC engagement → dark-allergy
- High activity + low quality → golden-addiction; high quality + zero persistence → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap (interact, approach, coordinate); hold (maintain, assert); swipe (navigate, avoid)

### Timing requirements
- Session-level tracking (relational engagement patterns, alliance health over time)
- No millisecond precision needed; minutes-level measurement of relational patterns

### NPC/AI requirements
- NPCs with persistent intentions and alliance preferences
- NPCs must RESPOND to player's relational behaviour (reward coordination, punish domination/neglect)
- NPCs must REMEMBER past interactions (returning NPC system)
- World must have consistent social dynamics across sessions

### LLM requirements
- **High:** World generation, ecological assessment, NPC agent behaviour, narrative adaptation
- Detects spontaneous relational engagement from behaviour patterns
- Evaluates interpersonal intelligence quality without explicit tasks

### State persistence
- Full world state; NPC relationship states; alliance health per NPC; reading accuracy history; coordination patterns; alliance persistence; faction standings; drive/shadow signals; fatigue state; checkpoint position
