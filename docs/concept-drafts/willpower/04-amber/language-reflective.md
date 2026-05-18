# Willpower / Amber — Language-Reflective Game Concept

> **Axis:** Verbal articulation of duty, obligation, and vow — how the player talks about commitment reveals the structure of their duty-will.
> **Why this axis for this module:** The language of obligation is diagnostic. "I have no choice" (vow-slave), "I changed my mind" (oath-breaker), "I follow my own reasoning" (premature strategist), and "I just do my duty" (code-clinger) are structurally distinct and reveal which shadow is active.

---

## 1. Game Identity

- **Title:** "The Oath-Keeper's Chronicle"
- **Core mechanic:** The player narrates their commitments, explains their obligations, and reflects on their duty-history. An LLM-powered scribe records and analyses the language of obligation, surfacing shadow patterns through what the player says and how they say it.
- **Duration:** 3-8 minutes per session (open-ended reflection with structured prompts)
- **Internal progression:** Naming the Vow → Explaining the Duty → Facing the Breach → The Code Examined → The Chronicle Complete

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** The verbal dimension of duty-will — how the player conceptualises, justifies, and narrates their commitments. Language reveals the STRUCTURE of the will: whether duty is experienced as sovereign choice, external compulsion, rational calculation, or sacred obligation.

**How this differs from other modalities:** Unlike deterministic (which measures raw holding), this modality measures the METACOGNITIVE relationship to commitment. A player who holds vows perfectly (deterministic) but cannot articulate why (language-reflective) has implicit capacity without metacognition. A player who articulates beautifully but cannot hold (deterministic) has golden-addiction.

**What it uniquely surfaces:** Golden-addiction (sophisticated language without capacity), code-clinging (refuses to examine the code verbally), and the quality of the player's relationship to obligation as a concept.

**Successful integration:** The player can articulate their commitments clearly, explain why they hold them, acknowledge when they've broken them, and engage with questions about the code without anxiety or dismissal.

---

## 3. Game Design

### Setup
The Chronicle: a journal-style interface where the player's vow-history is recorded. An NPC scribe (the Chronicler) asks questions about the player's commitments. The player responds in free text. The LLM analyses responses for shadow patterns and drive-health signals.

### Interaction
- **Naming the Vow (1-5):** "What have you committed to? Name your current obligations." Assesses: can they name concrete commitments? (Dark-allergy: vague or absent. Dark-addiction: overwhelming list.)
- **Explaining the Duty (5-15):** "Why do you hold this commitment? What would happen if you released it?" Assesses: is the duty sovereign or compelled? (Vow-slave: "I have no choice." Oath-breaker: "I could release it easily.")
- **Facing the Breach (15-30):** "Tell me about a commitment you broke. What happened?" Assesses: can they acknowledge breach without collapse or dismissal? (Dark-addiction: cannot acknowledge. Dark-allergy: dismisses.)
- **The Code Examined (30-50):** "Is this commitment still worth keeping? How do you know?" Assesses: can they examine the code? (Code-clinger: refuses. Premature strategist: over-rationalises.)
- **The Chronicle Complete (50+):** Full integration: names, explains, acknowledges breach, examines — all with healthy drive expression.

### Feedback
- Sovereign duty-language → "Your word is your own. You hold it because you choose to. The chronicle records this."
- Compelled duty-language → "You say you have no choice. But you swore. Was the swearing a choice? The chronicle asks."
- Dismissive language → "You say it doesn't matter. But you said you would. The chronicle remembers."
- Examination-refusal → "You hold the code. Good. The chronicle asks only: do you know why? Not to change it — to understand it."
- Rational bypass → "You have a plan. Good. But can you hold a simple vow without the plan? The chronicle tests this."

### Difficulty Adaptation
- Prompt complexity: concrete ("what did you commit to?") → abstract ("what does commitment mean to you?")
- Reflection depth: surface ("name your vow") → deep ("why is this vow worth your life?")
- Breach-acknowledgement: minor breach → major breach → identity-level breach
- Code-examination: gentle ("do you understand this vow?") → challenging ("is this vow still right?")

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming the Vow | 1-5 | Concrete commitment identification |
| Explaining the Duty | 5-15 | Obligation-justification and sovereignty |
| Facing the Breach | 15-30 | Breach-acknowledgement and integration |
| The Code Examined | 30-50 | Meta-cognitive engagement with obligations |
| The Chronicle Complete | 50+ | Full verbal duty-will integration |

---

## 4. Item Pool

- **Vow-naming prompts:** Requests to identify current commitments — 20+
- **Duty-explanation prompts:** Questions about why obligations are held — 20+
- **Breach-reflection prompts:** Questions about broken commitments — 15+
- **Code-examination prompts:** Questions about the worth and basis of obligations — 15+
- **Integration prompts:** Multi-dimensional reflection tasks — 10+

---

## 5. Technical Requirements

- **Input types:** Free text (primary); structured selection (secondary for accessibility)
- **Timing:** Response latency tracked; reflection depth measured; avoidance patterns detected
- **NPC/AI:** LLM-powered Chronicler with rubric-based analysis; shadow-pattern detection in language; drive-health signal extraction; cross-session narrative tracking
- **LLM rubrics:** Sovereignty vs. compulsion language; examination vs. refusal patterns; breach-acknowledgement quality; rational bypass detection; vow-slave vs. oath-breaker language signatures
- **State persistence:** Full response history; language pattern tracking; shadow-signal accumulation; cross-session narrative coherence; drive-health language scores; checkpoint position
