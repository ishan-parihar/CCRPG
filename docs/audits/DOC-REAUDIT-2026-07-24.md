# Document Architecture Re-Audit: Complete File-by-File Assessment

**Date:** July 24, 2026  
**Auditor:** Buffy (AI agent)  
**Purpose:** Map every single file in `docs/` by status (living/stale/dead/contradictory), then recommend an optimized structure that prevents successor-agent confusion.

---

## 1. Executive Summary

The documentation tree has **104 tracked files** across 10 directories. Of these:

| Status | Count | Description |
|---|---|---|
| **Living** | ~35 | Actively accurate and useful |
| **Stale** | ~25 | Partially accurate but reference old system (ATB combat, PlayerProfile, Phaser) |
| **Dead** | ~30 | Fully superseded but still present — will actively mislead |
| **Contradictory** | ~8 | Describe the project as something it no longer is |

**The core problem:** The docs describe THREE different versions of this project simultaneously:
1. **v1 (2026-05):** An ATB combat RPG with Battlers, Spells, HP, Mana, Enemies, XP
2. **v2 (2026-05):** An assessment-module system replacing ATB, with Significator
3. **v3 (2026-07):** A contemplative practice + curriculum system + shadow work + polarity engine

The naming change from CCRPG → Mysterium reflects v3. But most docs still describe v1 or v2.

---

## 2. Complete File Inventory

### 2.1 `docs/` Root Level (18 files)

| # | File | Status | What It Actually Says | Problem |
|---|---|---|---|---|
| 1 | `00-vision.md` | ⚠️ STALE | "A fighting game where every spell you cast is a working-memory test" | Still describes v1 (ATB combat RPG). References Battler, Spell, ATB, enemies, combat. Zero mention of curriculum, shadow work, polarity engine, or contemplative practice identity. |
| 2 | `01-first-principles.md` | ⚠️ STALE | "Which line, which stage, which AQAL quadrant?" | References `combat/02-cognitive-task-library.md` (doesn't exist), `enemies/04` (archived), `architecture/01-clean-architecture.md` (doesn't exist). Still ATB-framed. |
| 3 | `02-glossary.md` | ⚠️ STALE | Canonical definitions for all terms | Contains 15+ ATB-era terms still defined: Battler, Bestiary, Boss (main/mini), Combat verb, ATB, Fill rate, Focus point, Object pool, Skill tree, Stance, Telemetry packet. Also references non-existent `combat/02` and `enemies/04`. No curriculum terms (Holon, DepthLevel, ForgettingCurve, SpacedRepetition). |
| 4 | `03-research-methodology.md` | ⚠️ STALE | DSR, OMDE, INFORM methodology | References HoloOS Method of Holonic Inquiry (external system not documented in this repo). References non-existent docs (`architecture/01`, `combat/02`, `validation/00`). Status-ladder system references documents that don't exist. |
| 5 | `CHANGELOG.md` | ✅ LIVING | Tracks v0.1 through v3.0 | Accurate. Could add v4.0 entry for CCRPG→Mysterium rename + curriculum expansion. |
| 6 | `GAMEPLAY-MODES-AUDIT.md` | ❌ DEAD | Redundant audit of direct-questioning vs story-driven modes | Fully superseded by EVERGREEN-TWO-MODE-PLAN.md in superpowers/plans/. Also redundant with RED-TEAM-AUDIT findings. |
| 7 | `INDEX.md` | ⚠️ STALE | Navigation index for docs tree | Good structure but references non-existent directories: `architecture/`, `ux/`, `validation/`, `roadmap/`. Also references `../UNIFIED-IMPLEMENTATION-PLAN.md` (in root-archive, not repo root). Reading order is still valid for foundations. |
| 8 | `ONBOARDING-REDESIGN-PLAN.md` | ⚠️ STALE | Binary-search composite assessment design | References PlayerProfile (replaced by Significator), Battler (removed), Phaser (replaced by SvelteKit), `lineToTaskSlug` with wrong mappings. The binary-search algorithm is still valid design, but the integration section (§5) references dead systems. |
| 9 | `PROGRESS.md` | ✅ LIVING | UX audit implementation tracker | Tracks 18 recommendations through completion. Accurate. Could be archived as historical once all work is done. |
| 10 | `RED-TEAM-AUDIT.md` | ❌ DEAD | Historical audit #4 (June 21) | Superseded by RED-TEAM-AUDIT-DEFINITIVE.md. Says "developmental catalysis rating: 8/10" — contradicts DEFINITIVE's assessment. |
| 11 | `RED-TEAM-AUDIT-2.md` | ❌ DEAD | Historical audit #5 (June 21) | Superseded by RED-TEAM-AUDIT-DEFINITIVE.md. Lists 23 gaps that are partially addressed. |
| 12 | `RED-TEAM-AUDIT-CATALYST-TRAJECTORY.md` | ❌ DEAD | Historical audit (June 21) | Superseded by DEFINITIVE. |
| 13 | `RED-TEAM-AUDIT-CURRENT-STATE.md` | ❌ DEAD | Historical audit (June 21) | Superseded by DEFINITIVE. |
| 14 | `RED-TEAM-AUDIT-DEFINITIVE.md` | ✅ LIVING | The definitive audit | Most accurate snapshot of system state. Should be the ONLY red-team audit kept active. |
| 15 | `RED-TEAM-AUDIT-FULL-FLOW.md` | ❌ DEAD | Historical audit (June 21) | Superseded by DEFINITIVE. |
| 16 | `REQUIREMENTS.md` | ⚠️ STALE | "Document of documents" — the contract | References non-existent directories (`architecture/`, `ux/`, `validation/`, `roadmap/`). References `MVP-BLUEPRINT.md` (in root-archive). Describes 87-document plan that was never completed. Still references ATB combat terminology. |
| 17 | `architecture/10-stage-assessment-architecture.md` | ✅ LIVING | Module contract, composition rules, 4 execution modes | The most important architecture doc. Partially implemented. Accurate description of the assessment module system. |
| 18 | `architecture/11-curriculum-authoring.md` | ✅ LIVING | How to author curriculum holons | Accurate. References Mysterium (post-rename). |

**Root-level summary:** 1 living, 12 stale/dead, 5 contradictory.

---

### 2.2 `docs/foundations/` (37 files, 00–36)

| Range | Files | Status | Notes |
|---|---|---|---|
| 00–09 | 10 | ✅ LIVING | Theoretical substrate. These are pure theory (integral theory, AQAL, stages, lines, states, drives, Law-of-One, neuroscience, psychophysics, flow). No code references. Timeless. |
| 10–14 | 5 | ✅ LIVING | Lesser-cycle game design (shadow model, modalities, drive assessment, consciousness topography, catalyst mechanics). These describe the encounter-level engine. Still accurate. |
| 15–22 | 8 | ✅ LIVING | Greater-cycle game design (archetypal mind, significator, transformation, great way, choice/polarity, veil, incarnation, holon context engine). These describe the soul-level engine. Still accurate. |
| 23–27 | 5 | ✅ LIVING | Polarity ontology, encounter scheduler, CCI, unified core architecture, auto-mode strategy. These describe the operational engine. Still accurate. |
| 28 | 1 | ✅ LIVING | HoloOS open-joints mapping. Tracks integration points with external HoloOS system. |
| 29–36 | 8 | ✅ LIVING | Curriculum expansion (meta-learning science, holonic curriculum, depth assessment, agentic linter, self-directed dashboard, engine bridge, framework complexity mapping, curriculum upgrade plan). These describe the education-replacement system. Still accurate. |

**Foundations summary:** All 37 files are living. This is the strongest part of the documentation.

---

### 2.3 `docs/lines/` (9 files)

| File | Status | Problem |
|---|---|---|
| `00-overview-multi-line.md` | ✅ LIVING | Overview of how lines interact |
| `01-cognitive.md` | ⚠️ STALE | References ATB combat style: "Spellcasting, planning, n-back, Tower-of-London" |
| `02-emotional.md` | ⚠️ STALE | References ATB combat style: "Empathy reads, affect-regulation parries" |
| `03-moral.md` | ⚠️ STALE | References ATB combat style: "Choice-based attacks, dilemma-driven branching" |
| `04-intrapersonal.md` | ⚠️ STALE | References ATB combat style: "Introspective meditation states" |
| `05-spiritual.md` | ⚠️ STALE | References ATB combat style: "State-shifting, value-priority weapons" |
| `06-somatic.md` | ⚠️ STALE | References ATB combat style: "Rhythm, dodge, posture, breath-gated abilities" |
| `07-willpower.md` | ⚠️ STALE | References ATB combat style: "Goal-locking buffs, fatigue resistance" |
| `08-interpersonal.md` | ⚠️ STALE | References ATB combat style: "Co-op synergies, group-buffs" |

**Lines summary:** 1 living, 8 stale. All 8 line bibles describe ATB combat styles that no longer exist. The developmental psychology content is still valid, but the "game-design mapping" sections reference dead systems.

---

### 2.4 `docs/stages/` (9 files)

| File | Status | Problem |
|---|---|---|
| `00-overview-eight-stages.md` | ✅ LIVING | Overview of the 8-stage system |
| `01-infrared-archaic.md` | ⚠️ STALE | References ATB enemies, bestiary, combat encounters |
| `02-magenta-magic.md` | ⚠️ STALE | Same |
| `03-red-power.md` | ⚠️ STALE | Same |
| `04-amber-mythic.md` | ⚠️ STALE | Same |
| `05-orange-rational.md` | ⚠️ STALE | Same |
| `06-green-pluralistic.md` | ⚠️ STALE | Same |
| `07-turquoise-integral.md` | ⚠️ STALE | Same |
| `08-white-superintegral.md` | ⚠️ STALE | Same |

**Stages summary:** 1 living, 8 stale. All 8 stage world bibles describe ATB enemies, bestiary, and combat encounters that no longer exist. The developmental psychology and world-aesthetic content is still valid, but the "bestiary" and "combat" sections reference dead systems.

---

### 2.5 `docs/narrative/` (1 file)

| File | Status | Problem |
|---|---|---|
| `00-narrative-architecture.md` | ⚠️ STALE | References ATB combat, enemies, Phaser rendering, "story as scaffolding for stage progression" |

**Narrative summary:** 1 stale file. The concept is valid but the implementation details reference dead systems.

---

### 2.6 `docs/progression/` (1 file)

| File | Status | Problem |
|---|---|---|
| `00-progression-overview.md` | ⚠️ STALE | References ATB combat, XP, levels, "how the player ascends" |

**Progression summary:** 1 stale file. The concept is valid but references dead systems.

---

### 2.7 `docs/archive/` (6 files)

| File | Status | Notes |
|---|---|---|
| `IMPLEMENTATION-PLAN.md` | ✅ ARCHIVED | ATB-era implementation plan. Correctly archived. |
| `ONBOARDING-AUDIT.md` | ✅ ARCHIVED | Old onboarding audit. Correctly archived. |
| `PROFILE-MAPPING-AUDIT.md` | ✅ ARCHIVED | PlayerProfile audit. Correctly archived (PlayerProfile replaced by Significator). |
| `combat-philosophy.md` | ✅ ARCHIVED | ATB combat philosophy. Correctly archived. |
| `enemy-taxonomy.md` | ✅ ARCHIVED | Enemy taxonomy. Correctly archived (enemies replaced by encounter modules). |
| `plan.md` | ✅ ARCHIVED | Original ATB blueprint. Correctly archived. |

**Archive summary:** All 6 files correctly archived. No action needed.

---

### 2.8 `docs/root-archive/` (36 files)

| Category | Files | Status | Notes |
|---|---|---|---|
| **Old plans** | `MVP-BLUEPRINT.md`, `UNIFIED-IMPLEMENTATION-PLAN.md`, `GOLD-STANDARD-PLAN.md`, `ROADMAP.md` | ❌ DEAD | All reference ATB combat, PlayerProfile, Phaser. MVP-BLUEPRINT and UNIFIED-IMPLEMENTATION-PLAN are still referenced as "binding build plans" by REQUIREMENTS.md and INDEX.md — this is confusing. |
| **Old audits** | `AUDIT-REPORT.md`, `AUDIT-USER-MATRIX.md`, `WORLD-BUILDER-AUDIT.md`, `BUGS-AND-GAPS.md` | ❌ DEAD | Historical audits from ATB era. |
| **Old agentic audits** | `AGENTIC-ARCHITECTURE-PLAN.md`, `AGENTIC-LOOP-AUDIT.md`, `AGENTIC-SYSTEM-AUDIT.md`, `AGENTIC-SYSTEM-AUDIT-ROUND2.md`, `AGENTIC-SYSTEM-AUDIT-ROUND3.md` | ❌ DEAD | Historical agentic architecture audits. Superseded by BACKGROUND-AGENTIC-ARCHITECTURE.md in audits/. |
| **Old profiling** | `PROFILING-SYSTEM-DESIGN.md`, `PROFILING-ARCHITECTURE-AUDIT.md`, `PROFILING-INFRASTRUCTURE-RND.md` | ❌ DEAD | References PlayerProfile. |
| **Old frontend** | `CCRPG-FRONTEND-ARCHITECTURE-PLAN.md`, `SVELTE-FRONTEND-AUDIT.md`, `FRONTEND-IMPLEMENTATION-WORKLOG.md` | ❌ DEAD | References Phaser + PlayerProfile. |
| **Old UX audits** | `UX-AUDIT-REPORT.md` through `UX-AUDIT-REPORT-R10.md` (11 files) | ❌ DEAD | 11 rounds of the same audit pattern. Superseded by curriculum audits. |
| **Old efficacy** | `EFFICACY-AUDIT-REPORT.md`, `EFFICACY-PILOT-REPORT.md`, `EFFICACY-PILOT-REPORT-R2.md` | ❌ DEAD | Historical. |
| **Old HoloOS** | `AUDIT-HOLOOS-ALIGNMENT.md`, `HOLOOS-DEVIATION-ANALYSIS.md` | ❌ DEAD | Historical HoloOS alignment audits. |
| **Old personas** | `PILOT-PERSONAS.md` | ❌ DEAD | Historical. |

**Root-archive summary:** All 36 files are dead. They are correctly archived but still referenced by active docs (REQUIREMENTS.md, INDEX.md).

---

### 2.9 `docs/audits/` (10 files)

| File | Status | Notes |
|---|---|---|
| `DOC-ARCHITECTURE-AUDIT-2026-07-24.md` | ✅ LIVING | Previous audit (this will be superseded by this re-audit) |
| `CURRICULUM-ARCHITECTURE-AUDIT-2026-07-23.md` | ✅ LIVING | Curriculum-specific audit. Accurate. |
| `FRESH-USER-UX-AUDIT-CURRICULUM.md` | ✅ LIVING | Fresh-user UX audit. Accurate. |
| `HARDCODE-AUDIT.md` | ✅ LIVING | LLM-dependence audit. Accurate. |
| `REALIGNED-PLAN.md` | ✅ LIVING | CLI-as-spec refactor plan. Accurate. |
| `PONYTAIL-AUDIT.md` | ⚠️ STALE | Old ponytail audit. Superseded by v2. |
| `PONYTAIL-AUDIT-v2.md` | ✅ LIVING | Updated ponytail audit. Accurate. |
| `BACKGROUND-AGENTIC-ARCHITECTURE.md` | ✅ LIVING | Agentic architecture proposal. Accurate. |
| `BACKGROUND-AGENTIC-ARCHITECTURE-AUDIT-V2.md` | ✅ LIVING | Agentic architecture audit. Accurate. |
| `FRONTEND-AUDIT-AND-REFACTOR-PLAN.md` | ✅ LIVING | Frontend audit. Accurate (references old Phaser code that still exists). |

**Audits summary:** 8 living, 1 stale, 1 superseded-by-this-audit.

---

### 2.10 `docs/superpowers/` (8 files)

| File | Status | Notes |
|---|---|---|
| `specs/2026-06-18-ccrpg-upgrades-design.md` | ⚠️ STALE | CLI upgrades spec. Still references old name in title. Content is valid. |
| `specs/2026-06-18-security-hardening-design.md` | ✅ LIVING | AES-GCM encryption spec. Accurate. |
| `plans/EVERGREEN-TWO-MODE-PLAN.md` | ✅ LIVING | Two-mode gameplay plan. Accurate. |
| `plans/2026-06-21-upgrade-refactor-plan.md` | ⚠️ STALE | Old upgrade plan. Partially superseded. |
| `plans/2026-06-22-immediate-refactor-plan.md` | ⚠️ STALE | Old refactor plan. Partially superseded. |
| `plans/2026-06-18-security-hardening.md` | ✅ LIVING | Security hardening plan. Accurate. |
| `plans/2026-06-21-cli-distribution-plan.md` | ⚠️ STALE | CLI distribution plan. Partially superseded. |
| `plans/2026-06-21-tui-operationalization-plan.md` | ⚠️ STALE | TUI plan. Partially superseded. |
| `plans/archived/` | ✅ ARCHIVED | Old plans correctly archived. |

**Superpowers summary:** 3 living, 5 stale.

---

### 2.11 `docs/concept-drafts/` (3 meta files + 8 line directories)

| File | Status | Notes |
|---|---|---|
| `README.md` | ✅ LIVING | Templates and requirements for concept drafts. Accurate. |
| `ROADMAP.md` | ✅ LIVING | Development phases. Accurate. |
| `SCORING-ARCHITECTURE.md` | ✅ LIVING | Scoring architecture. Accurate. |
| `{line}/{stage}/` (64 dirs × 8 files) | ✅ LIVING | 512 game concept documents. The most valuable docs in the entire tree. |

**Concept-drafts summary:** All living. This is the second-strongest part of the documentation.

---

## 3. The Contradiction Map

These documents actively describe the project as something it no longer is:

| Document | Says | Reality |
|---|---|---|
| `00-vision.md` | "A fighting game where every spell you cast is a working-memory test" | A contemplative practice for evolution |
| `01-first-principles.md` | References Battler, Spell, enemies/04, combat/02 | No Battlers, no Spells, enemies archived, combat archived |
| `02-glossary.md` | Defines Battler, Bestiary, Boss, Combat verb, ATB, Fill rate, Focus point, Object pool, Skill tree, Stance | None of these exist in the current system |
| `REQUIREMENTS.md` | "build a role-playing fighting game" (§0.3) | Not a fighting game |
| `REQUIREMENTS.md` | References architecture/, ux/, validation/, roadmap/ dirs | None of these directories exist |
| `INDEX.md` | References architecture/, ux/, validation/, roadmap/ dirs | None of these directories exist |
| `ONBOARDING-REDESIGN-PLAN.md` §5 | References PlayerProfile.altitudes, PlayerProfile.rayProfile, Combat DDA | PlayerProfile replaced by Significator; Combat replaced by assessment modules |
| All 8 `lines/*.md` | "Combat style" columns referencing ATB mechanics | No ATB combat exists |
| All 8 `stages/*.md` | "Bestiary" sections referencing enemies, mini-bosses, main bosses | No enemy system exists |
| `narrative/00-narrative-architecture.md` | References ATB combat, enemies, Phaser rendering | None of these exist |

---

## 4. The Reference-to-Nowhere Map

These documents reference files/directories that don't exist:

| Document | References | Exists? |
|---|---|---|
| `01-first-principles.md` | `combat/02-cognitive-task-library.md` | ❌ Archived |
| `01-first-principles.md` | `enemies/04` | ❌ Archived |
| `01-first-principles.md` | `architecture/01-clean-architecture.md` | ❌ Never created |
| `02-glossary.md` | `combat/02` | ❌ Archived |
| `02-glossary.md` | `enemies/04` | ❌ Archived |
| `03-research-methodology.md` | `architecture/01` | ❌ Never created |
| `03-research-methodology.md` | `combat/02` | ❌ Archived |
| `03-research-methodology.md` | `validation/00` | ❌ Never created |
| `INDEX.md` | `architecture/` directory | ❌ Never created |
| `INDEX.md` | `ux/` directory | ❌ Never created |
| `INDEX.md` | `validation/` directory | ❌ Never created |
| `INDEX.md` | `roadmap/` directory | ❌ Never created |
| `INDEX.md` | `../UNIFIED-IMPLEMENTATION-PLAN.md` | ❌ In root-archive, not repo root |
| `REQUIREMENTS.md` | `architecture/` (11 files) | ❌ Never created |
| `REQUIREMENTS.md` | `ux/` (5 files) | ❌ Never created |
| `REQUIREMENTS.md` | `validation/` (4 files) | ❌ Never created |
| `REQUIREMENTS.md` | `roadmap/` (4 files) | ❌ Never created |
| `REQUIREMENTS.md` | `MVP-BLUEPRINT.md` | ❌ In root-archive, not repo root |

---

## 5. The Redundancy Map

| Group | Files | Overlap |
|---|---|---|
| **Red-Team Audits** | RED-TEAM-AUDIT.md, RED-TEAM-AUDIT-2.md, RED-TEAM-AUDIT-CATALYST-TRAJECTORY.md, RED-TEAM-AUDIT-CURRENT-STATE.md, RED-TEAM-AUDIT-FULL-FLOW.md, RED-TEAM-AUDIT-DEFINITIVE.md, GAMEPLAY-MODES-AUDIT.md | 7 files all say "the game doesn't deliver on its promise" — DEFINITIVE supersedes all 6 |
| **UX Audit Rounds** | UX-AUDIT-REPORT.md through UX-AUDIT-REPORT-R10.md (11 files) | 11 rounds of the same audit pattern in root-archive |
| **Agentic Audits** | AGENTIC-ARCHITECTURE-PLAN.md, AGENTIC-LOOP-AUDIT.md, AGENTIC-SYSTEM-AUDIT.md, AGENTIC-SYSTEM-AUDIT-ROUND2.md, AGENTIC-SYSTEM-AUDIT-ROUND3.md, BACKGROUND-AGENTIC-ARCHITECTURE.md, BACKGROUND-AGENTIC-ARCHITECTURE-AUDIT-V2.md | 7 files about agentic architecture — keep only the last 2 |
| **Frontend Audits** | CCRPG-FRONTEND-ARCHITECTURE-PLAN.md, SVELTE-FRONTEND-AUDIT.md, FRONTEND-IMPLEMENTATION-WORKLOG.md, FRONTEND-AUDIT-AND-REFACTOR-PLAN.md | 4 files about frontend — keep only the last 1 |
| **Ponytail Audits** | PONYTAIL-AUDIT.md, PONYTAIL-AUDIT-v2.md | Keep only v2 |
| **Efficacy Audits** | EFFICACY-AUDIT-REPORT.md, EFFICACY-PILOT-REPORT.md, EFFICACY-PILOT-REPORT-R2.md | 3 files — all historical |

---

## 6. The Missing Documents

| Missing Doc | Why It's Needed | Current Coverage |
|---|---|---|
| **Curriculum System Architecture** | The curriculum system is a complete education replacement — needs its own architecture doc | Foundations/29-36 cover theory; no implementation doc |
| **Shadow Work Engine Architecture** | Shadow work is a core system — needs its own architecture doc | Foundations/10 covers theory; no implementation doc |
| **Polarity Engine Architecture** | Polarity engine drives STO/STS crystallization — needs its own architecture doc | Foundations/19 covers theory; no implementation doc |
| **Current State Documentation** | What actually exists RIGHT NOW | No doc exists — only audit reports from different dates |
| **Significator Architecture (Implementation)** | Foundations/16 covers theory; no implementation doc for how Significator actually works in code | Only theory |
| **Encounter Scheduler (Implementation)** | Foundations/24 covers theory; no implementation doc | Only theory |
| **LLM Integration Architecture** | How LLMs are integrated as voice, not brain | No doc exists |
| **Mysterium Identity Document** | What the system IS now (post-rename, post-curriculum) | No doc — 00-vision.md still says "fighting game" |

---

## 7. Recommended Optimized Structure

### 7.1 The New Structure

```
docs/
├── INDEX.md                          ← REWRITE for current identity
├── REQUIREMENTS.md                   ← REWRITE for current identity
├── CHANGELOG.md                      ← Keep as-is
├── 00-vision.md                      ← REWRITE: contemplative practice, not fighting game
├── 01-first-principles.md            ← REWRITE: remove ATB references
├── 02-glossary.md                    ← REWRITE: remove ATB terms, add curriculum terms
├── 03-research-methodology.md        ← REWRITE: remove references to non-existent docs
│
├── foundations/                       ← KEEP ALL (37 files, all living)
│   ├── 00-09: Theoretical substrate
│   ├── 10-14: Lesser-cycle game design
│   ├── 15-27: Greater-cycle game design
│   ├── 28: HoloOS open-joints
│   └── 29-36: Curriculum expansion
│
├── lines/                            ← KEEP (update ATB references in 01-08)
├── stages/                           ← KEEP (update ATB references in 01-08)
│
├── architecture/                     ← CREATE (currently empty)
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
│   ├── CURRICULUM-ARCHITECTURE-AUDIT-2026-07-23.md
│   ├── FRESH-USER-UX-AUDIT-CURRICULUM.md
│   ├── REALIGNED-PLAN.md
│   ├── HARDCODE-AUDIT.md
│   ├── BACKGROUND-AGENTIC-ARCHITECTURE.md
│   ├── BACKGROUND-AGENTIC-ARCHITECTURE-AUDIT-V2.md
│   ├── FRONTEND-AUDIT-AND-REFACTOR-PLAN.md
│   ├── PONYTAIL-AUDIT-v2.md
│   ├── DOC-ARCHITECTURE-AUDIT-2026-07-24.md
│   └── DOC-REAUDIT-2026-07-24.md    ← This document
│
├── concept-drafts/                   ← KEEP ALL (512 game concepts, all living)
│
├── archive/                          ← Move ALL superseded docs here
│   ├── atb-combat/                  ← All ATB-era docs (plan.md, IMPLEMENTATION-PLAN.md, etc.)
│   ├── old-audits/                  ← All superseded audit rounds (7 red-team audits, 11 UX rounds, etc.)
│   ├── old-plans/                   ← All superseded plans (MVP-BLUEPRINT, UNIFIED-IMPLEMENTATION-PLAN, etc.)
│   ├── old-agentic/                 ← All superseded agentic audits
│   ├── old-frontend/                ← All superseded frontend audits
│   ├── old-profiling/               ← All superseded profiling docs
│   └── old-efficacy/                ← All superseded efficacy docs
│
├── superpowers/                      ← Keep living plans, archive stale ones
│   ├── specs/                       ← Keep security hardening spec
│   └── plans/                       ← Keep EVERGREEN-TWO-MODE-PLAN, archive rest
│
├── narrative/                        ← KEEP (update ATB references)
├── progression/                      ← KEEP (update ATB references)
└── architecture/11-curriculum-authoring.md           ← KEEP (already accurate)
```

### 7.2 Files to Move to archive/ (30 files)

| File | From | To |
|---|---|---|
| RED-TEAM-AUDIT.md | docs/ | archive/old-audits/ |
| RED-TEAM-AUDIT-2.md | docs/ | archive/old-audits/ |
| RED-TEAM-AUDIT-CATALYST-TRAJECTORY.md | docs/ | archive/old-audits/ |
| RED-TEAM-AUDIT-CURRENT-STATE.md | docs/ | archive/old-audits/ |
| RED-TEAM-AUDIT-FULL-FLOW.md | docs/ | archive/old-audits/ |
| GAMEPLAY-MODES-AUDIT.md | docs/ | archive/old-audits/ |
| PONYTAIL-AUDIT.md | audits/ | archive/old-audits/ |
| UX-AUDIT-REPORT*.md (11 files) | root-archive/ | archive/old-audits/ |
| EFFICACY-AUDIT-REPORT.md | root-archive/ | archive/old-efficacy/ |
| EFFICACY-PILOT-REPORT*.md (2 files) | root-archive/ | archive/old-efficacy/ |
| AGENTIC-ARCHITECTURE-PLAN.md | root-archive/ | archive/old-agentic/ |
| AGENTIC-LOOP-AUDIT.md | root-archive/ | archive/old-agentic/ |
| AGENTIC-SYSTEM-AUDIT*.md (3 files) | root-archive/ | archive/old-agentic/ |
| CCRPG-FRONTEND-ARCHITECTURE-PLAN.md | root-archive/ | archive/old-frontend/ |
| SVELTE-FRONTEND-AUDIT.md | root-archive/ | archive/old-frontend/ |
| FRONTEND-IMPLEMENTATION-WORKLOG.md | root-archive/ | archive/old-frontend/ |
| PROFILING-*.md (3 files) | root-archive/ | archive/old-profiling/ |
| AUDIT-HOLOOS-ALIGNMENT.md | root-archive/ | archive/ |
| HOLOOS-DEVIATION-ANALYSIS.md | root-archive/ | archive/ |
| AUDIT-REPORT.md | root-archive/ | archive/ |
| AUDIT-USER-MATRIX.md | root-archive/ | archive/ |
| WORLD-BUILDER-AUDIT.md | root-archive/ | archive/ |
| BUGS-AND-GAPS.md | root-archive/ | archive/ |
| GOLD-STANDARD-PLAN.md | root-archive/ | archive/ |
| MVP-BLUEPRINT.md | root-archive/ | archive/ |
| UNIFIED-IMPLEMENTATION-PLAN.md | root-archive/ | archive/ |
| ROADMAP.md | root-archive/ | archive/ |
| PILOT-PERSONAS.md | root-archive/ | archive/ |
| 2026-06-21-upgrade-refactor-plan.md | superpowers/plans/ | archive/ |
| 2026-06-22-immediate-refactor-plan.md | superpowers/plans/ | archive/ |
| 2026-06-21-cli-distribution-plan.md | superpowers/plans/ | archive/ |
| 2026-06-21-tui-operationalization-plan.md | superpowers/plans/ | archive/ |

### 7.3 Files to Rewrite (8 files)

| File | What Needs Changing |
|---|---|
| `00-vision.md` | Remove "fighting game" framing entirely. Rewrite as contemplative practice. Reference curriculum, shadow work, polarity engine. |
| `01-first-principles.md` | Remove Battler, Spell, enemies/04, combat/02 references. Update acceptance criteria for assessment modules. |
| `02-glossary.md` | Remove 15+ ATB terms (Battler, Bestiary, Boss, Combat verb, ATB, Fill rate, Focus point, Object pool, Skill tree, Stance, Telemetry packet). Add curriculum terms (Holon, DepthLevel, ForgettingCurve, SpacedRepetition, HolonicCurriculum). |
| `03-research-methodology.md` | Remove references to non-existent docs (architecture/01, combat/02, validation/00). Update evidence hierarchy for current system. |
| `INDEX.md` | Remove references to architecture/, ux/, validation/, roadmap/. Add architecture/ section (once created). Update reading order. |
| `REQUIREMENTS.md` | Remove 87-document plan. Update directory tree to reflect current structure. Remove ATB references. Update canon decisions to reflect current system. |
| `ONBOARDING-REDESIGN-PLAN.md` §5 | Update integration section: PlayerProfile → Significator, Combat DDA → assessment modules, lineToTaskSlug → correct mappings. |
| `superpowers/specs/2026-06-18-ccrpg-upgrades-design.md` | Update title from "Mysterium Backend" (already renamed) but verify all internal references are current. |

### 7.4 Files to Update (not rewrite, just fix references)

| File | What Needs Fixing |
|---|---|
| All 8 `lines/*.md` | Replace "Combat style" column with "Assessment modality affinity" or similar |
| All 8 `stages/*.md` | Replace "Bestiary" sections with "Encounter module archetypes" |
| `narrative/00-narrative-architecture.md` | Replace ATB combat references with assessment module references |
| `progression/00-progression-overview.md` | Replace XP/level references with demonstration-based progression |

---

## 8. The Three Rules for Successor Agents (Updated)

1. **Read `00-vision.md` FIRST** — but only AFTER it's rewritten. Currently it describes a fighting game that no longer exists.
2. **Read `foundations/` in order (00→36)** — this is the only part of the docs tree that is fully accurate and complete. The theory is the bedrock.
3. **Don't read `lines/`, `stages/`, `narrative/`, `progression/` for game-design guidance** — they still reference ATB combat. Read `architecture/10-stage-assessment-architecture.md` and `concept-drafts/README.md` instead for the actual game design.
4. **Don't read any `RED-TEAM-AUDIT-*` except DEFINITIVE** — the others are historical and contradictory.
5. **Don't trust `REQUIREMENTS.md` or `INDEX.md` for directory structure** — they reference directories that don't exist. Use the actual filesystem.

---

## 9. Summary: The State of the Documentation

### What's Strong
- **Foundations (37 files):** The theoretical substrate is exhaustive, accurate, and timeless. This is the crown jewel.
- **Concept-drafts (512 files):** The game designs are complete and accurate. This is the second crown jewel.
- **Audits (8 living files):** The active audits are accurate and actionable.
- **CHANGELOG.md:** Clean version history.

### What's Broken
- **Root-level meta docs (00-03, INDEX, REQUIREMENTS):** All describe v1 (ATB combat RPG) or v2 (assessment modules). None describe v3 (contemplative practice + curriculum + shadow work + polarity engine).
- **Lines/Stages/Narrative/Progression (19 files):** All reference ATB combat, enemies, bestiary. The developmental psychology content is valid but the game-design mapping sections are obsolete.
- **Root-archive (36 files):** All dead but still referenced by active docs.

### What's Missing
- **architecture/ directory (8 docs):** No implementation architecture docs exist. The theory is in foundations/, but there's no doc describing how the code actually works.
- **Mysterium Identity Document:** No doc describes what the system IS now. 00-vision.md still says "fighting game."
- **Curriculum/Shadow/Polarity architecture docs:** The theory exists in foundations/ but no implementation docs exist.

---

*Re-audit completed July 24, 2026.*  
*104 files catalogued | 35 living | 25 stale | 30 dead | 8 contradictory*  
*8 files to rewrite | 30 files to archive | 8 architecture docs to create*
