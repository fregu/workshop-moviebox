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
import middlewares from './middlewares'
...
composeEnhancers(applyMiddleware(...middlewares))
```

## API

`yarn add --dev babel-plugin-transform-object-rest-spread`
.babelrc
`"plugins": ["transform-object-rest-spread", ...]`

src/store/middlewares/tmdb.js

```js
import TMDB from 'helpers/tmdb-fetch'
const API_KEY = '72e8013728917209a38a06e945fb6a2f'
const api = new TMDB(API_KEY)

export const tmdb = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case 'GET_MOVIE':
      dispatch({ type: 'LOADING_MOVIE' })
      api
        .get(`/movie/${action.id}`, { language: 'sv_SE' })
        .then(data => dispatch({ type: 'SET_MOVIE', data }))

    case 'SEARCH_MOVIE':
      api
        .get(`/search/movie`, {
          language: 'sv_SE',
          include_adult: false,
          query: action.query
        })
        .then(data => dispatch({ type: 'SET_SEARCH_RESULT', data }))
  }
  next(action)
}
```

Try in devtools debugger
`{ type: 'SEARCH_MOVIE', query: 'underbart liv' }`

## Exercises

- Modify SEARCH_MOVIE results with full url poster_path (https://image.tmdb.org/t/p/w500/<path>)

- Add case for GET_POPULAR_MOVIES

- Create reducers for search results, selected movie and popular movies.

- Add new action to select a specific movie from search results or popular
