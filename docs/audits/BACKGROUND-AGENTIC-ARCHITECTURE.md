# BACKGROUND-AGENTIC-ARCHITECTURE.md

**Status:** Proposed Architecture (Post-Hardcode-Audit-v1)  
**Version:** 1.0  
**Date:** 2026-07-14

## TL;DR
CCRPG is evolving from a deterministic RPG with LLM fallbacks into a fully context-dependent **Agentic Diagnostic Engine**. All player interactions (including onboarding) will be driven by a background orchestrator that evolves the assessment trajectory in real-time.

## User Requirements
1.  **Context-Dependent Trajectory:** No two assessments are the same. Each response must change the context of the next question.
2.  **Continuous Agency:** An agent must be running in the background, observing game events, and making diagnostic decisions. Determinism is deprecated.
3.  **4+1 UX Contract:** All questionnaires must provide exactly 4 Multiple Choice Questions (MCQs) + 1 Free-Input field. The LLM decides the MCQ options based on its current diagnostic state.
4.  **Failure Integrity:** If the LLM is unavailable, deterministic fallbacks are forbidden. Surfaces must be hidden or blocked, redirecting users to the connection/setup screen.

---

## 1. Core Architecture (Director-Subagent Topology)

We implement a **DirectorAgent** that manages the state of the session. It does not perform all tasks; it delegates to specialized sub-agents.

### Decision 1: Single Director Runtime
A single `DirectorAgent` instance lives on the server (BFF) per session. It acts as the "Single Source of Truth" for the current diagnostic narrative.

### Decision 2: Sub-Agent Specialized Roles
Four sub-agents are spawned on-demand by the Director:
- **CalibrationAgent:** Handles onboarding and initial alignment.
- **ReflectionAgent:** Analyzes free-input and reflective responses.
- **RecognitionAgent:** Identifies patterns in the 4-MCQ selections.
- **SynthesisAgent:** Computes the transition between assessment modules.

### Decision 3: Event-Driven Observation
The Agent runtime subscribes to the engine's `EventBus`. It is **reactive**, not just a linear loop.
- **Trigger:** `encounter_completed` → Analyze result.
- **Trigger:** `strategy_generated` → Align narrative to the new strategy.
- **Trigger:** `cci_computed` → Adjust the tone based on Cognitive Capacity score.

---

## 2. The "4+1" Questionnaire Contract

Every dialogue surface in CCRPG must adhere to the following contract.

### Decision 4: MCQ Taxonomy
To ensure MCQs are diagnostic, the 4 options are not random. They must represent a **quadrant of orientation**:
1.  **Action/Assertive:** External change, agency, force.
2.  **Reflective/Observational:** Internal processing, witnessing, delay.
3.  **Communion/Relational:** Connection, impact on others, empathy.
4.  **Integrative/Synthesis:** Combining internal/external, transcendence.

### Decision 5: TypeScript Contract
```typescript
interface AgenticProbe {
  prompt: string;         // The narrative framing
  options: [              // Exactly 4
    string, string, string, string
  ];
  inputType: 'free_text'; // The "+1" field
  metadata: {
    intent: string;       // Why the agent is asking this
    trajectory: string;   // Where this question leads
  };
}
```

---

## 3. Context Evolution (Anti-Determinism)

### Decision 6: The "Loom" Context Pattern
The DirectorAgent maintains a "Loom" — a rolling window of the last 5 `GameEvents` + the player's last 3 free-input summaries. This Loom is injected into every `generateNextProbe` call.

### Decision 7: Progressive Calibration
Onboarding is no longer a fixed list of 8 prompts. 
- The `CalibrationAgent` generates a probe.
- Player responds.
- Agent analyzes the response to see if it has enough "signal" to start the game.
- If signal > 0.8, calibration ends. If not, it generates a *new* probe tailored to the missing signal.

---

## 4. UI/UX & Failure Handling

### Decision 8: Background Presence
A new `<AgentRunner />` component sits in the root layout. It shows a subtle "Thinking..." or "Loom-Pulse" indicator whenever the background agent is processing an event. This makes the agency visible without blocking the UI.

### Decision 9: The "No-Fallback" Guard
The `AgenticOrchestrator` will no longer return fallback content if the LLM fails.
- **BFF behavior:** Return 503 Service Unavailable.
- **Client behavior:** Intercept 503 in the `LLMClient`. Trigger a global `LLM_OFFLINE` state.
- **Route Guard:** Redirect the player to `/setup` (where provider keys are managed) if they try to enter an assessment while LLM is offline.

---

## 5. Implementation Phases (Audit-able Milestones)

### Phase 1: The Scaffold
- [ ] Create `src/core/agent/DirectorAgent.ts`.
- [ ] Bridge `EventBus` to `DirectorAgent`.
- [ ] Implement `4+1` schema validation in `LLMClient`.

### Phase 2: Calibration (Onboarding)
- [ ] Replace static `CALIBRATION_PROMPTS` in `onboarding/+page.svelte` with `DirectorAgent.requestCalibration()`.
- [ ] Implement the "Signal Threshold" loop.

### Phase 3: Dialogue Runtime
- [ ] Update `LLMDialogueRunner.svelte` to accept `AgenticProbe` instead of hardcoded fragments.
- [ ] Implement the "Orientation Quadrant" prompt template.

### Phase 4: Integration & Failure
- [ ] Implement the `/setup` redirect route guard.
- [ ] Add the `<AgentRunner />` visibility component.

---

## 6. Audit Checklist (Pass/Fail Criteria)

| Requirement | Audit Test | Result |
| :--- | :--- | :--- |
| **Context Evolution** | Does the same input in onboarding lead to different next questions on two separate runs? | [ ] |
| **4+1 Contract** | Do all questionnaires show exactly 4 MCQs and a text box? Do they fail gracefully if LLM returns 3? | [ ] |
| **Agency Visibility** | Is there a UI indicator that the background agent is "observing" events? | [ ] |
| **Zero Determinism** | Search `grep` for "The mirror is silent". Is it gone from the active path? (Fallbacks only for system-level errors, not game-logic). | [ ] |
| **Route Guards** | Disconnect internet. Does the app prevent starting an assessment and redirect to /setup? | [ ] |

**Signed:** Claude Code
**Approver:** User (Ishan Parihar)
