import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from 'views/Home'
import Movie from 'views/Movie'

const App = () => (
  <Switch>
    <Route exact path="/movies/:id" component={Movie} />
    <Route component={Home} />
  </Switch>
)
export default App
