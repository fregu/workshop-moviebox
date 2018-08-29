## Editor setup

Set up editor with development environment using syntax checker, flow types and basic unit types

## Prettier

Prettier is opinionated code formatter for js, json, css, ... which automatically formats your code for you when saving your file. It has some great defaults which is easy to get comfortable with, especially when you dont need to adhere to them your self.

`yarn add --dev prettier`

https://prettier.io/docs/en/editors.html
prettier-atom / prettier-vscode / JsPrettier (sublime)

You can of course modify the sules you want it to enforce, like remove semi colons, and force single quotes arout strings in this case.

.prettierrc

```
{
  "semi": false,
  "singleQuote": true
}
```

!! if ESLint integration is enabled prettier wont work without eslint

You can also use Prettier together with tools like eslint, automatically fixing most of the syntax based lint warnings.

## Eslint

Eslint is a pluggable JavaScript linter, which validates your code based on certain rules and guidelines regarding syntax, sematics and code ordering, to help you write cleaner and better code.

There is a lot of different rule libraries you can import as a starting point like air-bnb and standard.

```bash
yarn add --dev eslint babel-eslint eslint-plugin-babel eslint-plugin-react eslint-config-prettier eslint-plugin-prettier eslint-plugin-standard eslint-config-standard eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node eslint-plugin-promise
```

.eslintrc.json

```json
{
  "parser": "babel-eslint",
  "extends": [
    "standard",
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
    "prettier/standard"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
    "es6": true
  },
  "plugins": ["jsx-a11y", "react", "prettier", "standard"]
}
```

.eslintignore

```
/node_modules
/dist
```

package.json

```json
"scripts": {
  "lint": "eslint ."
}
```

Now with Eslint integration on prettier, Eslint and prettier with respect each other and work together, gicving you warning where they are due and just fixing your code when they are not.

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

If no mudule is found with that name under ./src babel will next look in node_modules.

## Allow EcmaScript features

Allowing for other modern standards needs to be specified for babel as well
We will be using class properties and deconstructors, so lets add support for them

`yarn add @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread @babel/plugin-proposal-optional-chaining`

.babelrc

```
{
  ...,
  "plugins": [
    ... ,
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-optional-chaining"
  ]
}
```

Now we can do elegant magic such as:

```
class MyComponent extends Component {
  state = { active: false }
  render() {
    const { prop1, prop2, data, ...restProps } = this.props

    // say whaaat?
    const userName = data?.user?.name
    return <Element name={userName} {...restProps} />
  }
}
```

## Jest and React testing library

Jest is a JavaScript testing library built for React which makes automated testing easy. It is also a great way of defining the purpose of your components before writing the component, making sure it does what is is supposed to. And alerts you when that functionality breaks.

We will use react-testing-library which is utility helper (like encyme) which makes rendering, simulating and quering objects in dom easier

Jest will automaticall find any files ending with spec.js or test.js

```bash
yarn add --dev jest jest-dom babel-jest react-testing-library
```

jest.config.js

```js
module.exports = {
  testURL: "http://localhost",
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
  },
  testPathIgnorePatterns: ["/node_modules", "examples"]
};
```

package.json

```json
"scripts": {
  "test": "jest"
}
```

`__mocks__/styleMock.js`
`export default {}`

`__mocks__/fileMock.js`
`export default ''`

src/test.js

```js
import React from "react";
import { render, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";

afterEach(cleanup);
test("Test component shows content", () => {
  const { getByText } = render(<div>Hejhej</div>);
  expect(getByText(/^Hejhej/)).toBeInTheDocument();
});
```

`yarn test`

Writing automatic tests for you components is a great way of making sure you are not breaking any major functions. If used wrong it might instead give a false sense of security and a nuisence when continuing to developing the app.

Usually it is good to test any pure function/interaction that needs to always give the same result. If you have a search form you want to make sure it searches, and for many instances you might want to make sure incorrect use still wont break the function.

For many complex components or helpers, you might consider starting by specifying a set of test cases, correct and incorrect the result will need to handle, before you even start writing any code. Thus making sure it will be build on the agreed upon rules.

A good rule of thumb when deciding how to write your tests, is how would the user use the component. Instead of making sure elements with certain id or attributes exist, go by it's text and values and simulate the same kind of interaction a user might do. Thats where react-testing-library really shines, using methods like getByText() getByLabel and fireEvent().

When dealing with simple components you might be better of in having stongly types properties instead, telling anyone trying to use a component exacly what preperties it needs and in what format.

## Flow static types

Flow is a static type checker for JavaScript, created by Facebook. It allows you to be stricter which types are allowed and warns you if you try to call a react component with missing or wrongly typed pros, making the code easier to read, use and test.

```bash
yarn add --dev babel-cli flow-bin @babel/preset-flow eslint-plugin-flowtype
```

.babelrc

```
{
  "presets": [..., "@babel/preset-flow"]
}
```

```bash
yarn run flow init
yarn run flow
```

.flowconfig

```
[ignore]
.*/dist/.*
.*/node_modules/config-chain/test

[options]
module.name_mapper='^\(.*\)$' -> '<PROJECT_ROOT>/src/\1'
module.name_mapper.extension='svg' -> '<PROJECT_ROOT>/__mocks__/fileMock.js'
```

Also prevent eslint to warn about flow syntax.

.eslintrc.json

```
{
  "extends": [
    /* ... */
    "plugin:flowtype/recommended",
    "prettier/flowtype"
  ],
  "plugins": ["flowtype", /* ... */]
```

components/Test/index.js

```js
// @flow
import React, { Component } from "react";

type Props = {
  color: string,
  children: any
};
type State = {};
// export default function Test({ children, color = 'red' }: Props) {...}
export default class Test extends Component<Props, State> {
  render() {
    const { color = "red", children } = this.props;
    return (
      <div style={{ color }} className="Test">
        {children}
      </div>
    );
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

## Exercises

- create a test file src/Test/test.js where you import the component Test and renders it using https://github.com/kentcdodds/react-testing-library and write tests to make sure:

  - som specific content is being rendered inside the component
  - a inner element with data-test="counter" has initial value of 0 when no counter prop is not passed, and that it is 14 when counter="14"
  - every time Test is being clicked data-test="counter" has increased it value by 5

- implement the component src/components/Test/index.js and make sure all tests passes

- Declare the flow types in the component
