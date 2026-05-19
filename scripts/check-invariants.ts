/**
 * Build-time invariant verification script.
 * Run with: npx tsx scripts/check-invariants.ts
 * Verifies that core registries, data indices, and enums are structurally valid.
 */

import { bootRegistries } from '../src/core/registries/boot.js';
import { allModuleKeys } from '../src/core/data/ConceptDraftIndex.js';
import { createRegistry } from '../src/core/data/HolonRegistry.js';
import {
  ALL_MODALITIES,
  ALL_SHADOW_QUADRANTS,
  ALL_HOLON_KINDS,
  ALL_POLARITY_MODES,
  ALL_ENERGETIC_DIRECTIONS,
} from '../src/core/domain/enums.js';

let passed = 0;
let failed = 0;

function check(label: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${label}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  FAIL: ${label} - ${msg}`);
  }
}

console.log('Running build-time invariant checks...\n');

check('bootRegistries() executes without throwing', () => {
  bootRegistries();
});

check('allModuleKeys is a callable function', () => {
  if (typeof allModuleKeys !== 'function') {
    throw new Error(`Expected function, got ${typeof allModuleKeys}`);
  }
});

check('createRegistry can create an empty registry', () => {
  const registry = createRegistry([]);
  if (!registry || !Array.isArray(registry.holons)) {
    throw new Error('createRegistry([]) did not return a valid registry');
  }
  if (registry.holons.length !== 0) {
    throw new Error(`Expected empty holons array, got length ${registry.holons.length}`);
  }
});

check('ALL_MODALITIES has at least 1 member', () => {
  if (ALL_MODALITIES.length < 1) throw new Error('ALL_MODALITIES is empty');
});

check('ALL_SHADOW_QUADRANTS has at least 1 member', () => {
  if (ALL_SHADOW_QUADRANTS.length < 1) throw new Error('ALL_SHADOW_QUADRANTS is empty');
});

check('ALL_HOLON_KINDS has at least 1 member', () => {
  if (ALL_HOLON_KINDS.length < 1) throw new Error('ALL_HOLON_KINDS is empty');
});

check('ALL_POLARITY_MODES has at least 1 member', () => {
  if (ALL_POLARITY_MODES.length < 1) throw new Error('ALL_POLARITY_MODES is empty');
});

check('ALL_ENERGETIC_DIRECTIONS has at least 1 member', () => {
  if (ALL_ENERGETIC_DIRECTIONS.length < 1) throw new Error('ALL_ENERGETIC_DIRECTIONS is empty');
});

console.log(`\n${passed + failed} checks run: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  console.error('\nInvariant check FAILED.');
  process.exit(1);
} else {
  console.log('\nAll invariants passed.');
  process.exit(0);
}
