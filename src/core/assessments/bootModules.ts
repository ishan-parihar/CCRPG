import { ModuleRegistry } from './registry.js';
import * as cognitive from './cognitive/index.js';
import * as emotional from './emotional/index.js';
import * as moral from './moral/index.js';
import * as intrapersonal from './intrapersonal/index.js';
import * as spiritual from './spiritual/index.js';
import * as somatic from './somatic/index.js';
import * as willpower from './willpower/index.js';
import * as interpersonal from './interpersonal/index.js';

export function bootModuleRegistry(): ModuleRegistry {
  const registry = new ModuleRegistry();
  const lines = [cognitive, emotional, moral, intrapersonal, spiritual, somatic, willpower, interpersonal];
  for (const line of lines) {
    for (const module of Object.values(line)) {
      registry.register(module);
    }
  }
  return registry;
}
