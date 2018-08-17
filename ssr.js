import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'

import { StaticRouter } from 'react-router'

import fetch from 'node-fetch'
import Helmet from 'react-helmet'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'

import createStore from 'store'
import App from 'App'

export default (req, res) => {
  const graphqlUrl = `${req.protocol}://${req.get('Host')}/graphql`
  const context = { graphqlUrl }
  const store = createStore({ counter: 14 })
  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: graphqlUrl,
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
        <StaticRouter location={req.originalUrl} context={context}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </Provider>
  )

  // Makes Apollo magic and prefetches relevant data
  renderToStringWithData(Root).then(content => {
    const reactDom = renderToString(Root)
    const reduxState = store.getState()
    const apolloState = apolloClient.extract()
    const helmetData = Helmet.renderStatic()

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(
      htmlTemplate({
        reactDom,
        reduxState,
        apolloState,
        helmetData,
        graphqlUrl
      })
    )
  })
}

function htmlTemplate({
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
            <link rel="stylesheet" href="/static/style.css" />
            ${helmetData.title.toString()}
            ${helmetData.meta.toString()}
            ${helmetData.link.toString()}
            ${helmetData.style.toString()}
        </head>

        <body ${helmetData.bodyAttributes.toString()}>
          ${helmetData.noscript.toString()}
            <div id="root">${reactDom}</div>

            ${helmetData.script.toString()}
            <script src="/static/main.js"></script>
        </body>
        </html>
    `
}
