import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache } from 'apollo-cache-inmemory'

import createStore from 'store'

import App from './App'

const store = createStore(
  (typeof window !== 'undefined' && window.__REDUX_STATE__) || {}
)

const client = new ApolloClient({
  uri: window.graphqlUrl || 'http://localhost:5500/graphql',
  cache: new InMemoryCache().restore(
    (typeof window !== 'undefined' && window.__APOLLO_STATE__) || {}
  )
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

ReactDOM.render(<Root />, document.getElementById('root'))
