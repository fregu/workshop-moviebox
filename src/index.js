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
