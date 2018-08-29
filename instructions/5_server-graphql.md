# HTTP/2 Server and GraphQl

## Koa JS

```bash
yarn add koa koa2-history-api-fallback koa-webpack-dev-middleware nodemon babel-cli
```

server/index.js

```js
import Koa from 'koa'
import historyFallback from 'koa2-history-api-fallback'
import webpackMiddleware from 'koa-webpack-dev-middleware'
import webpack from 'webpack'
import webpackConfig from '../webpack.config.js'

const app = new Koa()
const compiler = webpack(webpackConfig)

app.use(historyFallback())
app.use(webpackMiddleware(compiler))

app.listen(5500, () => {
  console.log('Listening on http://localhost:5500')
})
```

package.json

```json
"scripts":{
  ...
  "serve": "nodemon --exec babel-node server --ignore src"
  ...
}
```

`yarn serve`

## HTTP/2 and SSL

HTTP/2 is the "new" standard for web content with major improvements over HTTP/1.1, being faster and more secure. One of the major benefits is the possibility to push content in paralell to the client, instead of waithing for the client to request them.

To enable HTTP2 we need a certificate since HTTP/2 only works over SSL. We can create a self signing certificate for development purposes using these commands.

I wont even try to explain what is going on here, but it does the job :)

```bash
mkdir cert

openssl genrsa -des3 -passout pass:x -out cert/server.pass.key 2048

openssl rsa -passin pass:x -in cert/server.pass.key -out cert/server.key

rm cert/server.pass.key

openssl req -new -key cert/server.key -out cert/server.csr

openssl x509 -req -sha256 -days 365 -in cert/server.csr -signkey cert/server.key -out cert/server.crt
```

`yarn add http2 path fs`

server/index.js

```js
// ...
import http2 from 'http2'
import path from 'path'
import fs from 'fs'
// ...

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'cert', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'cert', 'server.crt'))
}
const server = http2.createSecureServer(options, app.callback())

server.listen(5501, () => {
  console.log('Listening over HTTP/2 on https://localhost:5501')
})

app.listen(5500, () => {
  console.log('Servering over HTTP/1.1 on http://localhost:5500')
})
// ...
```

Open https://localhost:5501 in browser and acept the certificate, (Advanced > Add Exception). To verify that we are actually serving our app over HTTP/2, open devTools > Network > Protocol (Right click on header if you don't see it) to make sure "localhost" it loads using H2 (HTTP/2)

## GraphQL

https://dev.to/aurelkurtula/creating-a-movie-website-with-graphql-and-react-25d4

What is graphQL

`yarn add node-fetch graphql koa-graphql koa-mount dotenv`

.env

```
NODE_ENV=development
HOST=localhost:5500
SSL_HOST=localhost:5501
PORT=5500
SSL_PORT=5501
TMDB_API_KEY=<your_tmdb_api_key>
```

We do not want to sharew our environmental variables

.gitignore

```
.env
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

The movie API results we get from TMDB looks something like this for a movie search, using qraphQl we can now redesign the format we want for each type in our new schema.

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
const Result = new GraphQLObjectType({
  name: 'Result',
  fields: {
    id: { type: GraphQLString },
    poster_path: {
      type: GraphQLString,
      resolve: ({ poster_path }) =>
        poster_path && `https://image.tmdb.org/t/p/w500${poster_path}`
    },
    title: { type: GraphQLString }
  }
})
```

```js
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    newMovies: {
      type: new GraphQLList(Result),
      resolve: () =>
        api.get(`/movie/now_playing`).then(data => data.results || [])
    }
  }
})

// ...

export default new GraphQLSchema({
  query: RootQuery
})
```

server/index.js

```js
import mount from 'koa-mount'
import GraphQL from 'koa-graphql'
import schema from '../schema/schema' // our schema file

// ...

app.use(
  mount(
    '/graphql',
    GraphQL({
      schema,
      graphiql: true
    })
  )
)
```

https://localhost:5501/qraphql

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
    id: { type: GraphQLString },
    overview: { type: GraphQLString },
    title: { type: GraphQLString },
    poster_path: {
      type: GraphQLString,
      resolve: ({ poster_path: posterPath }) =>
        posterPath && `https://image.tmdb.org/t/p/w500${poster_path}`
    },
    genres: {
      type: GraphQLString,
      resolve: ({ genres = [] }) => genres.map(({ name }) => name).join(', ')
    },
    release_date: { type: GraphQLString },
    vote_average: { type: GraphQLString },
    production_companies: {
      type: GraphQLString,
      resolve: ({ production_companies: productionCompanies = [] }) =>
        productionCompanies.map(({ name }) => name).join(', ')
    },
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
      resolve: (parentValue, args) => api.get(`/movie/${args.id}`)
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
    url: {
      type: GraphQLString,
      resolve: ({ key }) => key && `https://www.youtube.com/embed/${key}`
    }
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
      resolve: ({ id }) =>
        api.get(`/movie/${id}/videos`).then(data => data.results || [])
    }
  }
})
```

http://localhost:5500/graphql

```gql
{
  movieInfo(id: "284054") {
    title
    overview
    poster_path
    genres
    release_date
    production_companies
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
    profile_path: {
      type: GraphQLString,
      resolve: ({ profile_path: profilePath }) =>
        profilePath && `https://image.tmdb.org/t/p/w200${profilePath}`
    },
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
    reviews: {
      type: new GraphQLList(MovieReviewsType),
      args: { id: { type: GraphQLString } },
      resolve: ({ id }, args) =>
        api.get(`/movie/${id}/reviews`).then(data => data.results)
    },
    credits: {
      type: new GraphQLList(MovieCreditsType),
      args: { id: { type: GraphQLString } },
      resolve: ({ id }, args) =>
        api.get(`/movie/${id}/credits`).then(data => data.cast || [])
    }
  }
})
```

### Breaking out custom types

```js
const Image = new GraphQLObjectType({
  name: 'Image',
  description: 'Image resolver returning a small and a large URL',
  fields: {
    small: {
      type: GraphQLString,
      resolve: imagePath =>
        imagePath && `https://image.tmdb.org/t/p/w300${imagePath}`
    },
    large: {
      type: GraphQLString,
      resolve: imagePath =>
        imagePath && `https://image.tmdb.org/t/p/w500${imagePath}`
    }
  }
})


// ... update on all instances for images
backdrop_path: { type: Image },
poster_path: { type: Image },
profile_path: { type: Image },
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

const Root = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)
```

`yarn add graphql-tag`

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

.flowconfig

```
[options]
esproposal.decorators=ignore

module.name_mapper='^\(.*\)$' -> '<PROJECT_ROOT>/src/\1'

module.name_mapper.extension='gql' -> '<PROJECT_ROOT>/__mocks__/fileMock.js'
module.name_mapper.extension='svg' -> '<PROJECT_ROOT>/__mocks__/fileMock.js'
```

src/queries/newMovies.gql

```gql
query {
  newMovies {
    id
    title
    poster_path {
      small
    }
  }
}
```

src/containers/newMovies/index.js

```jsx
// @flow
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import newMovies from 'queries/newMovies.gql'
import Carousel from 'components/Carousel'
import MovieCard from 'components/MovieCard'

type MovieResult = {
  id: string,
  title: string,
  poster_path: {
    small: string,
    large: string
  }
}
type Props = {
  data?: {
    newMovies: Array<MovieResult>
  }
}

class NewMovies extends Component<Props> {
  render() {
    const {
      data: { newMovies = [] }
    } = this.props

    return (
      <Carousel>
        {newMovies.map(movie => (
          <MovieCard
            type="movie"
            key={movie.id}
            {...movie}
            image={movie.poster_path.small}
          />
        ))}
      </Carousel>
    )
  }
}
export default graphql(newMovies)(NewMovies)
```

### Enable CORS

`yarn add @koa/cors`

server/index.js

```js
import cors from '@koa/cors'

app.use(cors())
```

## A word on mutations

An other bog part of any API is the possibility to posta nd modify the data in the database. In graphql this is done using Mutations.

In our examples we will not be using any mutations, but for the fun of it, lets define one hypothetically.

(This mutation will however not work since we haven't bothered in requesting session ids from tmdb.)

schema/schema.js (in theory)

```js
const RootQuery = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'These are the things we can change',
  fields: () => ({
    rateMovie: {
      type: MovieInfoType,
      description:
        'Rate the movie between 0 and 10',
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        value: {type: GraphQLFloat }
      },
      resolve: (value, { id, value }) => {
        return api.post(`/movie/${id}/rating`, {value})
      }
    }
  })
})

export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
})
```

Example usage of graphQL mutation in react component

```js
import React, { Component } from 'react'
import { compose, graphql } from 'react-apollo'

class Test extends Component {
  vote = value => {
    const {
      rateMovie, // a named query, mutation gets set as named prop
      data: {
        getSingle: { id },
        refetch // Every query also has a method to refetch()
      }
    } = this.props
    rateMovie({ variables: { id, value } }).then(refetch)
  }
  render() {
    // ...
  }
}
// when using multiple queries, mutations you can compose them
export default compose(
  graphql(getSingle),
  graphql(RateMovieMutation, {
    name: 'rateMovie'
  })
)(Test)
```

## Exercises

- Extend the graphQL API including the searchMovie endpoint we earlier used via REST

- Experiment using http://localhost:5500/graphql and create .gql files for searchMovie and movieInfo

- Update react containers from using Redux middlewares and REST to use graphQL instead

- Document the schema using the description key on each type
