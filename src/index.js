import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import createStore from 'store'

import App from './App'

const store = createStore()

const client = new ApolloClient({
  uri: '//localhost:5500/graphql'
})

const Root = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)

ReactDOM.hydrate(<Root />, document.getElementById('app'))
