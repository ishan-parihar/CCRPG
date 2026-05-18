# Cognitive / Orange — Embodied-Somatic Game Concept

> **Axis:** Body as site of cognition — embodied reasoning, gesture-thought coupling, physical problem-solving.  **Why this axis for this module:** Orange's shadow is disembodied rationality; this modality forces formal operations to route through the body, revealing whether cognition is integrated or dissociated.

---

## 1. Game Identity

**Title:** The Thinking Body  
**Core Mechanic:** Cognitive tasks that require physical movement to solve — spatial reasoning through gesture, logical sequences through body positioning, planning through physical navigation. The body IS the reasoning instrument.  
**Duration:** 4–8 minutes per session, infinite checkpoint.  
**Internal Progression:** Mover → Gesture-Thinker → Body-Logician → Embodied Reasoner (formal operations flow through movement without friction).

## 2. Catalyst Delivery

**Unique Presentation:** A physical puzzle-space where abstract problems are mapped onto bodily actions — swipe patterns encode logical sequences, device tilting represents variable manipulation, rhythm encodes temporal reasoning.  
**Differs from others:** Not abstract psychometrics (deterministic), not verbal (language-reflective), not branching narrative (scenario-choice), not multi-step planning (strategic), not collaborative (social), not free-play (immersive). This is cognition-through-body specifically.  
**Uniquely Surfaces:** DA (body disconnection — the hyper-rationalist whose cognitive performance drops when routed through movement) and DAll (refusal of the cognitive-body link — "thinking has nothing to do with my body").  
**Successful Integration:** Player's formal-operational capacity is equally accessible through embodied and abstract channels — no dissociation between thinking and moving.

## 3. Game Design

**Setup:** Player enters a space where cognitive problems are presented as physical challenges. The interface maps abstract reasoning onto gesture, tilt, rhythm, and spatial navigation.

**Interaction Phases:**
1. **Body Calibration** — Simple movement tasks establishing baseline motor fluency and gesture vocabulary
2. **Embodied Encoding** — Cognitive problems presented as movement patterns (e.g., n-back through gesture sequences)
3. **Gesture-Logic** — Logical operations mapped to physical actions (swipe-left = negate, swipe-up = abstract, tap = confirm)
4. **Spatial Reasoning** — Navigation puzzles requiring formal-operational planning through physical space
5. **Integration Challenge** — Complex cognitive task where body and mind must synchronise (dual-channel: think AND move simultaneously)

**Feedback Examples:**
1. Fluid gesture-thought coupling: movement feels effortless, visual flow-state indicators
2. Dissociation detected (thinking pauses movement): gentle haptic prompt — "keep moving while you think"
3. Body-first insight (movement precedes conscious solution): celebration — the body knew before the mind
4. Cognitive-motor interference (DA signature): difficulty visualised as friction between channels
5. Successful integration: both channels synchronised, harmonic feedback

**Difficulty Adaptation:** Gesture complexity (2→5 element sequences), cognitive load during movement (simple→complex span), spatial planning depth (2→5 steps), synchronisation demand (sequential→simultaneous), speed requirement (self-paced→rhythmic).

**Internal Progression Table:**

| Level | Gesture Complexity | Cognitive Load | Spatial Depth | Synchronisation | Pacing |
|---|---|---|---|---|---|
| Mover | 2-element | Recognition | 2-step paths | Sequential | Self-paced |
| Gesture-Thinker | 3-element | N=2 maintenance | 3-step paths | Alternating | Gentle rhythm |
| Body-Logician | 4-element | N=3 maintenance | 4-step paths | Overlapping | Moderate rhythm |
| Embodied Reasoner | 5-element | Dual-task | 5-step paths | Simultaneous | Adaptive rhythm |

## 4. Item Pool

**Gesture Vocabularies (20+):** Swipe directions, tap patterns, tilt angles, shake intensities, hold durations, draw shapes, pinch/spread, rotation — each mapped to a logical operation.  
**Embodied N-back Sequences (25+):** Gesture sequences at n=2–3 where the player must reproduce the gesture from n-steps-ago while performing current gesture.  
**Spatial Reasoning Mazes (20+):** 3D navigation puzzles requiring ToL-equivalent planning but executed through physical movement (tilt-to-navigate, swipe-to-rotate).  
**Cognitive-Motor Dual Tasks (15+):** Maintain rhythm while solving arithmetic, navigate while tracking n-back, gesture-sequence while classifying stimuli.  
**Integration Challenges (15+):** Problems where the physical movement pattern IS the logical solution — the body must "think" the answer through action.

## 5. Technical Requirements

**Input Types:** Accelerometer/gyroscope (tilt, shake), touch gestures (swipe, tap, draw, pinch), rhythm detection (tap timing), spatial navigation (continuous tilt input).  
**Timing:** Movement fluency measured via gesture completion time and hesitation detection. Rhythm accuracy ±50ms tolerance. Cognitive-motor interference measured as RT cost.  
**NPC/AI:** None — player-vs-environment. The space itself responds to movement.  
**LLM:** None — deterministic scoring of gesture accuracy, spatial optimality, and cognitive-motor synchronisation.  
**State Persistence:** Gesture fluency trajectory, cognitive-motor interference ratio (key DA indicator), embodied vs. abstract performance gap, spatial planning efficiency through movement, session-over-session integration score.
