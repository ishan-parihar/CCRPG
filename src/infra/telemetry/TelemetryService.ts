import type { TelemetryEventType } from '../../core/telemetry/TelemetryEvent.js';
import type { TelemetryEvent } from '../../core/telemetry/TelemetryEvent.js';
import { TelemetryCollector } from '../../core/telemetry/TelemetryCollector.js';
import type { TelemetryStore } from './TelemetryStore.js';

let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `tel-${Date.now()}-${idCounter}`;
}

export class TelemetryService {
  constructor(
    private readonly collector: TelemetryCollector,
    private readonly store: TelemetryStore,
    private readonly getOptIn: () => boolean,
  ) {}

  isEnabled(): boolean {
    return this.getOptIn();
  }

  recordEvent(type: TelemetryEventType, data: Record<string, unknown>): void {
    if (!this.isEnabled()) return;
    const event: TelemetryEvent = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      data,
    };
    this.collector.record(event);
  }

  async flush(): Promise<void> {
    if (!this.isEnabled()) return;
    const events = this.collector.getEvents();
    if (events.length === 0) return;
    const existing = await this.store.load();
    await this.store.save([...existing, ...events]);
    this.collector.clear();
  }

  getCollector(): TelemetryCollector {
    return this.collector;
  }
}
