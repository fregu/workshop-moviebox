## Express JS

```bash
yarn add express webpack-dev-middleware nodemon babel-cli
```

server.js

```js
import express from 'express'
import webpackMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'
import webpackConfig from './webpack.config.js'

const app = express()

const compiler = webpack(webpackConfig)
app.use(webpackMiddleware(compiler))

app.listen(5500, () => {
  console.log('Listening on http://localhost:5500')
})
```

package.json

```json
"scripts":{
  ...
  "serve": "nodemon --exec babel-node server.js  --ignore src"
  ...
}
```

`yarn serve`

### Routing

`yarn add path`

server.js

```js
import path from 'path'
...
app.use(webpackMiddleware(compiler))
// Fallback when no previous route was matched
app.use('*', (req, res, next) => {
  const filename = path.resolve(compiler.outputPath, 'index.html')
  compiler.outputFileSystem.readFile(filename, (err, result) => {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})
```

## GraphQL

https://dev.to/aurelkurtula/creating-a-movie-website-with-graphql-and-react-25d4

What is graphQL

`yarn add node-fetch graphql express-graphql dotenv`

/src/helpers/tmdb-fetch.js

```js
const fetch =
  typeof window === 'undefined' ? require('node-fetch') : window.fetch
```

.env

```
TMDB_API_KEY=72e8013728917209a38a06e945fb6a2f
```

schema/schema.js

```js
import TMDB from 'helpers/tmdb-fetch'
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList
} from 'graphql'
import dotenv from 'dotenv'

dotenv.config()
const api = new TMDB(process.env.TMDB_API_KEY)
```

api results

```js
{
    results: [
            {
            vote_count: 3742,
            id: 284054,
            video: false,
            vote_average: 7.3,
            title: "\"Black Panther\","
            popularity: 246.001551,
            poster_path: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
            original_language: "en",
            original_title: "\"Black Panther\","
            genre_ids: [28, 12, 14, 878],
            backdrop_path: "/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
            adult: false,
            overview: "King T'Challa returns ....",
            release_date: "2018-02-13"
        }
    ]
}
```

NewMovies (schema/schema.js)

```js
const NewMoviesType = new GraphQLObjectType({
  name: 'NewMovies',
  fields: {
    id: { type: GraphQLInt },
    poster_path: { type: GraphQLString },
    title: '{type: GraphQLString},'
  }
})
```

```js
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    newMovies: {
      type: new GraphQLList(NewMoviesType),
      resolve() {
        return api.get(`/movie/now_playing`).then(data => {
          const movies = data.results
          movies.map(
            movie =>
              (movie.poster_path =
                'https://image.tmdb.org/t/p/w500' + movie.poster_path)
          )
          return movies
        })
      }
    }
  }
})

// ...

export default new GraphQLSchema({
  query: RootQuery
})
```

server.js

```js
import expressGraphQL from 'express-graphql'
import schema from './schema/schema' // our schema file

const app = express()

app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
)
```

http://localhost:5500/qraphql

```gql
{
  newMovies {
    id
    title
    poster_path
  }
}
```

MovieInfo

```js
const MovieInfoType = new GraphQLObjectType({
  name: 'MovieInfo',
  fields: {
    id: { type: GraphQLInit },
    overview: { type: GraphQLString },
    title: { type: GraphQLString },
    poster_path: { type: GraphQLString },
    genres: { type: GraphQLString },
    release_date: { type: GraphQLString },
    vote_average: { type: GraphQLString },
    production_companies: { type: GraphQLString },
    vote_average: { type: GraphQLString },
    runtime: { type: GraphQLString }
  }
})
```

```js
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // topMovies: {...},
    movieInfo: {
      type: MovieInfoType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api.get(`/movie/${args.id}`).then(movie => {
          movie.genres = movie.genres.map(g => g.name).join(', ')
          movie.production_companies = movie.production_companies
            .map(c => c.name)
            .join(', ')
          movie.runtime += ' min.'
          return movie
        })
      }
    }
  }
})
```

Movie Trailers

```js
const VideoType = new GraphQLObjectType({
  name: 'Video',
  fields: {
    id: { type: GraphQLString },
    key: { type: GraphQLString },
    url: { type: GraphQLString }
  }
})
```

```js
const MovieInfoType = new GraphQLObjectType({
  name: 'MovieInfo',
  fields: {
    id: { type: GraphQLString },
    //...
    videos: {
      type: new GraphQLList(VideoType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/3/movie/${parentValue.id}/videos`)
          .then(data => data.results.map(video => {...video, url: `https://www.youtube.com/embed/${video.key}`}))
      }
    }
  }
})
```

http://localhost:5500/graphql

```gql
{
  movieInfo(id: "284054") {
    title
    videos {
      id
      url
    }
  }
}
```

Credits and reviews

```js
const MovieCreditsType = new GraphQLObjectType({
  name: 'MovieCredits',
  fields: {
    id: { type: GraphQLString },
    character: { type: GraphQLString },
    name: { type: GraphQLString },
    profile_path: { type: GraphQLString },
    order: { type: GraphQLString }
  }
})
const MovieReviewsType = new GraphQLObjectType({
  name: 'MovieReviews',
  fields: {
    id: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString }
  }
})
```

```js
const MovieInfoType = new GraphQLObjectType({
  name: 'MovieInfo',
  fields: {
    id: { type: GraphQLString },
    //...
    //videos: { ... },
    movieReviews: {
      type: new GraphQLList(MovieReviewsType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/movie/${parentValue.id}/reviews`)
          .then(data => data.results)
      }
    },
    movieCredits: {
      type: new GraphQLList(MovieCreditsType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/movie/${parentValue.id}/credits`)
          .then(data => data.cast.filter(cast => cast.profile_path))
      }
    }
  }
})
```

### Hook it up to React

`yarn add react-apollo apollo-boost`

index.js

```js
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

// ...

const client = new ApolloClient({
  uri: 'http://localhost:5500/graphql'
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
```

`yarn add --dev babel-plugin-transform-decorators graphql-tag`

.babelrc

```
"plugins": [..., "transform-decorators-legacy"]
```

webpack.config.js

```js
module.exports = {
  module: {
    rules: [
      // ...,
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      }
    ]
  }
}
```

src/queries/newMovies.gql

```gql
query {
  newMovies {
    id
    title
    poster_path
  }
}
```

```jsx
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import newMovies from 'queries/newMovies.gql'

@graphql(newMovies, {
  //passing parameters based on props
  options: ({ genre }) => ({
    variables: { genre }
  })
})
class NewMovies extends Component {
  render() {
    const {
      data: { newMovies = [] }
    } = this.props
    return (
      <div>
        {newMovies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
            <img src={movie.poster_path} />
          </div>
        ))}
      </div>
    )
  }
}
```

Enable CORS

server.js

```js
import cors from 'cors'

app.use(cors())
```

## Exercises

- Extend the graphQL API including the searchMovie endpoint we earlier used via REST

- Experiment using http://localhost:5500/graphql and create .gql files for searchMovie and movieInfo

- Update react containers from using Redux middlewares and REST to use graphQL decorators

- Add description to each endpoint
