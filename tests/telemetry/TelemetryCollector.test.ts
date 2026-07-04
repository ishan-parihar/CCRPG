import { describe, it, expect } from 'vitest';
import { TelemetryCollector } from '../../src/core/telemetry/TelemetryCollector.js';
import type { TelemetryEvent } from '../../src/core/telemetry/TelemetryEvent.js';

function makeEvent(type: TelemetryEvent['type'], id = 'evt-1'): TelemetryEvent {
  return { id, type, timestamp: Date.now(), data: {} };
}

describe('TelemetryCollector', () => {
  it('starts empty', () => {
    const collector = new TelemetryCollector();
    expect(collector.getEvents()).toHaveLength(0);
  });

  it('records events', () => {
    const collector = new TelemetryCollector();
    const event = makeEvent('encounter_completed');
    collector.record(event);
    expect(collector.getEvents()).toHaveLength(1);
    expect(collector.getEvents()[0]).toBe(event);
  });

  it('records multiple events in order', () => {
    const collector = new TelemetryCollector();
    const e1 = makeEvent('session_started', 'e1');
    const e2 = makeEvent('encounter_completed', 'e2');
    const e3 = makeEvent('session_ended', 'e3');
    collector.record(e1);
    collector.record(e2);
    collector.record(e3);
    expect(collector.getEvents()).toEqual([e1, e2, e3]);
  });

  it('getEventsByType filters correctly', () => {
    const collector = new TelemetryCollector();
    collector.record(makeEvent('encounter_completed', 'a'));
    collector.record(makeEvent('shadow_surfaced', 'b'));
    collector.record(makeEvent('encounter_completed', 'c'));
    const encounters = collector.getEventsByType('encounter_completed');
    expect(encounters).toHaveLength(2);
    expect(encounters.every(e => e.type === 'encounter_completed')).toBe(true);
  });

  it('getEventsByType returns empty for no matches', () => {
    const collector = new TelemetryCollector();
    collector.record(makeEvent('session_started'));
    expect(collector.getEventsByType('shadow_resolved')).toHaveLength(0);
  });

  it('clear removes all events', () => {
    const collector = new TelemetryCollector();
    collector.record(makeEvent('session_started'));
    collector.record(makeEvent('session_ended'));
    collector.clear();
    expect(collector.getEvents()).toHaveLength(0);
  });

  it('getStats returns correct totals and breakdown', () => {
    const collector = new TelemetryCollector();
    collector.record(makeEvent('encounter_completed', 'a'));
    collector.record(makeEvent('encounter_completed', 'b'));
    collector.record(makeEvent('shadow_surfaced', 'c'));
    collector.record(makeEvent('transformation_triggered', 'd'));

    const stats = collector.getStats();
    expect(stats.totalEvents).toBe(4);
    expect(stats.byType.encounter_completed).toBe(2);
    expect(stats.byType.shadow_surfaced).toBe(1);
    expect(stats.byType.transformation_triggered).toBe(1);
    expect(stats.byType.session_started).toBe(0);
    expect(stats.byType.session_ended).toBe(0);
    expect(stats.byType.polarity_shift).toBe(0);
    expect(stats.byType.shadow_resolved).toBe(0);
  });
});
