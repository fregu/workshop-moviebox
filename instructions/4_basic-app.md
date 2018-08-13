## React Router

package.json
`"start": "webpack-dev-server --mode development --open --history-api-fallback",`

webpack.config.js

```js
output: {
  publicPath: '/'
}
```

`yarn add react-router-dom`

```js
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'

import MovieView from 'views/MovieView'
import MovieView from 'views/MovieView'

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/movies/:id" component={MovieView} />
        <Route component={MovieView} />
      </Switch>
    </BrowserRouter>
  </Provider>
)
```

## Views

src/views/HomeView/index.js

```js
import React, { Component } from 'react'

export default class HomeView extends Component {
  render() {
    return <div className="HomeView">Nice to be home</div>
  }
}
```

src/views/MovieView/index.js

```js
import React, { Component } from 'react'

export default class MovieView extends Component {
  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props
    return <div className="MovieView">Today we are watching {id}</div>
  }
}
```

## Exercises

- Create a connected React component src/containers/SearchMovie/index.js with a
  input field dispatching { type: 'SEARCH_MOVIE', query: <queryString>}

- Create the reducer searchResults which listens for the action 'SET_SEARCH_RESULT' and updates the state

- Create the connected React component src/containers/SearchResults/index.js which displays the search results from redux linking each result to "/movie/<movieID>" using Link from react-router-dom.

- Create the container connected component Movie shows the information about the movie selected under the view MovieView

- Design your own movie/TV browsing experience on paper with the possibility to browse by category, search and open a certain movie/TV-show to see details such as actors, images, trailers etc.
