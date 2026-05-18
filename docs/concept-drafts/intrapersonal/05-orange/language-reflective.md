# Intrapersonal / Orange — Language-Reflective Game Concept

> **Axis:** Verbal articulation of self-concept — how the player talks about themselves reveals genuine depth versus performance.  **Why this axis for this module:** Self-authorship lives in language; the words chosen to describe the self reveal whether reflection is genuine, avoided, performed, or calcified.

---

## 1. Game Identity

**Name:** Self-Portrait in Words  
**Core loop:** Player responds to prompts about themselves — who they are, why they do what they do, what they want. An LLM evaluates responses not for "correctness" but for structural markers of genuine self-reflection versus shadow-patterned language.  
**Feel:** A conversation with a mirror that listens carefully. Intimate, unhurried. The game never judges content — only the *quality of self-examination* the language reveals.

## 2. Catalyst Delivery

**Catalyst type:** Linguistic confrontation — the gap between what you say about yourself and the structural depth of how you say it.  
**DA surfacing:** Language saturated with metrics, goals, improvement narratives. Self-description reads like a performance review. "I'm working on…" "I've improved at…" "My next goal is…" Absence of being-language.  
**DAll surfacing:** Language is generic, role-based, or deflective. "I'm just a [role]." "I don't really think about that." Short responses. Concrete-operational self-description without abstraction.  
**GA surfacing:** Language is elaborate, multiperspectival, and sophisticated — but ungrounded. "Part of me…" "It's complex…" "I'm many things…" without ever committing to a specific self-authored claim. Performed depth.  
**GAll surfacing:** Language is precise, coherent, and self-assured — but rigid. "I am X." "I always…" "I never…" No hedging, no uncertainty, no curiosity about what might be unknown.  
**Drive probes:** Agency = "I" statements with genuine authorship. Communion = references to how others see you (incorporated, not deflected). Eros = questions about the self, curiosity-language. Agape = acceptance-language, "and that's okay" without bypassing.

## 3. Game Design

**Prompt types:** Open-ended ("Describe yourself to someone who will never meet you"), comparative ("How are you different now from a year ago?"), hypothetical ("If you could change one thing about yourself, what and why?"), relational ("How would your closest friend describe you differently than you describe yourself?").  
**LLM rubric dimensions:** (1) Specificity vs. generality, (2) Agency vs. passivity, (3) Evidence-grounding vs. assertion, (4) Complexity vs. rigidity, (5) Presence vs. performance, (6) Curiosity vs. closure.  
**Progression:** Early prompts are low-threat ("What are you good at?"). Mid-game introduces discrepancy prompts ("Last session you said X — do you still agree?"). Late-game introduces confrontation prompts targeting the identified shadow pattern.  
**Feedback:** Never evaluative. Instead, reflective: "You used the word 'should' 4 times. What does that tell you?" The game mirrors language patterns back without interpretation, inviting the player's own meta-reflection.  
**Shadow-mode:** Prompts specifically designed to activate the dominant shadow — e.g., for DA: "Describe yourself without mentioning anything you've achieved or are working toward."

## 4. Item Pool

| Item category | Examples | What it measures |
|---|---|---|
| Identity prompts | "Who are you when no one is watching?" | Self-concept depth |
| Discrepancy prompts | "You said X last time — still true?" | Self-model stability |
| Constraint prompts | "Describe yourself in one sentence" | Distillation capacity |
| Relational prompts | "How would [person] describe you?" | Self-other integration |
| Shadow-targeted prompts | "Describe yourself without achievements" (DA) | Shadow activation |
| Temporal prompts | "Who will you be in 5 years?" | Self-projection capacity |

Prompts are never repeated. The LLM generates novel prompts within rubric-defined categories based on prior response patterns.

## 5. Technical Requirements

**LLM integration:** Rubric-based evaluation (not open-ended generation). The LLM scores responses on 6 dimensions using calibrated rubrics. No subjective interpretation — only structural linguistic markers.  
**Privacy:** Responses stored locally only. No cloud transmission of self-disclosure content. LLM evaluation happens on-device or with anonymised, non-attributable API calls.  
**Scoring:** Primary metric = linguistic self-reflection depth (composite of 6 rubric dimensions). Shadow indicators derived from pattern analysis across sessions (not single responses).  
**Session length:** 10–20 minutes. 3–5 prompts per session with unlimited response time.  
**Longitudinal tracking:** Response patterns tracked across sessions for drift, growth, and shadow-pattern consistency. Minimum 5 sessions before shadow classification confidence exceeds threshold.
