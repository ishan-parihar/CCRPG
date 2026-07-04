import type { GameEventMap, GameEventType } from './GameEvents.js';

export type EventHandler<T extends GameEventType> = (payload: GameEventMap[T]) => void;

export class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<T extends GameEventType>(event: T, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(handler);
    return () => { set.delete(handler); };
  }

  emit<T extends GameEventType>(event: T, payload: GameEventMap[T]): void {
    const set = this.listeners.get(event);
    if (set) set.forEach(fn => fn(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}
