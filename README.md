# husky-4-to-5

[![NPM](https://nodei.co/npm/husky-4-to-5.png)](https://nodei.co/npm/husky-4-to-5/)

[![NPM version](https://img.shields.io/npm/v/husky-4-to-5.svg)](https://www.npmjs.com/package/husky-4-to-5)
[![build](https://github.com/remarkablemark/husky-4-to-5/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablemark/husky-4-to-5/actions/workflows/build.yml)

:dog: Migrate [husky](https://typicode.github.io/husky/) from 4 to 9.

```sh
npx husky-4-to-5
```

Alternatively, there's [typicode/husky-4-to-8](https://github.com/typicode/husky-4-to-8) (requires npm 7+).

## Install

### Global

Install with npm:

```sh
npm install --global husky-4-to-5
```

Install with yarn:

```sh
yarn global add husky-4-to-5
```

## Usage

If the CLI is installed globally, you can execute it in the command-line:

```sh
husky-4-to-5
```

Otherwise, you can install and execute the CLI like so:

```sh
npx husky-4-to-5
```

## Explanation

The script:

- updates `package.json` scripts:
  - prepends `husky` to `prepare`
- installs devDependency:
  - [husky](https://www.npmjs.com/package/husky)

Finally, the script adds the hooks from one of the config files:

- `.huskyrc`
- `.huskyrc.json`
- `.huskyrc.js`
- `husky.config.js`

The config file will be removed and changes to the repository will be committed.

Hooks may need to be manually updated to be run via the package manager. For example:

```sh
jest → npx jest
     → yarn jest

jest && eslint → npx jest && npx eslint
               → yarn jest && yarn eslint

commitlint -E HUSKY_GIT_PARAMS → npx commitlint --edit $1
                               → yarn commitlint --edit $1
```

## Lint

Lint files:

```sh
npm run lint
```

Fix lint errors:

```sh
npm run lint:fix
```

## Release

Release and publish are automated with [Release Please](https://github.com/googleapis/release-please).

## License

[MIT](https://github.com/remarkablemark/husky-4-to-5/blob/master/LICENSE)
