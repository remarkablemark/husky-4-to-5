#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { name, version } from '../package.json';
import { HUSKY_VERSION } from './constants';
import { cwd, exec, log, write } from './utilities';

/**
 * Display exit code.
 */
process.on('exit', (code) => {
  log(`Exited with code: ${code}`);
});

/**
 * Display package info.
 */
log(`${name} v${version}`);

/**
 * Check if current working directory is git repository.
 */
let isGitRepository = true;

try {
  exec(`git -C ${cwd} rev-parse`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
  isGitRepository = false;
}

/**
 * Require `package.json`.
 */
const packageJsonPath = join(cwd, 'package.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(packageJsonPath);

/**
 * Require husky config.
 */
let husky: { hooks: Record<string, string> } = {
  hooks: {},
};

const huskyrcPath = join(cwd, '.huskyrc');
const huskyrcJsonPath = join(cwd, '.huskyrc.json');
const huskyrcJsPath = join(cwd, '.huskyrc.js');
const huskyConfigJsPath = join(cwd, 'husky.config.js');

if (packageJson.husky) {
  husky = packageJson.husky;
  delete packageJson.husky;
} else if (existsSync(huskyrcPath)) {
  husky = JSON.parse(readFileSync(huskyrcPath, 'utf8'));
  exec(`git rm ${huskyrcPath}`);
} else if (existsSync(huskyrcJsonPath)) {
  husky = require(huskyrcJsonPath);
  exec(`git rm ${huskyrcJsonPath}`);
} else if (existsSync(huskyrcJsPath)) {
  husky = require(huskyrcJsPath);
  exec(`git rm ${huskyrcJsPath}`);
} else if (existsSync(huskyConfigJsPath)) {
  husky = require(huskyConfigJsPath);
  exec(`git rm ${huskyConfigJsPath}`);
}

/**
 * devDependencies.
 */
const devDependencies = [`husky@${HUSKY_VERSION}`];

/**
 * Update `package.json`.
 */
packageJson.scripts = packageJson.scripts || {};
const { prepare } = packageJson.scripts;
const huskyInstall = 'husky';
packageJson.scripts.prepare = prepare
  ? `${huskyInstall} && ${prepare}`
  : huskyInstall;

write(packageJsonPath, packageJson);

/**
 * Check whether project is using npm or yarn.
 */
const hasYarn = existsSync('yarn.lock');

/**
 * Install dependencies.
 */
log('Installing devDependencies...');

if (hasYarn) {
  exec(`yarn add --dev ${devDependencies.join(' ')}`);
} else {
  exec(`npm install --save-dev ${devDependencies.join(' ')}`);
}

if (isGitRepository) {
  exec('git add package.json');
}

/**
 * Add hooks.
 */
log('Adding hooks...');
exec(`npx ${huskyInstall}`);

Object.entries(husky.hooks).forEach(([hook, command]) => {
  const huskyHookPath = join('.husky', hook);

  if (/HUSKY_GIT_PARAMS/.test(command)) {
    command = command
      .replace(/-E HUSKY_GIT_PARAMS/g, '--edit $1')
      .replace(/HUSKY_GIT_PARAMS/g, '$1');
  }

  exec(`echo '${command}' >> ${huskyHookPath}`);
});

if (isGitRepository) {
  exec('git add .husky');
}

/**
 * Commit changes.
 */
log('Committing changes...');

if (isGitRepository) {
  exec(
    `git commit -m 'chore: migrate husky to ${HUSKY_VERSION}' -m '${name} v${version}'`,
  );
}

log(`Finished ${name} v${version}`);
log('Test your Git hooks by running `git commit --amend`');
