import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import reducers from './reducers'
import middlewares from './middlewares'

const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export default (initialState = { counter: 0 }) => {
  return createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}
