import 'ignore-styles'

require('babel-register')({
  ignore: [/(node_modules)/, /.css$/]
})

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import expressGraphQL from 'express-graphql'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'

import { StaticRouter, matchPath } from 'react-router'

import fetch from 'node-fetch'
import Helmet from 'react-helmet'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'

import schema from './schema/schema' // our schema file
import createStore from 'store'
import App from 'App'

dotenv.config()

function serverRender(req, res, next) {}
const app = express()

app.use('/static', express.static('dist'))
app.use('/favicon.ico', (req, res, next) => {})

app.use(cors())
app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
)

app.use('/*', (req, res) => {
  const context = {}
  const store = createStore({ counter: 14 })
  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: 'http://localhost:5500/graphql',
      fetch,
      credentials: 'same-origin',
      headers: {
        cookie: req.header('Cookie')
      }
    }),
    cache: new InMemoryCache(),
    ssrMode: true
  })

  const Root = (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={req.originalUrl} context={{}}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </Provider>
  )
  renderToStringWithData(Root).then(content => {
    const reactDom = renderToString(Root)
    const reduxState = store.getState()
    const apolloState = apolloClient.extract()
    const helmetData = Helmet.renderStatic()

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(htmlTemplate({ reactDom, reduxState, apolloState, helmetData }))
  })
})

const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

function htmlTemplate({
  reactDom = '<div />',
  reduxState,
  apolloState,
  helmetData
}) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <link rel="stylesheet" href="/static/style.css" />
            ${helmetData.title.toString()}
            ${helmetData.meta.toString()}
        </head>

        <body>
            <div id="app">${reactDom}</div>
            <script>
                window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
                window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
            </script>
            <script src="/static/main.js"></script>
        </body>
        </html>
    `
}
