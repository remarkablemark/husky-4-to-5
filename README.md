# husky-4-to-5

[![NPM](https://nodei.co/npm/husky-4-to-5.png)](https://nodei.co/npm/husky-4-to-5/)

[![NPM version](https://img.shields.io/npm/v/husky-4-to-5.svg)](https://www.npmjs.com/package/husky-4-to-5)
[![Build Status](https://github.com/remarkablemark/husky-4-to-5/workflows/build/badge.svg?branch=master)](https://github.com/remarkablemark/husky-4-to-5/actions?query=workflow%3Abuild)

Migrates [husky](https://typicode.github.io/husky) 4 to 5.

```sh
npx husky-4-to-5
```

Alternatively, there's [typicode/husky-4-to-5](https://github.com/typicode/husky-4-to-5) (requires npm 7+):

```sh
npm exec -- github:typicode/husky-4-to-5 --package-manager npm
```

## Install

Install the CLI globally:

```sh
# with npm
npm install --global husky-4-to-5

# with yarn
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
  - prepends `husky install` to `postinstall`
- installs devDependency:
  - [husky](https://www.npmjs.com/package/husky)

If the package is not `private`, the script also:

- updates `package.json` scripts:
  - prepends `pinst --enable` to `postpublish`
  - prepends `pinst --disable` to `prepublishOnly`
- installs devDependency:
  - [pinst](https://www.npmjs.com/package/pinst)

Finally, the script adds the hooks from one of the config files:

- `.huskyrc`
- `.huskyrc.json`
- `.huskyrc.js`
- `husky.config.js`

The config file will be removed and changes to the repository will be committed.

Hooks may need to be manually updated to be run via the package manager. For example:

```
jest → npx --no-install jest
     → yarn jest

jest && eslint → npx --no-install jest && npx --no-install eslint
               → yarn jest && yarn eslint

commitlint -E HUSKY_GIT_PARAMS → npx --no-install commitlint --edit $1
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

Only collaborators with credentials can release and publish:

```sh
npm run release
git push --follow-tags && npm publish
```

## License

[MIT](https://github.com/remarkablemark/husky-4-to-5/blob/master/LICENSE)
