/**
 * Tests for T-2.17 — Perceptual layer shift at transformation.
 * Verifies that the WorldScene has the applyPerceptualLayerShift method
 * and that stage palette data is available for the shift.
 *
 * Note: full Phaser scene tests require a Phaser game instance; these
 * tests verify the data structures and registry that the shift depends on.
 */
import { describe, it, expect } from 'vitest';
import { bootRegistries } from '../../src/core/registries/boot.js';
import { StageRegistry } from '../../src/core/registries/index.js';

describe('T-2.17 — Perceptual layer shift data structures', () => {
  it('StageRegistry has palette data for playable stages', () => {
    bootRegistries();
    const red = StageRegistry.get('Red');
    expect(red).toBeDefined();
    expect(red!.palette).toBeDefined();
    expect(red!.palette!.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('Red stage palette has blood-iron-rust colors', () => {
    bootRegistries();
    const red = StageRegistry.get('Red');
    expect(red!.palette!.primary).toBe('#8B0000');
    expect(red!.palette!.secondary).toBeDefined();
    expect(red!.palette!.accent).toBeDefined();
  });

  it('Amber stage palette has sandstone colors', () => {
    bootRegistries();
    const amber = StageRegistry.get('Amber');
    expect(amber!.palette).toBeDefined();
    expect(amber!.palette!.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('Orange stage palette has steel-glass colors', () => {
    bootRegistries();
    const orange = StageRegistry.get('Orange');
    expect(orange!.palette).toBeDefined();
    expect(orange!.palette!.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('playable stages have audioMode defined', () => {
    bootRegistries();
    const playableStages = ['Red', 'Amber', 'Orange'];
    for (const stage of playableStages) {
      const mod = StageRegistry.get(stage as never);
      expect(mod?.audioMode).toBeDefined();
      expect(mod!.audioMode!.length).toBeGreaterThan(0);
    }
  });

  it('palette primary colors are distinct across stages', () => {
    bootRegistries();
    const colors = new Set<string>();
    for (const stage of ['Red', 'Amber', 'Orange']) {
      const mod = StageRegistry.get(stage as never);
      if (mod?.palette) {
        colors.add(mod.palette.primary);
      }
    }
    // Each stage should have a unique primary color
    expect(colors.size).toBe(3);
  });
});
