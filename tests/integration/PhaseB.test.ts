import { describe, it, expect } from 'vitest';
import { queryByLineStage, queryByModality, allModuleKeys, type ConceptDraftIndex } from '../../src/core/data/ConceptDraftIndex.js';
import { createRegistry, addHolon, removeHolon, queryByKind, queryByAltitude, getHolon } from '../../src/core/data/HolonRegistry.js';
import { getTexture, DEFAULT_POLARITY_ONTOLOGY } from '../../src/core/data/PolarityOntology.js';
import { EventBus } from '../../src/core/events/EventBus.js';
import { SignificatorStore } from '../../src/infra/persistence/SignificatorStore.js';
import { WorldStateStore } from '../../src/infra/persistence/WorldStateStore.js';
import { InMemoryStore } from '../../src/infra/persistence/KeyValueStore.js';
import { CryptoStore } from '../../src/infra/crypto/CryptoStore.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { Holon } from '../../src/core/domain/Holon.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { WorldState } from '../../src/core/engines/CandidateGeneration.js';

const altitudes: Record<Line, Stage> = {
  Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
  Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
};

const testHolon: Holon = {
  id: 'h1', name: 'Test', kind: 'NPC', line: 'Cognitive', stage: 'Red',
  drives: { dominant: 'Agency', secondary: 'Eros', shadowQuadrant: null },
  polarity: 'Sovereign', narrativeRole: 'test', relationships: [], active: true,
};

describe('ConceptDraftIndex', () => {
  const index: ConceptDraftIndex = {
    modules: {
      'cognitive:red': { line: 'Cognitive', stage: 'Red', title: 'Cognitive / Red', modalities: ['Deterministic', 'Strategic'] },
      'emotional:red': { line: 'Emotional', stage: 'Red', title: 'Emotional / Red', modalities: ['ScenarioChoice', 'Embodied'] },
    },
  };

  it('queries by line and stage', () => {
    expect(queryByLineStage(index, 'Cognitive', 'Red')?.title).toBe('Cognitive / Red');
    expect(queryByLineStage(index, 'Cognitive', 'Amber')).toBeUndefined();
  });

  it('queries by modality', () => {
    const results = queryByModality(index, 'Deterministic');
    expect(results).toHaveLength(1);
    expect(results[0]!.line).toBe('Cognitive');
  });

  it('lists all module keys', () => {
    expect(allModuleKeys(index)).toHaveLength(2);
  });
});

describe('HolonRegistry', () => {
  it('creates and queries registry', () => {
    const reg = createRegistry([testHolon]);
    expect(reg.holons).toHaveLength(1);
    expect(getHolon(reg, 'h1')).toBeDefined();
  });

  it('adds and removes holons immutably', () => {
    const reg = createRegistry([]);
    const added = addHolon(reg, testHolon);
    expect(added.holons).toHaveLength(1);
    expect(reg.holons).toHaveLength(0); // original unchanged

    const removed = removeHolon(added, 'h1');
    expect(removed.holons).toHaveLength(0);
  });

  it('queries by kind and altitude', () => {
    const reg = createRegistry([testHolon]);
    expect(queryByKind(reg, 'NPC')).toHaveLength(1);
    expect(queryByAltitude(reg, 'Red')).toHaveLength(1);
    expect(queryByAltitude(reg, 'Amber')).toHaveLength(0);
  });
});

describe('PolarityOntology', () => {
  it('has 64 entries', () => {
    expect(Object.keys(DEFAULT_POLARITY_ONTOLOGY)).toHaveLength(64);
  });

  it('retrieves texture by line and stage', () => {
    const t = getTexture(DEFAULT_POLARITY_ONTOLOGY, 'Cognitive', 'Red');
    expect(t).toBeDefined();
    expect(t!.sto).toBeTruthy();
    expect(t!.sts).toBeTruthy();
    expect(t!.exploratory).toBeTruthy();
  });
});

describe('EventBus', () => {
  it('emits and receives events', () => {
    const bus = new EventBus();
    let received = false;
    bus.on('session_started', () => { received = true; });
    bus.emit('session_started', { timestamp: 1000 });
    expect(received).toBe(true);
  });

  it('unsubscribes correctly', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('session_started', () => { count++; });
    bus.emit('session_started', { timestamp: 1000 });
    unsub();
    bus.emit('session_started', { timestamp: 2000 });
    expect(count).toBe(1);
  });
});

describe('SignificatorStore', () => {
  it('saves and loads significator', async () => {
    const store = new SignificatorStore(new InMemoryStore(), new CryptoStore());
    const sig = createSignificator('p1', altitudes, 'Red');
    await store.save(sig);
    const loaded = await store.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('p1');
    expect(loaded!.currentStage).toBe('Red');
  });

  it('returns null when nothing saved', async () => {
    const store = new SignificatorStore(new InMemoryStore(), new CryptoStore());
    expect(await store.load()).toBeNull();
  });
});

describe('WorldStateStore', () => {
  it('saves and loads world state', async () => {
    const store = new WorldStateStore(new InMemoryStore(), new CryptoStore());
    const world: WorldState = { holons: [testHolon], recentEncounterIds: ['e1'], cooldowns: {} };
    await store.save(world);
    const loaded = await store.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.holons).toHaveLength(1);
    expect(loaded!.recentEncounterIds).toContain('e1');
  });
});
