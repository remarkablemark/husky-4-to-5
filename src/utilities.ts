import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

import type { JSONValue } from './types';

export const cwd = process.cwd();

const execSyncOptions = {
  cwd: cwd,
  stdio: 'inherit'
} as const;

/**
 * Runs command.
 */
export function exec(command: string) {
  return execSync(command, execSyncOptions);
}

/**
 * Logs to console.
 */
export function log(...args: string[]) {
  console.log('INFO:', ...args);
}

/**
 * Writes to file.
 */
export function write(file: string, data: JSONValue) {
  return writeFileSync(
    file,
    (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) + '\n'
  );
}
