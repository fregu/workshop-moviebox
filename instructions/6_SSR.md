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
  const graphqlUrlLocal = `http://${process.env.HOST}/graphql`

  // graphql uri for Client requests to server depending on
  const graphqlUrl = `${ctx.protocol}://${
    ctx.protocol === 'https' && process.env.SSL_HOST
      ? process.env.SSL_HOST
      : process.env.HOST
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
  const stateScript = `
    <script>
      window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
      window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
      window.graphqlUrl = '${graphqlUrl}'
    </script>
  `
  return `
    <!DOCTYPE html>
    <html ${helmetData.htmlAttributes.toString()}>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/style.css" />
        ${helmetData.title.toString()}
        ${helmetData.meta.toString()}
        ${helmetData.link.toString()}
        ${helmetData.style.toString()}
    </head>

    <body ${helmetData.bodyAttributes.toString()}>
      ${helmetData.noscript.toString()}
        <div id="root">${reactDom}</div>

        ${helmetData.script.toString()}
        ${stateScript /* must be inserted before main.js */}
        <script src="/main.js"></script>
    </body>
    </html>
  `
}
```

---

For production and SSR we want to have uor CSS files exported, but in development we still want webpack to handle them in style loader. So it is time to split up our config files in webpack.common.js, webpack.dev.js, webpack.prod.js and webpack.ssr.js

webpack.common.js, is a stripped version basically setting up our loaders. We export it as a function where we can call it with either 'development' or 'production' mode, resulting in style-loader or MiniCssExtractPlugin.loader.

`yarn add webpack-merge mini-css-extract-plugin`

```js
const path = require('path')

module.exports = mode => ({
  entry: {
    main: './src/index.js'
  },
  mode,
  output: {
    publicPath: '/assets',
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // working with node modules .mjs is a common type we also need to handle
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        use: [
          mode === 'development'
            ? 'style-loader'
            : require('mini-css-extract-plugin').loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('postcss-import')(),
                require('postcss-preset-env')()
              ]
            }
          }
        ]
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
          },
          'image-webpack-loader'
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
})
```

webpack.dev.js, is used with dev server and hot module reloading

```js
const merge = require('webpack-merge')
const common = require('./webpack.common.js')('development')
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html'
    })
  ]
})
```

webpack.prod.js, deines the filename we want for our css

```js
const merge = require('webpack-merge')
const common = require('./webpack.common.js')('production')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
})
```

We then create a new webpack config file with the purpose of transpiling the server/ssr.js file, since it in turn will import `<App />` and the rest of the application

`yarn add null-loader`

webpack.ssr.js

```js
const config = require('./webpack-config')
const path = require('path')

module.exports = {
  entry: './server/ssr.js',
  output: {
    library: 'ssr',
    libraryTarget: 'umd', // export as importable UMD-module
    path: path.resolve(__dirname, 'dist'),
    filename: 'ssr.js'
  },
  target: 'node',
  mode: 'production',

  // Use loaders from webpack-config, except css loader
  module: config.module.rules.map(
    rule => ('.css'.match(rule.test) ? { ...rule, use: 'null-loader' } : rule)
  )
}
```

Now if we run `webpack --config webpack.ssr.js` a new ssr.js bundle will be written to dist, which we then could import and use as a koa middleware
server/index.js

```js
import ssr from '../dist/ssr'
// ...
app.use(ssr)
```

But the problem with this is that we need to ensure that webpack.ssr.js always has run before we start the server. So instead, we can compile it in a in memory filesystem and add the result to koa as a middleware, when we start up the server. But to limit memory usage in production server, use dist version there.

First clean up the previous webpack compiler
`yarn remove koa-webpack-dev-middleware`

`yarn add koa-static memory-fs require-from-string`

server/index.js

```js
// ...
//- import webpackMiddleware from 'koa-webpack-dev-middleware'
import serve from 'koa-static'

// serve static files from dist with public path /
app.use(mount('/assets', serve(path.resolve(__dirname, '..', 'dist'))))

//- const compiler = webpack(webpackConfig)
//- app.use(webpackMiddleware(compiler))

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const MemoryFileSystem = require('memory-fs')
  const ssrConfig = require('../webpack.ssr.js')
  const requireFromString = require('require-from-string')

  const memoryFs = new MemoryFileSystem()
  const ServerCompiler = webpack(ssrConfig)

  // Define file system to be in memory for compiler instead
  ServerCompiler.outputFileSystem = memoryFs

  // Start the compiler and require the file from memory
  ServerCompiler.run((err, stats) => {
    if (err) {
      throw err
    }
    const contents = memoryFs.readFileSync(
      path.resolve(ssrConfig.output.path, ssrConfig.output.filename),
      'utf8'
    )

    const ssr = requireFromString(contents, ssrConfig.output.filename)

    // Use SSR from memory-fs
    app.use(ssr.default)
  })
} else {
  const ssr = require(path.resolve(
    ssrConfig.output.path,
    ssrConfig.output.filename
  ))

  // Use SSR from ../dist/ssr.js
  app.use(ssr.default)
}
// ...
```

Now we do all fetching and server side, we need to let the client know what th ecurrent state is.

We also need to replace ReactDOM.render with ReactDOM.hydrate, it is basically the same thing, but tells the client to attach eventlisteners to already rendered DOM.

src/index.js

```js
import { InMemoryCache } from 'apollo-cache-inmemory'

const store = createStore(window.__REDUX_STATE__ || {})

const client = new ApolloClient({
  uri: window.graphqlUrl || 'http://localhost:5500/graphql',
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__ || {})
})

// clean up globals
delete window.__REDUX_STATE__
delete window.__APOLLO_STATE__
delete window.graphqlUrl

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
  "devserver": "webpack-dev-server --config webpack.dev.js --hot --history-api-fallback --open",
  "start": "npm-run-all --parallel watch:server watch:build devserver",
  "build": "webpack --config webpack.prod.js",
  "build:ssr": "webpack --config webpack.ssr.js",
  "server": "babel-node server",
  "start:server": "yarn build && yarn server",
  "watch:server": "nodemon --exec babel-node server --ignore dist --no-info",
  "watch:build": "yarn build --watch --ignore dist"
}
```

`yarn start` will now start graphQL/SSR server, build assets and start webpack dev derver, and keep watching for file changes.
Good for working with entire stack.

`yarn dev` will just start up the server and rely on webpack-dev-server update. Good for working with components and application.

http://localhost:8080 // Dev server with HMR
http://localhost:5500 // HTTP/1.1 SSR server width graphQL endpoint
https://localhost:5501 // HTTP/2 SSL SSR server with graphQL endpoint

http://localhost:5500/graphql, https://localhost:5501/graphql // endpoint and graphiql playground for graphQL queries
