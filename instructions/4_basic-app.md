## React Router

The first step we need to start making a basic application is a way to distinguish between views. We accomplish this by using a router, to assign different URLs with different views.

First we need to add history-api-fallback parameter to webpack-dev-server to let redirect any URL to src/index.js

package.json
`"start": "webpack-dev-server --mode development --open --history-api-fallback",`

In webpack we define a root path, allowing us to import assets from a root

webpack.config.js

```js
module.expoerts = {
  output: {
    publicPath: '/'
  }
  // ...
}
```

`yarn add react-router-dom`

src/App.js

```js
import React from 'react'
import { Switch, Route } from 'react-router-dom'

import HomeView from 'views/HomeView'
import MovieView from 'views/MovieView'

const App = () => (
  <Switch>
    <Route exact path="/movies/:id" component={MovieView} />
    <Route component={HomeView} />
  </Switch>
)
export default App
```

src/index.js

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Link } from 'react-router-dom'
import App from './App'

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'))
```

## Views

src/views/HomeView/index.js

```js
// @flow
import React, { Component } from 'react'

type Props = {}
export default class HomeView extends Component<Props> {
  render() {
    return <div className="HomeView">Nice to be home</div>
  }
}
```

src/views/MovieView/index.js

```js
// @flow
import React, { Component } from 'react'
import { getMovie } from 'store/actions'
import { connect } from 'react-redux'

type Props = {
  match: any,
  movie: any | false,
  getMovie: Function
}
@connect(
  ({ activeMovie }) => ({ movie: activeMovie }),
  dispatch => ({ getMovie: id => dispatch(getMovie(id)) })
)
export default class MovieView extends Component<Props> {
  componentDidMount = () => {
    const {
      movie,
      match: {
        params: { id }
      },
      getMovie
    } = this.props
    if (!movie || movie.id !== id) {
      getMovie(id)
    }
  }
  render() {
    const { movie } = this.props
    return <div className="MovieView">{!movie ? 'Laddar' : movie.title}</div>
  }
}
```

## Exercises

- Create a connected React component src/containers/SearchMovie/index.js with a
  input field dispatching `{ type: 'SEARCH_MOVIE', query}` (using action creator ofcourse)

- Create the connected React component src/containers/SearchResults/index.js which displays the search results from redux linking each result using

```js
  import { Link } from 'react-router-dom'

  <Link to={`/movie/${id}`}>{title}</Link>
```

- Create the container connected component `<Movie />` that shows the information about the active movie under the view `<MovieView />`, such as title, production year, genre etc.

- Create the connected component `<PopularMovies />` which presents a list with all popular movies, which also is linkable

- Design your own basic movie/TV browsing experience on paper with the possibility to browse by category, search and open a certain movie/TV-show to see details such as actors, images, trailers etc.
