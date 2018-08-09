import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import Home from 'views/Home'
import Movie from 'views/Movie'

import createStore from 'store'

const store = createStore()

const client = new ApolloClient({
  uri: '//localhost:5500/graphql'
})

const App = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/movies/:id" component={Movie} />
          <Route component={Home} />
        </Switch>
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)

ReactDOM.render(<App />, document.getElementById('app'))
