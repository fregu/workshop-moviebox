import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Provider } from 'react-redux'

import { StaticRouter, Route } from 'react-router'
import fetch from 'node-fetch'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

import { ApolloProvider } from 'react-apollo'
import schema from '../schema/schema'
import createStore from 'store'

import App from './App'
//const App = () => <div>Hejhje</div>

export default function reactHandler(req, res, next) {
  const url = req.originalUrl

  console.log('req', url)
  const store = createStore()
  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: '/graphql',
      uri: 'http://localhost:3010',
      credentials: 'same-origin',
      headers: {
        cookie: req.header('Cookie')
      }
    }),
    cache: new InMemoryCache(),
    ssrMode: true
  })

  const Root = () => (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <StaticRouter location={url} context={{}}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    </Provider>
  )

  const Html = ({
    lang = 'en',
    scripts = [],
    metas = [],
    window = {},
    stylesheets = [],
    children
  }) => (
    <html lang={lang}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        {metas.map((meta, id) => (
          <meta key={id} {...meta} />
        ))}
        {stylesheets.map(stylesheet => (
          <link key={stylesheet} rel="stylesheet" href={stylesheet} />
        ))}
      </head>
      <body>
        <div id="app">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: Object.keys(window).reduce(
              (out, key) =>
                (out += `window.${key}=${JSON.stringify(window[key])};`),
              ''
            )
          }}
        />
        {scripts.map(src => (
          <script key={src} src={src} />
        ))}
      </body>
    </html>
  )

  // Prefix the doctype, so the browser knows to expect HTML5
  res.write('<!DOCTYPE html>')
  const stream = ReactDOMServer.renderToNodeStream(
    <Html
      stylesheets={['/static/style.css']}
      scripts={['/static/main.js']}
      window={{
        __STATE__: store.getState(),
        __APOLLO_STATE__: apolloClient.extract()
      }}
    >
      <Root />
    </Html>
  )

  stream.pipe(
    res,
    { end: false }
  )
  stream.on('end', () => {
    res.end()
  })
}
