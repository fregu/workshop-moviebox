## Editor setup

Set up development environment using syntax checker, flow types and basic unit types

## Prettier

```
yarn add prettier --dev
```

https://prettier.io/docs/en/editors.html

.prettierrc

```
{
  "semi": false,
  "singleQuote": true
}
```

## Aliases and root

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

test.js

```js
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import Test from './index.js'

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
