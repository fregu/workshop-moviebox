## Redux

Redux is a predictable state container for JavaScript apps. Giving a single source of thruth which can be used throughout the application, with tools to modify the state though Actions, Modifiers and Middlewares.

Install browser extension "Redux DevTools", to follow along exacly whats happening inside your store

```bash
yarn add redux react-redux
```

### Setup store

src/store/index.js

```js
import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import * as reducers from './reducers'

// If redux devtools is installed, use its composeEnhancers
const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export default (initialState = { counter: 0 }) => {
  return createStore(
    combineReducers(reducers),
    initialState,
    composeEnhancers(applyMiddleware(/**/))
  )
}
```

## Reducers

Redux reducers are methods that listen for any action dispatched at the store, filtering out the once that are relevant and inserts/modifies/removes the data in the store.

The data in Redux is immutable, which means it can not (should not) be changed. This means that the data insted needs to be reassigned to a new set of data when changed.

A good way to accomplish this is using map, filter and reduce (on collections) which always return a new set of data. An other easi way is by using destructuring (...), which spreads the data in an array or object and sets it in a new collection.

For boolean, strings and numbers this is not a problem since they reassign the pointer reference.

```js
case 'ADD_SOMETHING':
  return [...state, action.data]
```

or

```js
case 'MODIFY_SOMETHING_INSIDE_AN_OBJECT':
  return {...state, ...{...state.something, foo: action.foo}}
```

src/store/reducers/counter.js

```js
export const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + (action.step || 1)
    case 'DECREMENT':
      return state - (action.step || 1)
    default:
      return state
  }
}
```

src/store/reducers/index.js

```js
export * from './counter'
```

src/index.js

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import Test from 'components/Test'
import createStore from 'store'

const store = createStore({ counter: 14 })

const Root = () => (
  <Provider store={store}>
    <Test color="blue">Hello Redux!</Test>
  </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'))
```

src/components/Test/index.js

```js
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import './index.css'

type Props = {
  color: string,
  children: any,
  counter: number,
  dispatch: any
}

class Test extends Component<Props> {
  onClick = () => {
    this.props.dispatch({ type: 'INCREMENT', step: 5 })
  }
  render() {
    const { children, color = 'red', counter = 0 } = this.props

    return (
      <div style={{ color }} className="Test" onClick={this.onClick}>
        {children}
        <span className="Test-counter" data-testid="counter">
          {counter}
        </span>
      </div>
    )
  }
}
export default connect(store => ({ counter: store.counter }))(Test)
```

### Testing connected components

To test a connected redux component, we need to create a new test store adding a new reduxprovider.

src/components/Test/test.js

```js
import React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'
import 'jest-dom/extend-expect'
import createStore from 'store'
import { Provider } from 'react-redux'
import Test from 'components/Test'

const testStore = createStore({ counter: 14 })

afterEach(cleanup)

test('Test component shows content', () => {
  const { getByText, getByTestId } = render(
    <Provider store={testStore}>
      <Test color="blue">Hejhej</Test>
    </Provider>
  )
  expect(getByText('Hejhej')).toBeInTheDocument()
  expect(getByTestId('counter').textContent).toBe('14')
  fireEvent(
    getByText('Hejhej'),
    new MouseEvent('click', {
      bubbles: true, // click events must bubble for React to see it
      cancelable: true
    })
  )
  expect(getByTestId('counter').textContent).toBe('19')
})
```

## ActionTypes

To keep control of all types of actions redux accepts, it is a good practice to define them in store/actions.

src/store/actions/counter.js

```js
export const INCREMENT = { type: 'INCREMENT' }
export const DECREMENT = { type: 'DECREMENT' }
```

## ActionCreators

And/Or we can define methods to trigger an action based on parameters istead. Theese are called action creators and need to be dispatched from the connected components.

src/store/actions/counter.js

```js
export const incrementCounter = (step = 1) => {
  return { ...INCREMENT, step }
}
export const decrementCounter = (step = 1) => {
  return { ...DECREMENT, step }
}
```

src/store/actions/index.js

```js
export * from './counter'
```

Even in reducers we import the action to clearly declare any dependencies

src/store/reducers/counter.js

```js
import { INCREMENT, DECREMENT } from 'store/actions'

export const counter = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT.type:
    //...
  }
}
```

It might feel overkill to import constants instead of just dispatchin strings, but when you application is getting larger, you will thank yourself in your declarity of exacly which action is used where.

You can also bind the action creators directly to the props of a connected component inside the connect method

components/Test/index.js

```js
import { incrementCounter } from 'store/actions'
// ...
export default connect(
  ({ counter }) => ({ counter }),
  dispatch => ({
    incrementCounter: step => dispatch(incrementCounter(step))
  })
)(Test)
```

## Middlewares

Besides reducers which modifies the state in Redux, we can attach middleware functions, that listenes to all actions passed to Redux, and can there intercept actions calls, and trigger new actions as a result.

middlewares are functions which takes store as parameter, and calls a function with a next method as parameter, which calls a method that takes an action as parameter. Which in turn calls the next method with action as paramter, to let the action continue down the line

```js
const middleware = store => next => action => {
  /* do stuff */
  next(action)
}
```

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

Add the middleware to redux

src/store/index.js

```js
import middlewares from './middlewares'
...
composeEnhancers(applyMiddleware(...middlewares))
```

## API

The API we are going to use in this project is the awesome TMDB (The Movie DataBase API), which is a complex REST API, to get any information from any movie or TV-show.

To connect to the API we need a API_KEY (register account and create one on https://www.themoviedb.org/)

To make it easier to work with the API, we eill be using a simple helper method, which sets the appropriate parameters and returns the methods get, post, put and delete, which handles the requests and returns a Promise resolving the api call.

`yarn add qs node-fetch`

[spoiler alert]
'node-fetch' will be used later when we move the api calls to the server side.

src/helpers/tmdb-fetch.js

```js
import qs from 'qs'
const fetch =
  typeof window === 'undefined' ? require('node-fetch') : window.fetch

export default function tmdb(apiKey) {
  const BASE_URL = 'https://api.themoviedb.org/3'
  const defaults = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const defaultQuery = {
    api_key: apiKey
  }

  function request({ url, path, query = {}, ...req }) {
    return fetch(
      url ||
        `${BASE_URL}${path}${path.indexOf('?') > -1 ? '&' : '?'}${qs.stringify({
          ...defaultQuery,
          ...query
        })}`,
      { ...defaults, ...req }
    )
      .then(response => response.json())
      .catch(error => console.error('Error:', error))
  }

  return {
    get(path, params) {
      return request({
        path,
        query: params,
        method: 'GET'
      })
    },
    post(path, params) {
      return request({
        path,
        body: JSON.stringify(params),
        method: 'POST'
      })
    },
    put(path, params) {
      return request({
        path,
        body: JSON.stringify(params),
        method: 'PUT'
      })
    },
    delete(path, params) {
      return request({
        path,
        method: 'DELETE'
      })
    }
  }
}
```

We can now implement our API-calls using redux middlewares
(https://developers.themoviedb.org/3)
src/store/middlewares/tmdb.js

```js
import TMDB from 'helpers/tmdb-fetch'
const API_KEY = 'GET_YOUR_OWN_DAMN_KEY'
const api = new TMDB(API_KEY)

export const tmdb = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case 'GET_MOVIE':
      api
        .get(`/movie/${action.id}`, { language: 'sv_SE' })
        .then(data => dispatch({ type: 'SET_MOVIE', data }))
      break
    case 'SEARCH':
      api
        .get(`/search/multi`, {
          language: 'sv_SE',
          include_adult: false,
          query: action.query
        })
        .then(data => dispatch({ type: 'SET_SEARCH_RESULT', data }))
      break
  }
  next(action)
}
```

And remeber to add the middleware to the list
src/store/middlewares/index.js
``

Try in devtools debugger
`{ type: 'SEARCH', query: 'underbart liv' }`

## Exercises

- Create a new reducer src/store/reducers/searchResults.js to insert the movies returned by SET_SEARCH_RESULT
- Modify the results with the full url poster_path `://image.tmdb.org/t/p/w500${poster_path}` before inserting them in redux
- Add new action and action creator for GET_MOVIE and action for SET_MOVIE, and update middleware to import the new actions
- Create reducer activeMovie in src/store/reducers/activeMovie.js to return false on 'GET_MOVIE', and movie object on 'SET_MOVIE'
- Add api call for GET_POPULAR_MOVIES resulting in the redux movies.popular in src/store/reducers/movies.js

Remember to export and import and actions, reducers and middlewares using (`import * from './filename'`)
