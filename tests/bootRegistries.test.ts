import { describe, it, expect, beforeAll } from 'vitest';
import { bootRegistries } from '../src/core/registries/boot.js';
import {
  LineRegistry,
  StageRegistry,
  RayRegistry,
  DriveRegistry,
  EncounterRegistry,
} from '../src/core/registries/index.js';

describe('bootRegistries', () => {
  beforeAll(() => {
    bootRegistries();
  });

  it('registers all 8 lines', () => {
    expect(LineRegistry.all()).toHaveLength(8);
  });

  it('registers all 8 stages', () => {
    expect(StageRegistry.all()).toHaveLength(8);
  });

  it('registers all 7 rays', () => {
    expect(RayRegistry.all()).toHaveLength(7);
  });

  it('registers all 4 drives', () => {
    expect(DriveRegistry.all()).toHaveLength(4);
  });

  it('registers Red stage encounters (38 total: 30 side + 3 mini + 1 main + 4 threshold)', () => {
    expect(EncounterRegistry.all()).toHaveLength(38);
  });

  it('Red stage has a main-boss encounter', () => {
    const mainBosses = EncounterRegistry.keysFor({ stage: 'Red', role: 'main' });
    expect(mainBosses.length).toBeGreaterThanOrEqual(1);
  });

  it('main boss covers all 4 quadrants', () => {
    const mainBoss = EncounterRegistry.get('red-main-tyrant');
    expect(mainBoss).toBeDefined();
    expect(mainBoss!.quadrants).toContain('UL');
    expect(mainBoss!.quadrants).toContain('UR');
    expect(mainBoss!.quadrants).toContain('LL');
    expect(mainBoss!.quadrants).toContain('LR');
  });
});
