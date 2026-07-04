# Spiritual / Orange — Strategic-Planning Game Concept

> **Axis:** Planning meaning-life — structuring purpose across time, managing competing meaning-sources.  **Why this axis for this module:** Orange capacity includes temporal self-authorship; meaning must be structured across a life, not just felt in moments. Strategic planning reveals whether meaning is operational or merely aspirational.

---

## 1. Game Identity

**Title:** The Architect of Purpose  
**Core loop:** Player constructs and manages a meaning-life across simulated time — allocating attention among competing meaning-sources, planning for meaning-maintenance, and adapting when meaning-structures are disrupted.  
**Feel:** A life-strategy game where the resource is significance — contemplative, forward-looking, with the weight of real temporal stakes.  
**Session length:** 5–10 minutes. Infinite checkpoint at each planning-cycle boundary.

## 2. Catalyst Delivery

**Catalyst type:** Temporal meaning-challenges that reveal whether the player can operationalize examined meaning or only hold it abstractly — and whether their planning reveals shadow-driven rigidity or avoidance.  
**Shadow activation:** GAll surfaces as over-structured meaning-plans that cannot adapt (fortress maintenance). DA surfaces as meaning-elimination planning ("optimize life for measurable outcomes only"). DAll surfaces as deferred examination ("I'll question my faith later, after I've achieved X"). GA surfaces as meaning-plan that includes everything without prioritization.  
**Integration path:** Catalyst (temporal disruption) → experience (meaning-plan under stress) → integration (adaptive planning that holds examined purpose without rigidity).

## 3. Game Design

**Mechanic 1 — Meaning-Portfolio Construction:** Player allocates "significance-attention" across meaning-sources (achievement, relationship, inquiry, tradition, creativity, service). System tracks balance, consistency with stated values, and adaptability.  
**Mechanic 2 — Temporal Disruption Events:** Simulated life-events that challenge the meaning-portfolio. Loss of achievement, relationship rupture, faith crisis, success that feels empty. Scored on adaptive response — neither rigid maintenance nor total collapse.  
**Mechanic 3 — Horizon Planning:** Player plans meaning-maintenance across short (weeks), medium (years), and long (decades) horizons. Reveals whether meaning is sustainable or dependent on conditions that will change.  
**Difficulty staircase:** Level 1: single meaning-source management. Level 2: competing meaning-sources requiring prioritization. Level 3: disruption events requiring adaptation. Level 4: fundamental meaning-crisis requiring reconstruction.  
**Drive probing:** Agency = sovereign prioritization without external validation. Communion = meaning-sources that include others without dependency. Eros = planning toward growth beyond current meaning-framework. Agape = grounding plans in present embodied reality.

## 4. Item Pool

**Category A — Portfolio Challenges (30%):** Allocation decisions among competing meaning-sources. Scored on internal consistency, alignment with examined values, and realistic sustainability.  
**Category B — Disruption Scenarios (30%):** Life-events that stress-test the meaning-portfolio. Scored on adaptive flexibility — appropriate revision without total collapse or rigid denial.  
**Category C — Horizon Conflicts (20%):** Situations where short-term meaning conflicts with long-term purpose. Tests temporal integration capacity.  
**Category D — Reconstruction Tasks (20%):** Post-crisis meaning-rebuilding from examined principles after old framework has been disrupted. Tests genuine Orange capacity vs. shadow-driven responses.  
**Adaptive selection:** Items selected based on detected planning-rigidity (GAll) or planning-avoidance (DA/DAll). Disruption severity calibrated to current capacity.

## 5. Technical Requirements

**Scoring engine:** Portfolio-analysis algorithms (balance metrics, consistency scoring, adaptability indices). Deterministic scoring for allocation decisions. LLM scoring for free-text planning justifications.  
**Response format:** Slider allocations (portfolio), forced-choice (disruption responses), brief free-text (planning rationale — LLM-scored).  
**State persistence:** Portfolio history, disruption-response patterns, horizon-planning evolution, shadow-activation profile, meaning-source stability indices.  
**Cross-modality hooks:** Imports choice-consistency from scenario-choice and logical-consistency from deterministic. Exports planning-adaptability to social-cooperative (can player plan meaning collaboratively?).  
**Performance:** Portfolio calculations real-time. Disruption event rendering immediate. LLM scoring async (3s).
