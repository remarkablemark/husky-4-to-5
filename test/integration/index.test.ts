import child_process from 'child_process';
import { dirname, resolve } from 'path';
import { promisify } from 'util';

import { exists, readFile } from './utilities';

const exec = promisify(child_process.exec);

const build = 'build';
const fixtures = 'fixtures';

const path = {
  bin: resolve(__dirname, '../../lib/bin.js'),
  cwd: process.cwd(),
  fixtures: {
    huskyrcJson: resolve(__dirname, fixtures, 'huskyrc-json'),
  },
};

const fixturesDirectory = path.fixtures.huskyrcJson;
const buildDirectory = fixturesDirectory.replace(fixtures, build);

beforeAll(async () => {
  await exec(`rm -rf ${buildDirectory}`);
  await exec(`mkdir -p ${dirname(buildDirectory)}`);
  await exec(`cp -r ${fixturesDirectory} ${buildDirectory}`);
  await exec(`git init ${buildDirectory}`);
  await exec(`git -C ${buildDirectory} add .`);
  await exec(`git -C ${buildDirectory} commit -a -m 'chore: initial commit'`);
  await exec(`cd ${buildDirectory} && node ${path.bin}`);
}, 30000); // increase timeout to 30 seconds

afterAll(async () => {
  await exec(`rm -rf ${buildDirectory}`);
  await exec(`cd ${path.cwd}`);
});

describe('.huskyrc.json', () => {
  it('removes .huskyrc.json', async () => {
    expect(await exists(resolve(buildDirectory, '.huskyrc.json'))).toBe(false);
  });

  it('creates .husky directory', async () => {
    expect(await exists(resolve(buildDirectory, '.husky'))).toBe(true);
  });

  it('adds .husky/commit-msg', async () => {
    expect(
      await readFile(resolve(buildDirectory, '.husky/commit-msg')),
    ).toMatchSnapshot();
  });

  it('adds .husky/pre-commit', async () => {
    expect(
      await readFile(resolve(buildDirectory, '.husky/pre-commit')),
    ).toMatchSnapshot();
  });

  it('updates package.json', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(resolve(buildDirectory, 'package.json'));
    expect(packageJson).toMatchObject({
      scripts: {
        test: 'exit 0',
        prepare: 'husky',
      },
      devDependencies: {
        husky: expect.stringContaining('^9.'),
      },
    });
  });
});
