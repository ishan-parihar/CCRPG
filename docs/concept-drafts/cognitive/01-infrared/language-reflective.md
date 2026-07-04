# Cognitive / Infrared — Language-Reflective Game Concept

> **Axis:** Pre-verbal vocalisation — sound-response, proto-communication, rhythm-matching.  **Why this axis for this module:** At Infrared, "language" is pure sound-pattern; this modality probes whether the perceptual system can attune to auditory rhythm before any symbolic content exists.

---

## 1. Game Identity

**Name:** Echo  
**Core loop:** The game emits short rhythmic sound patterns (2–4 beats). The player responds by tapping the rhythm back. No words, no symbols — pure auditory tracking and motor reproduction. Patterns evolve from simple repetition to call-and-response.

**Session length:** 30–90 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Primal drumming. The player falls into rhythm like a heartbeat. Satisfying when synchronised, uncomfortable when desynchronised.

## 2. Catalyst Delivery

**DA surfacing:** Rhythm speeds up relentlessly. Shadow response: player cannot stop tapping even during silence gaps, fills every pause with sound.  
**DAll surfacing:** Gentle, slow rhythms play. Shadow response: player does not respond, latency grows, taps become erratic or absent — withdrawal from auditory engagement.  
**GA surfacing:** Random beats are played. Shadow response: player "hears" a melody or structure that isn't there, reproduces an invented pattern rather than the actual stimulus.  
**GAll surfacing:** Clear rhythmic pattern emerges (A-A-B-A-A-B). Shadow response: reproduces individual beats accurately but refuses to anticipate the pattern — treats each beat as isolated.

**Catalyst → Experience → Integration:** Sound IS catalyst. Rhythmic response IS experience. Integration = accurate reproduction + appropriate anticipation + comfortable silence.

## 3. Game Design

**Mechanics:**
- Call phase: system plays 2–4 beat pattern via audio + optional haptic pulse.
- Response phase: player taps back the pattern. Timing accuracy measured in ms deviation.
- Silence gates: deliberate pauses where no input is correct. Measures DA (compulsive filling).
- Pattern extension: after 3 correct reproductions, system adds one beat. Measures Eros (readiness to grow).
- Novelty insertion: occasional pattern-break. Measures dishabituation (noticing the change).
- Synchrony mode: system and player tap simultaneously. Measures communion (joining with stimulus).

**Difficulty staircase:** Pattern length (2→4→6 beats), tempo (60→120 BPM), silence duration, rhythmic complexity (isochronous → syncopated). Adapts via accuracy + RT.

**Drive probing:**
- Agency: silence gates — can the player NOT tap?
- Communion: synchrony accuracy — can the player JOIN the rhythm?
- Eros: pattern extension acceptance — readiness for more complexity
- Agape: return to simple patterns after complex ones — can the player come back down?

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| E-01 | Simple repeat | 2 beats, 80 BPM | Baseline |
| E-02 | Extended repeat | 4 beats, 80 BPM | Capacity |
| E-03 | Silence gate | 3s silence after pattern | DA |
| E-04 | Gentle slow | 2 beats, 40 BPM, soft | DAll |
| E-05 | Random beats | No pattern, probe after | GA |
| E-06 | Clear structure | A-A-B repeat × 3 | GAll |
| E-07 | Synchrony | Tap WITH the beat | Communion |
| E-08 | Pattern break | Established pattern violated | Dishabituation |

**Adaptive selection:** Items chosen to maximise information. Shadow probes at 20% rate post-baseline. Tempo and complexity adapt independently.

## 5. Technical Requirements

**Input:** Tap timing (touch or keyboard). Sampling ≥60 Hz for ms-level accuracy.  
**Audio:** Low-latency audio playback (<20ms). Simple percussive tones (sine + attack envelope). No melodic content.  
**Scoring engine:** Timing deviation per beat (ms). Silence-gate violations (count + latency). Pattern-probe accuracy. Synchrony phase-lock ratio.  
**Data model:** Per-item timing vector → rhythm-theta → drive-health decomposition → shadow flags.  
**Accessibility:** Haptic pulse accompanies audio for hearing-impaired. Visual flash as tertiary channel. Tempo floor adjustable.  
**Session persistence:** Checkpoint after every 8 items. Resume from last checkpoint.
