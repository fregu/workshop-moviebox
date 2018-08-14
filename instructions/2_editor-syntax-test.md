## Editor setup

Set up editor with development environment using syntax checker, flow types and basic unit types

## Prettier

Prettier is opinionated code formatter for js, json, css, ... which automatically formats your code for you

```
yarn add prettier --dev
```

https://prettier.io/docs/en/editors.html
prettier-atom / prettier-vscode / JsPrettier (sublime)

.prettierrc

```
{
  "semi": false,
  "singleQuote": true
}
```

## Eslint

Eslint is a pluggable JavaScript linter, which validates your code based on certain rules and guidelines, to help you write cleaner and better code.

```bash
yarn add --dev eslint babel-eslint eslint-plugin-babel eslint-plugin-react eslint-plugin-prettier eslint-config-prettier eslint-plugin-standard eslint-config-standard eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node eslint-plugin-promise
```

.eslintrc.json

```json
{
  "parser": "babel-eslint",
  "extends": [
    "standard",
    "plugin:flowtype/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/flowtype",
    "prettier/react",
    "prettier/standard"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
    "es6": true
  },
  "plugins": ["flowtype", "jsx-a11y", "react", "prettier", "standard"]
}
```

## Aliases and root

By using aliases and root path, we can import modules based on their name instead of their relative location in the file tree '../../components/MyComponent' -> 'components/MyComponent'

```bash
yarn add --dev babel-plugin-module-resolver
```

.babelrc

```
{
  ...,
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "alias": {
          "test": "./test",
          "underscore": "lodash"
        }
      }
    ]
  ]
}
```

## Jest

Jest is a JavaScript testing library built for React which makes automated testing easy. It is also a great way of defining the purpose of your components before writing the component, making sure it does what is is supposed to. And allerts you when that functionality breaks.

We will use react-testing-library which is utility helper (like encyme) which makes rendering, simulating and quering objects in dom easier

```bash
yarn add --dev jest jest-dom react-testing-library
```

package.json

```json
{
  "jest": {
    "testURL": "http://localhost",
    "moduleNameMapper": {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
      "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
    }
  },
  "scripts": {
    "test": "jest"
  }
}
```

components/Test/test.js

```js
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import { Test } from './index.js' // Get unconnected component

afterEach(cleanup)
test('Test component shows content', () => {
  const { getByText } = render(<Test>Hejhej</Test>)
  expect(getByText(/^Hejhej/))
})
```

```bash
yarn test
```

## Flow types

Flow is a static type checker for JavaScript, allowing you to be stricter which types are allowed making the code easier to use and test.

```bash
yarn add --dev babel-cli flow-bin babel-preset-flow
```

.babelrc

```
{
  "presets": ["flow"]
}
```

```bash
yarn run flow init
yarn run flow
```

.flowconfig

```
[options]
module.name_mapper='^\(.*\)$' -> '<PROJECT_ROOT>/src/\1'
```

```js
// @flow
...
type Props = {
  color: string,
  children: any
}
export default ({ children, color = 'red' }: Props) => (
  ...
)
```

## Precommit hook

Now when we have an exellent testing suite, we must make sure it it enforced. By running linting and tests before each commit. Only allow "valid" code to be committed.

package.json

```json
scripts: {
  "test": "jest",
  "lint": "eslint src",
  "precommit": "yarn test && yarn flow && yarn lint",
  "..."
}
```

## Exercises

- create a basic component components/Test and make sure the test passes

- Create a simple react component with a formfield and a list items where items and default value in input is based on props

- Define approptiate flow types

- Add a test to the component making sure it fires an onSubmit once on submitting the form, and onInput prop on each key press. (https://github.com/kentcdodds/react-testing-library)
