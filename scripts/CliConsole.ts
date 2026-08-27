/**
 * CliConsole — shared console helpers extracted from cli-game.ts.
 * Used by CurriculumCommands and the rest of the CLI for consistent
 * banner/info/warn/error formatting and JSON-mode awareness.
 */
import chalk from 'chalk';

let jsonMode = false;

export function setJsonMode(on: boolean): void {
  jsonMode = on;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function banner(text: string): void {
  if (jsonMode) return;
  console.log(`\n${chalk.bold.cyan('═══ ' + text + ' ═══')}`);
}

export function info(label: string, value: string): void {
  if (jsonMode) return;
  console.log(`  ${chalk.dim(label + ':')} ${value}`);
}

export function success(text: string): void {
  if (jsonMode) return;
  console.log(`  ${chalk.green('✓')} ${text}`);
}

export function warn(text: string): void {
  if (jsonMode) return;
  console.log(`  ${chalk.yellow('⚠')} ${text}`);
}

export function error(text: string): void {
  if (jsonMode) return;
  console.log(`  ${chalk.red('✗')} ${text}`);
}

export function separator(label: string): void {
  if (jsonMode) return;
  console.log(`\n${chalk.dim('── ' + label + ' ──')}`);
}
