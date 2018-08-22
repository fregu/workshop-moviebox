## Server Side Rendering

Now we have a server and optimized API using graphQL it's time to take our app to the next level using server side rendering.

The server needs to be able to render the entire App, perform initial API calls, and initialize a apollo client and a redux store.

`yarn add react-helmet babel-register ignore-styles babel-plugin-import-graphql fs apollo-link-http apollo-client apollo-cache-inmemory`

server/ssr.js

```js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import Helmet from 'react-helmet'
import htmlTemplate from './htmlTemplate'

import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'

import createStore from 'store'
import App from 'App'

dotenv.config()

export default async (ctx, next) => {
  // non SSL uri for SSR requests, server cant accept certificates
  const graphqlUrlLocal = `http://${process.env.HOST}:${
    process.env.PORT
  }/graphql`

  // graphql uri for Client requests to server depending on
  const graphqlUrl = `${ctx.protocol}://${process.env.HOST}:${
    ctx.protocol === 'https' ? process.env.SSL_PORT : process.env.PORT
  }/graphql`

  // A context for StaticRouter to define paths and rules
  const context = {}

  // Initialize a new Redux state
  const store = createStore({ counter: 14 })

  // Create a SSR apollo client
  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: graphqlUrlLocal,
      fetch,
      credentials: 'same-origin',
      headers: {
        cookie: ctx.header.cookie
      }
    }),

    cache: new InMemoryCache(),
    ssrMode: true
  })

  // define the static Root object
  const Root = (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={ctx.originalUrl} context={context}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </Provider>
  )

  // Makes Apollo magic and prefetches relevant data
  await renderToStringWithData(Root)

  const reactDom = renderToString(Root)
  const reduxState = store.getState()
  const apolloState = apolloClient.extract()
  const helmetData = Helmet.renderStatic()

  ctx.type = 'text/html; charset=utf-8'
  ctx.status = 200

  // call template to render the HTML document
  ctx.body = htmlTemplate({
    reactDom,
    reduxState,
    apolloState,
    helmetData,
    graphqlUrl
  })
}
```

In the template we are using Helmet to render meta, styles, links, scripts, title etc. which can be defined within our views and components. Anything defined within `<Helmet></Helmet>` tags can be inserted in root document.

```js
import Helmet from 'react-helmet'
// ...
  <Helmet>
    <title>This is a special page</title>
    <meta name="description" value="A long description of current view" />
    <script src="special dependecy for just this view/component" />
  </Helmet>
```

htmlTemplate.js

```js
export default function htmlTemplate({
  reactDom = '<div />',
  reduxState,
  apolloState,
  helmetData,
  graphqlUrl
}) {
  return `
    <!DOCTYPE html>
    <html ${helmetData.htmlAttributes.toString()}>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/public/style.css" />
        ${helmetData.title.toString()}
        ${helmetData.meta.toString()}
        ${helmetData.link.toString()}
        ${helmetData.style.toString()}
    </head>

    <body ${helmetData.bodyAttributes.toString()}>
      ${helmetData.noscript.toString()}
        <div id="root">${reactDom}</div>

        ${helmetData.script.toString()}
        <script src="/public/main.js"></script>
    </body>
    </html>
  `
}
```

We then crete a new webpack config file with the purpose of transpiling the ssr.js file, since it in turn import `<App />`

webpack.ssr.js

```js
const path = require('path')

module.exports = {
  entry: './server/ssr.js',
  output: {
    library: 'ssr',
    libraryTarget: 'umd',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'ssr.js'
  },
  target: 'node',
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.gql', '.svg']
  },
  module: {
    rules: [
      // .mjs is a new standard for ES modules, which are pretty commin in dependencies
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // In this case we want to ignore CSS altogether, instead relying on pre build dist/style.css
      {
        test: /\.css$/,
        use: 'null-loader'
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      },
      {
        test: /\.(woff|woff2|(o|t)tf|eot)$/i,
        loader: 'file-loader',
        query: {
          name: 'fonts/[name].[hash].[ext]'
        }
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        exclude: /icons/,
        use: [
          {
            loader: 'file-loader',
            query: {
              name: 'img/[name].[hash].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve('svg-inline-loader'),
            options: {
              removeTags: true,
              removeSVGTagAttrs: true,
              idPrefix: 'icon'
            }
          }
        ]
      }
    ]
  }
}
```

We also need to update uor defaul webpack config to extract CSS to a file (dist/style.css)
`yarn add mini-css-extract-plugin`

webpack.config.js

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// ...
module.exports = {
  mode: 'production',
  output: {
    publicPath: '/'
  },

  // add source maps to our bundles making debugging much easier
  devtool: 'source-map',
  module: {
    rules: [
      // ...
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // replace 'style-loader',
          {
            loader: 'css-loader'
            // ...
          },
          {
            loader: 'postcss-loader'
            // ...
          }
        ]
      }
      // ...
    ]
  },
  plugins: [
    // ...
    // And define the plugin with output options
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
}
```

Add our new bundle as a middleware, and remove all webpack associations from server/index.js

`yarn add koa-static`
`yarn remove koa-webpack-dev-middleware`

server/index.js

```js
import serve from 'koa-static'
import ssr from '../dist/ssr'

// ...
app.use(mount('/public', serve(path.resolve(__dirname, '..', 'dist'))))

app.use(ssr)
```

Now we do all fetching and server side, we nned to let the client know what th ecurrent state is.

We also need to replace ReactDOM.render with ReactDOM.hydrate, it is basically the same thing, but tells the client to attach eventlisteners to already rendered DOM.

src/index.js

```js
import { InMemoryCache } from 'apollo-cache-inmemory'

const store = createStore(window.__REDUX_STATE__ || {})

const client = new ApolloClient({
  uri: window.graphqlUrl || 'http://localhost:5500/graphql',
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
})

delete window.__REDUX_STATE__ // eslint-disable-line
delete window.__APOLLO_STATE__ // eslint-disable-line
delete window.graphqlUrl // eslint-disable-line

const Root = () => (
  // ...
)

ReactDOM.hydrate(<Root />, document.getElementById('root'))
```

And finally we updates the scripts in package.json to be able to call our different build processes.

Note that we still can run dev server with hot reloading by first firing up the graphql server.

`yarn add --dev npm-run-all`

package.json

```json
"scripts": {
  "test": "jest",
  "lint": "eslint src",
  "flow": "flow",
  "dev": "npm-run-all --parallel server devserver",
  "devserver": "webpack-dev-server --history-api-fallback --open",
  "start": "npm-run-all --parallel watch:server watch:build devserver",
  "build": "webpack --config webpack.config.js --config webpack.ssr.js",
  "server": "babel-node server",
  "start:server": "yarn build && yarn server",
  "watch:server": "nodemon --exec babel-node server --ignore src",
  "watch:build": "yarn build --watch",
  "build:prod": "webpack --config webpack.config.js",
  "build:ssr": "webpack --config webpack.ssr.js"
}
```

`yarn start` will now start graphQL/SSR server, build assets and start webpack dev derver, and keep watching for file changes.

http://localhost:8080 // Dev server with HMR
http://localhost:5500 // HTTP/1.1 SSR server width graphQL endpoint
https://localhost:5501 // HTTP/2 SSL SSR server with graphQL endpoint

http://localhost:5500/graphql, https://localhost:5501/graphql // endpoint and graphiql playground for graphQL queries
