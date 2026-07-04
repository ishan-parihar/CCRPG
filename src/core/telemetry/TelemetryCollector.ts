import type { TelemetryEvent, TelemetryEventType } from './TelemetryEvent.js';
import { ALL_TELEMETRY_EVENT_TYPES } from './TelemetryEvent.js';

export class TelemetryCollector {
  private events: TelemetryEvent[] = [];

  record(event: TelemetryEvent): void {
    this.events.push(event);
  }

  getEvents(): readonly TelemetryEvent[] {
    return this.events;
  }

  getEventsByType(type: TelemetryEventType): TelemetryEvent[] {
    return this.events.filter(e => e.type === type);
  }

  clear(): void {
    this.events = [];
  }

  getStats(): { totalEvents: number; byType: Record<TelemetryEventType, number> } {
    const byType = {} as Record<TelemetryEventType, number>;
    for (const t of ALL_TELEMETRY_EVENT_TYPES) {
      byType[t] = 0;
    }
    for (const e of this.events) {
      byType[e.type]++;
    }
    return { totalEvents: this.events.length, byType };
  }
}
