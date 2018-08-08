## Redux

```
yarn add redux react-redux
```

### Setup store

src/store/index.js

```js
import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import reducers from './reducers'

const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export default (initialState = { counter: 0 }) => {
  return createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(/**/))
  )
}
```

src/store/reducers/index.js

```js
import { combineReducers } from 'redux'

const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

export default combineReducers({ counter })
```

src/index.js

```js
import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import Test from 'components/Test'
import createStore from 'store'

const store = createStore()

const App = () => (
  <Provider store={store}>
    <Test color="blue">Hello Redux!</Test>
  </Provider>
)

ReactDOM.render(<App />, document.getElementById('app'))
```

src/components/Test/index.js

```js
// @flow

import React from 'react'
import { connect } from 'react-redux'
import './index.css'

type Props = {
  color?: string,
  children: any,
  counter: number,
  dispatch: Function
}
export const Test = ({
  children,
  color = 'red',
  counter = 0,
  dispatch
}: Props) => (
  <div
    className="Test"
    data-color={color}
    onClick={() => dispatch({ type: 'INCREMENT' })}
  >
    {children} ({counter})
  </div>
)

export default connect(({ counter }) => ({ counter }))(Test)
```

## ActionTypes

src/store/actions/index.js

```js
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'
```

## ActionCreators

src/store/actions/index.js

```js
export const incrementCounter = (step = 1) => {
  return { type: INCREMENT, step }
}
export const decrementCounter = (step = 1) => {
  return { type: DECREMENT, step }
}
```

components/Test/index.js

```js
export default connect(
  // mapStateToProps, mapDispatchToProps
  ({ counter }) => ({ counter }),
  dispatch => ({
    incrementCounter: step => dispatch(incrementCounter(step))
  })
)(Test)
```

## Middlewares

src/store/middlewares/index.js

```js
export const logger = ({ dispatch, getState }) => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', getState())
  return result
}

export default [logger]
```

src/store/index.js

```js
import thunk from 'redux-thunk' // Handle async actions and promises
import middlewares from './middlewares'
...
composeEnhancers(applyMiddleware(...middlewares, thunk))
```
