# Emotional × Infrared — Language-Reflective Game

## 1. Game Identity

**Modality:** Language-Reflective (pre-verbal expression)
**Unique axis:** Vocalisations, breath-affect coupling, sound-as-feeling
**Core loop:** Affect arises → player produces sound → sound matches affect-state → affect resolves through expression
**Fantasy frame:** A creature in darkness communicates only through cries, growls, and sighs. Sound IS feeling made audible. No words exist yet.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** Affect rises and the creature cannot stop vocalising — sound loops without resolution. Catalyst: introduce silence-gaps where sound must cease. Healthy expression ends.
**DAll (Affect-Numbness):** Stimuli arrive but no sound emerges. The creature is mute. Catalyst: vibrations in the environment that invite vocal resonance. The world hums; can the creature hum back?
**GA (Premature Contagion):** The creature mimics other creatures' sounds without producing its own first. Catalyst: require self-sound before echo is possible.
**GAll (Affect Fortress):** The creature produces only one sound — a survival grunt. Refuses variation. Catalyst: environmental sounds that model safe expansion of vocal range.

**Drive probes:**
- Eros: vocal novelty — does the creature try new sounds?
- Agape: vocal settling — does sound return to silence naturally?
- Agency: vocal sovereignty — is the sound the creature's own (not mimicry)?
- Communion: vocal receptivity — does the creature respond to environmental sound?

---

## 3. Game Design

**Mechanic:** Microphone input (or tap-rhythm proxy). Player produces vocalisations in response to affect-stimuli. Game analyses: pitch (arousal), volume (intensity), duration (activation length), silence-gaps (deactivation).

**Non-mic fallback:** Tap-and-hold with pressure/duration as proxy for vocalisation. Rapid taps = high-arousal cry. Long hold = sustained moan. Release = silence.

**Progression:**
- Phase 1 (diagnosis): Simple stimuli, measure vocal response presence, duration, and variety.
- Phase 2 (catalyst): Patterns that challenge detected shadows. Storm gets silence-requirements. Numbness gets resonance-invitations. Fortress gets expansion-models. Contagion gets self-first sequencing.
- Phase 3 (integration): Free vocalisation over varied stimuli. Confirm healthy sound-affect coupling.

**Infinite checkpoint:** Each stimulus-response cycle is a checkpoint. Sessions = 1–60 cycles.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Silence Stone | Rewards clean vocal cessation (>500ms gap) | DA |
| Resonance Seed | Amplifies environmental hum to invite response | DAll |
| Own-Voice Crystal | Bonus for unique (non-mimicked) vocalisation | GA |
| Range Feather | Bonus for pitch/volume outside previous range | GAll |
| Settling Sigh | Bonus for descending pitch at cycle end | DA / Agape |
| First Cry | Bonus for vocal onset within 300ms of stimulus | DAll / Communion |
| Sovereign Tone | Bonus for consistent personal pitch signature | GA / Agency |
| Reaching Note | Bonus for highest pitch attempted this session | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Microphone (pitch, volume, duration analysis) OR tap-rhythm fallback (pressure, duration, gap timing).
**Audio analysis:** Pitch detection ≤50ms latency. Volume threshold calibrated per-player. Silence detection at 300ms gap.
**Scoring model:** Vocal-affect coupling = f(response_presence, duration_appropriateness, resolution_quality, range_variety). Drive scores from probe-specific vocal behaviours.
**Adaptive difficulty:** Stimulus complexity increases with health. Silence-gap requirements tighten for DA. Resonance intensity decreases for DAll (less prompting needed).
**Data emitted:** Per-cycle: onset_ms, pitch_mean, volume_mean, duration_ms, silence_gap_ms, mimicry_flag. Per-session: shadow_scores[4], drive_scores[4], vocal_affect_health.
