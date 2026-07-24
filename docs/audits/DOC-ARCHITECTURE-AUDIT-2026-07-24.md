# Document Architecture Audit: Original Vision vs Current Reality

**Date:** July 24, 2026
**Auditor:** Buffy (AI agent)
**Purpose:** Map the gap between what the project was designed to be and what it has become, then recommend an optimized doc structure that prevents successor AI agents from getting confused.

---

## 1. Executive Summary

The documentation set has **three layers of confusion** that will actively mislead successor agents:

1. **Dead documents that still exist** — plans, audits, and architectures from the ATB-combat era that are superseded but not removed
2. **Redundant documents that overlap** — multiple audit reports saying the same thing in different words
3. **Missing documents that should exist** — the curriculum system, shadow work engine, and polarity engine have no current-state documentation

**The single most confusing thing for a successor agent:** The project is described as an "RPG" in most docs, but it is actually a **contemplative practice, education system replacement, and healing tool** that uses game mechanics as its delivery vehicle. The naming change from CCRPG to Mysterium reflects this evolution, but most docs haven't been updated to reflect the new identity.

---

## 2. What Was Intended (Original Vision)

### 2.1 The Original Vision (docs/00-vision.md, v1)

> "A fighting game where every spell you cast is a working-memory test, every parry is an inhibitory-control test, every choice is a moral test."

**Original intent:** A cognitive-training tool disguised as an action-RPG. The game mechanics ARE validated cognitive assessments embedded in real-time combat.

### 2.2 The Original Architecture

| Component | Original Design | Status |
|---|---|---|
| Combat system | ATB (Active Time Battle) with cognitive overlays | ❌ **Removed** — replaced by assessment modules |
| Enemy system | Side-characters, mini-bosses, main bosses | ❌ **Removed** — replaced by encounter/assessment modules |
| Player state | PlayerProfile (HP, Mana, Damage, Equipment) | ❌ **Removed** — replaced by Significator |
| Progression | XP → level-up → stage advancement | ❌ **Removed** — replaced by demonstration-based progression |
| Multiplayer | Colyseus real-time multiplayer | ❌ **Deferred** — single-player MVP |
| Rendering | Phaser 3 game engine | ❌ **Removed** — replaced by SvelteKit WebUI |

### 2.3 What the Project Was SUPPOSED to Be

Per REQUIREMENTS.md, the original 87-document plan envisioned:

```
docs/
├── foundations/ (11 docs) — theoretical substrate
├── lines/ (9 docs) — one per line of intelligence
├── stages/ (9 docs) — one world bible per stage
├── progression/ (7 docs) — how the player grows
├── narrative/ (5 docs) — story, world, characters
├── architecture/ (11 docs) — the engineering contract
├── ux/ (5 docs) — what the player sees and feels
├── validation/ (4 docs) — is this game actually doing what it claims?
└── roadmap/ (4 docs) — when, in what order, with what risks
```

**Total:** 87 documents covering combat, enemies, multiplayer, rendering, persistence, analytics, and validation.

---

## 3. What the Project Has Become

### 3.1 The Actual System (2026-07-24)

The project has evolved into **six distinct-but-fused functions**:

| Function | What It Does | Scale |
|---|---|---|
| **Developmental Assessment Engine** | 64 modules (8 lines × 8 stages), 1,280 items, 7 modalities | Micro (per-encounter) |
| **Holonic Curriculum System** | 5-level holarchy, knowledge graph, 6-level depth assessment, spaced repetition, research pipeline | Meso (knowledge acquisition) |
| **Shadow Work Engine** | 4-quadrant shadow model, 256 configurations, detection→surfacing→integration | Micro (per-shadow) |
| **Polarity & Choice Engine** | 64-cell polarity catalogue, STO/STS crystallization, harvest mechanics | Macro (lifetime arc) |
| **Incarnation Architecture** | ONE world with 8 perceptual layers, transformation as layer-shift | Macro (world-system) |
| **Veil of Forgetting** | All mechanics operate invisibly | Meta (experiential principle) |

### 3.2 What Was Built vs What Was Planned

| Planned | Built | Status |
|---|---|---|
| ATB combat | Assessment modules | ✅ Replaced |
| PlayerProfile | Significator | ✅ Replaced |
| 64 modules (8×8) | 64 modules loaded | ✅ Complete |
| Encounter scheduler | 7-criteria priority formula | ✅ Working |
| CCI engine | 5-dimension composite | ✅ Working |
| Auto-mode strategy | 9 themes, weight biasing | ✅ Working |
| Transformation detection | Threshold detection | ✅ Working |
| 7 game modalities | 7 modalities defined | ✅ Defined |
| Multiplayer | Single-player | ❌ Deferred |
| Phaser rendering | SvelteKit WebUI | ✅ Replaced |
| 11 architecture docs | 1 architecture doc (STAGE-ASSESSMENT-ARCHITECTURE.md) | ⚠️ Partial — 10 missing |
| 5 UX docs | 1 UX doc (FRONTEND-AUDIT-AND-REFACTOR-PLAN.md) | ⚠️ Partial — 4 missing |
| 4 validation docs | 0 validation docs | ❌ Never written |
| 4 roadmap docs | 0 roadmap docs | ❌ Never written |
| Curriculum system | Full implementation | ✅ Built (not in original plan) |
| Shadow work engine | Full implementation | ✅ Built (not in original plan) |
| Polarity engine | Full implementation | ✅ Built (not in original plan) |

---

## 4. The Three Layers of Confusion

### 4.1 Dead Documents (Superseded but Still Present)

These documents are from the ATB-combat era and will actively mislead successor agents:

| Document | Why It's Dead | Action |
|---|---|---|
| `docs/archive/plan.md` | Original ATB-based conceptual blueprint | Archive only |
| `docs/archive/IMPLEMENTATION-PLAN.md` | Superseded by UNIFIED-IMPLEMENTATION-PLAN.md | Archive only |
| `docs/archive/combat-philosophy.md` | Predicated on ATB combat | Archive only |
| `docs/archive/enemy-taxonomy.md` | "Enemy" concept replaced by encounter modules | Archive only |
| `docs/archive/PROFILE-MAPPING-AUDIT.md` | Audits PlayerProfile (now replaced by Significator) | Archive only |
| `docs/root-archive/UX-AUDIT-REPORT-R*.md` (10 files) | Historical audit rounds, superseded by curriculum audits | Archive only |
| `docs/root-archive/EFFICACY-AUDIT-REPORT.md` | Historical, superseded by RED-TEAM-AUDIT-DEFINITIVE.md | Archive only |
| `docs/root-archive/AGENTIC-ARCHITECTURE-PLAN.md` | References PlayerProfile and ATB combat | Archive only |
| `docs/root-archive/AGENTIC-SYSTEM-AUDIT-R*.md` (3 files) | Historical audit rounds | Archive only |
| `docs/root-archive/PROFILING-SYSTEM-DESIGN.md` | References PlayerProfile | Archive only |
| `docs/root-archive/PROFILING-ARCHITECTURE-AUDIT.md` | References PlayerProfile | Archive only |
| `docs/root-archive/CCRPG-FRONTEND-ARCHITECTURE-PLAN.md` | References Phaser + PlayerProfile | Archive only |
| `docs/root-archive/SVELTE-FRONTEND-AUDIT.md` | Historical, superseded | Archive only |
| `docs/root-archive/FRONTEND-IMPLEMENTATION-WORKLOG.md` | Historical worklog | Archive only |
| `docs/root-archive/MVP-BLUEPRINT.md` | Still referenced as binding build plan in REQUIREMENTS.md but in root-archive — confusing | Move to docs/ or update reference |
| `docs/root-archive/UNIFIED-IMPLEMENTATION-PLAN.md` | Still referenced as binding build plan in INDEX.md but in root-archive — confusing | Move to docs/ or update reference |
| `docs/root-archive/BUGS-AND-GAPS.md` | Likely redundant with audit reports | Archive only |

**Total:** ~33 documents that are dead but still present.

### 4.2 Redundant Documents (Overlapping Content)

These documents say essentially the same thing:

| Group | Documents | Overlap |
|---|---|---|
| **Red-Team Audits** | RED-TEAM-AUDIT.md, RED-TEAM-AUDIT-FULL-FLOW.md, RED-TEAM-AUDIT-CURRENT-STATE.md, RED-TEAM-AUDIT-CATALYST-TRAJECTORY.md, RED-TEAM-AUDIT-DEFINITIVE.md | All 5 say "the game is a personality test with RPG aesthetics" — the DEFINITIVE supersedes all 4 |
| **Curriculum Audits** | CURRICULUM-ARCHITECTURE-AUDIT-2026-07-23.md, FRESH-USER-UX-AUDIT-CURRICULUM.md | Both say "curriculum engine complete but invisible to players" |
| **Ponytail Audits** | PONYTAIL-AUDIT.md, PONYTAIL-AUDIT-v2.md, REALIGNED-PLAN.md | All 3 describe the same CLI-as-spec refactor |
| **Frontend Audits** | FRONTEND-AUDIT-AND-REFACTOR-PLAN.md, HARDCODE-AUDIT.md | Overlapping concerns about frontend quality |
| **HoloOS Audits** | AUDIT-HOLOOS-ALIGNMENT.md, HOLOOS-DEVIATION-ANALYSIS.md | Both analyze HoloOS alignment |
| **UX Audit Rounds** | UX-AUDIT-REPORT.md through UX-AUDIT-REPORT-R10.md (11 files) | 11 rounds of the same audit pattern |

**Total:** ~25 documents that are redundant with each other.

### 4.3 Missing Documents (Should Exist but Don't)

| Missing Document | Why It's Needed | Current Coverage |
|---|---|---|
| **Curriculum System Architecture** | The curriculum system is a complete education replacement — it needs its own architecture doc | Foundations/29-34 cover theory; no implementation doc |
| **Shadow Work Engine Architecture** | The shadow work engine is a core system — it needs its own architecture doc | Foundations/10 covers theory; no implementation doc |
| **Polarity Engine Architecture** | The polarity engine drives STO/STS crystallization — it needs its own architecture doc | Foundations/19 covers theory; no implementation doc |
| **Current State Documentation** | What actually exists in the codebase RIGHT NOW | No doc exists — only audit reports from different dates |
| **Curriculum Upgrade Plan (Current)** | Foundations/36 is a draft; it needs to reflect what's actually been built | Foundations/36 still says "draft (awaiting user ratification)" |

---

## 5. The Identity Crisis

The most confusing thing for a successor agent is the **identity crisis** across documents:

| Document | How It Describes the Project |
|---|---|
| docs/00-vision.md | "A fighting game where every spell you cast is a working-memory test" |
| README.md | "A contemplative-assessment RPG whose every encounter is the gamification of a validated developmental assessment" |
| AGENTS.md | "CCRPG is a Cognitive-Capacity-Driven RPG where every gameplay verb is a gamified developmental assessment" |
| package.json | "Mysterium — a contemplative practice for evolution across all dimensions of being" |
| CLI banner | "Mysterium — A contemplative RPG that mirrors you back to yourself" |
| docs/curriculum-authoring.md | "How to author, validate, and integrate curriculum holons into Mysterium" |

**A successor agent reading these would think the project is four different things:**
1. A fighting game (docs/00-vision.md)
2. A cognitive assessment engine (AGENTS.md)
3. A contemplative RPG (README.md)
4. A contemplative practice for evolution (package.json)

**The truth:** It is a **contemplative practice that uses game mechanics as its delivery vehicle**, with a curriculum system that replaces formal education, shadow work that heals psychological patterns, and a cosmology that maps the soul's journey.

---

## 6. Recommended Optimized Doc Structure

### 6.1 The New Structure

```
docs/
├── INDEX.md                          ← Navigation (UPDATE)
├── REQUIREMENTS.md                   ← Contract (UPDATE to reflect current identity)
├── CHANGELOG.md                      ← History (keep as-is)
├── 00-vision.md                      ← What it is (REWRITE for current identity)
├── 01-first-principles.md            ← Seven questions (keep, update references)
├── 02-glossary.md                    ← Terms (UPDATE — remove ATB terms)
├── 03-research-methodology.md        ← Method (keep, update references)
│
├── foundations/                       ← Theory (keep all, update "CCRPG" → "Mysterium")
│   ├── 00-09: Theoretical substrate (keep as-is)
│   ├── 10-14: Lesser-cycle game design (keep as-is)
│   ├── 15-27: Greater-cycle game design (keep as-is)
│   └── 28-34: Curriculum expansion (keep as-is)
│
├── lines/                            ← One per line (keep as-is)
├── stages/                           ← One per stage (keep as-is)
│
├── architecture/                     ← IMPLEMENT (currently empty)
│   ├── 00-overview.md               ← The binding architectural contract
│   ├── 01-core-engine.md            ← Significator, CCI, AutoMode, Scheduler
│   ├── 02-encounter-system.md       ← 64 modules, 7 modalities, AgenticOrchestrator
│   ├── 03-curriculum-system.md      ← Holonic curriculum, depth assessment, spaced repetition
│   ├── 04-shadow-work.md            ← 4-quadrant shadow model, detection→integration
│   ├── 05-polarity-engine.md        ← STO/STS crystallization, harvest mechanics
│   ├── 06-llm-integration.md        ← LLM as voice, not brain; ContextPipeline
│   ├── 07-persistence.md            ← Significator serialization, encryption, profiles
│   └── 08-rendering-layer.md        ← SvelteKit WebUI, CLI, Capacitor
│
├── audits/                           ← Keep only the DEFINITIVE versions
│   ├── CURRICULUM-ARCHITECTURE-AUDIT-2026-07-23.md  ← Keep (curriculum-specific)
│   ├── FRESH-USER-UX-AUDIT-CURRICULUM.md            ← Keep (fresh-user specific)
│   ├── REALIGNED-PLAN.md            ← Keep (CLI-as-spec)
│   ├── HARDCODE-AUDIT.md            ← Keep (LLM-dependence)
│   └── DOC-ARCHITECTURE-AUDIT-2026-07-24.md         ← This document
│
├── archive/                          ← Move ALL superseded docs here
│   ├── ATB-COMBAT/                  ← All ATB-era docs
│   ├── OLD-AUDITS/                  ← All superseded audit rounds
│   └── OLD-PLANS/                   ← All superseded implementation plans
│
└── concept-drafts/                   ← Keep as-is (512 game concepts)
```

### 6.2 Documents to Remove from Active Tree

| Document | Action | Reason |
|---|---|---|
| RED-TEAM-AUDIT.md | → archive/ | Superseded by DEFINITIVE |
| RED-TEAM-AUDIT-FULL-FLOW.md | → archive/ | Superseded by DEFINITIVE |
| RED-TEAM-AUDIT-CURRENT-STATE.md | → archive/ | Superseded by DEFINITIVE |
| RED-TEAM-AUDIT-CATALYST-TRAJECTORY.md | → archive/ | Superseded by DEFINITIVE |
| PONYTAIL-AUDIT.md | → archive/ | Superseded by REALIGNED-PLAN |
| PONYTAIL-AUDIT-v2.md | → archive/ | Superseded by REALIGNED-PLAN |
| FRONTEND-AUDIT-AND-REFACTOR-PLAN.md | → archive/ | Superseded by HARDCODE-AUDIT |
| GAMEPLAY-MODES-AUDIT.md | → archive/ | Superseded by RED-TEAM-AUDIT-DEFINITIVE |
| RED-TEAM-AUDIT-DEFINITIVE.md | → audits/ | Keep as definitive audit |
| STAGE-ASSESSMENT-ARCHITECTURE.md | → architecture/ | Move to new architecture/ directory |

### 6.3 Documents to Rewrite

| Document | What Needs Changing |
|---|---|
| docs/00-vision.md | Remove "fighting game" framing; rewrite as contemplative practice |
| docs/REQUIREMENTS.md | Update directory tree to reflect current structure; remove ATB references |
| docs/INDEX.md | Update reading order; add architecture/ section; remove archived references |
| docs/02-glossary.md | Remove ATB terms (Battler, Spell, HP, Mana); add curriculum terms (Holon, DepthLevel, ForgettingCurve) |
| AGENTS.md | Update project description; remove "game" framing where inappropriate |

---

## 7. Summary: What a Successor Agent Needs to Know

### The One-Paragraph Truth

> Mysterium is a contemplative practice that uses game mechanics as its delivery vehicle. It simultaneously functions as: (1) a developmental assessment engine across 8 lines × 8 stages, (2) a complete education replacement with holonic curriculum, spaced repetition, and research pipeline, (3) a shadow work tool that surfaces and integrates psychological patterns, (4) a polarity engine that tracks STO/STS crystallization toward harvest, and (5) an incarnation architecture where ONE world has 8 perceptual layers that shift at transformation thresholds. All mechanics operate behind a Veil of Forgetting — the player never sees the engine. They experience reflection, not measurement.

### The Three Rules for Successor Agents

1. **Don't read docs/00-vision.md first** — it describes the ATB-combat era. Read README.md and AGENTS.md instead.
2. **Don't read the RED-TEAM-AUDIT-* files** — they're historical. Read CURRICULUM-ARCHITECTURE-AUDIT-2026-07-23.md and FRESH-USER-UX-AUDIT-CURRICULUM.md instead.
3. **Don't assume it's a game** — it's a contemplative practice. The "RPG" framing is a delivery mechanism, not the identity.

---

*Report generated July 24, 2026.*
*225 files renamed | 793 tests passing | Build succeeds | Lint clean*
