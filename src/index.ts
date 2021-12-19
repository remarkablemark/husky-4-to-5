#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { name, version } from '../package.json';
import { HUSKY_VERSION } from './constants';
import { cwd, exec, log, write } from './utilities';

/**
 * Display exit code.
 */
process.on('exit', code => {
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
} catch (err) {
  isGitRepository = false;
}

/**
 * Require `package.json`.
 */
const packageJsonPath = resolve(cwd, 'package.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(packageJsonPath);

/**
 * Require husky config.
 */
let husky: { hooks: Record<string, string> } = {
  hooks: {}
};

const huskyrcPath = resolve(cwd, '.huskyrc');
const huskyrcJsonPath = resolve(cwd, '.huskyrc.json');
const huskyrcJsPath = resolve(cwd, '.huskyrc.js');
const huskyConfigJsPath = resolve(cwd, 'husky.config.js');

if (packageJson.husky) {
  husky = packageJson.husky;
  delete packageJson.husky;
} else if (existsSync(huskyrcPath)) {
  husky = JSON.parse(readFileSync(huskyrcPath).toString());
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
const { postinstall } = packageJson.scripts;
const huskyInstall = 'husky install';
packageJson.scripts.postinstall = postinstall
  ? `${huskyInstall} && ${postinstall}`
  : huskyInstall;

if (!packageJson.private) {
  devDependencies.push('pinst');
  const { postpublish, prepublishOnly } = packageJson.scripts;
  const pinstEnable = 'pinst --enable';
  packageJson.scripts.postpublish = postpublish
    ? `${pinstEnable} && ${postpublish}`
    : pinstEnable;
  const pinstDisable = 'pinst --disable';
  packageJson.scripts.prepublishOnly = prepublishOnly
    ? `${pinstDisable} && ${prepublishOnly}`
    : pinstDisable;
}

write(packageJsonPath, packageJson);

/**
 * Install dependencies.
 */
log('Installing devDependencies...');
exec(`npm install --save-dev ${devDependencies.join(' ')}`);
isGitRepository && exec('git add package.json');

/**
 * Add hooks.
 */
log('Adding hooks...');
exec(`npx ${huskyInstall}`);

Object.entries(husky.hooks).forEach(([hook, command]) => {
  if (/HUSKY_GIT_PARAMS/.test(command)) {
    exec(`npx husky set .husky/${hook} ''`);
    command = command
      .replace(/-E HUSKY_GIT_PARAMS/g, '--edit $1')
      .replace(/HUSKY_GIT_PARAMS/g, '$1');
    exec(`echo '${command}' >> .husky/${hook}`);
  } else {
    exec(`npx husky set .husky/${hook} '${command}'`);
  }
});

isGitRepository && exec('git add .husky');

/**
 * Commit changes.
 */
log('Committing changes...');
isGitRepository &&
  exec(
    `git commit -m 'chore: migrate husky 4 to ${HUSKY_VERSION}' -m '${name} v${version}'`
  );

log(`Finished ${name} v${version}`);
log('Test your Git hooks by running them. Example: `git commit --amend`');
