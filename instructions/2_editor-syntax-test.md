## Editor setup

Set up editor with development environment using syntax checker, flow types and basic unit types

## Prettier

Prettier is opinionated code formatter for js, json, css, ... which automatically formats your code for you

`yarn add --dev prettier`

https://prettier.io/docs/en/editors.html
prettier-atom / prettier-vscode / JsPrettier (sublime)

.prettierrc

```
{
  "semi": false,
  "singleQuote": true
}
```

!! if ESLint integration is enabled prettier wont work without eslint

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

`yarn add babel-plugin-module-resolver`

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
          "root": "./"
        }
      }
    ]
  ]
}
```

## Allow EcmaScript features

Allowing for other modern standards needs to be specified for babel as well
We will be using class properties and deconstructors, so lets add support for them

`yarn add babel-plugin-transform-class-properties babel-plugin-transform-object-rest-spread`

.babelrc

```
{
  ...,
  "plugins": [
    ... ,
    "transform-class-properties",
    "transform-object-rest-spread"
  ]
}
```

## Jest and React testing library

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

`__mocks__/styleMock.js`
`export default {}`

`__mocks__/fileMock.js`
`export default ''`

src/test.js

```js
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'

afterEach(cleanup)
test('Test component shows content', () => {
  const { getByText } = render(<div>Hejhej</div>)
  expect(getByText(/^Hejhej/)).toBeInTheDocument()
})
```

`yarn test`

### What should you unit test?

Write tests to specify the purpose of a component and the expected bahaviour in interaction using the component

Let tests alert me when something breaks the specification.

Methods like getByText() and getByLabel() etc. allows us to write tests according with how users interact with the component

Test the interaction of multiple components working together in containers and views rather than just component snapshots

## Flow static types

Flow is a static type checker for JavaScript, allowing you to be stricter which types are allowed making the code easier to use and test.

```bash
yarn add --dev babel-cli flow-bin babel-preset-flow
```

.babelrc

```
{
  "presets": [..., "flow"]
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

components/Test/index.js

```js
// @flow
import React, { Component } from 'react'

type Props = {
  color: string,
  children: any
}
type State = {}
// export default function Test({ children, color = 'red' }: Props) {...}
export default class Test extends Component<Props, State> {
  render() {
    const { color = 'red', children } = this.props
    return (
      <div style={{ color }} className="Test">
        {children}
      </div>
    )
  }
}
```

## Precommit hook

Now when we have an exellent testing suite, we must make sure it it enforced. By running linting and tests before each commit. Only allow "valid" code to be committed.
`yarn add --dev precommit-hook`

package.json

```json
"scripts": {
  "test": "jest",
  "lint": "eslint src",
  "flow": "flow"
  "..."
},
"pre-commit": ["lint", "test", "flow"],
```

## Discussions

- How do we want to work with testing

## Exercises

- create a test file src/Test/test.js where you import the component Test and renders it using https://github.com/kentcdodds/react-testing-library and write tests to make sure:

  - som specific content is being rendered inside the component
  - a inner element with data-test="counter" has initial value of 0 when no counter prop is not passed, and that it is 14 when counter="14"
  - every time Test is being clicked data-test="counter" has increased it value by 5

- implement the component src/components/Test/index.js and make sure all tests passes

- Declare the flow types in the component
