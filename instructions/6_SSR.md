## Server Side Rendering

Breaking out the App
src/App.js

```js
```

src/index.js

```js
import App from './App'

const Root = () => (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)

ReactDOM.render(<Root />, document.getElementById('app'))
```

Serving the App server side
`yarn add react-dom react-helmet babel-register ignore-styles babel-plugin-import-graphql fs apollo-link-http apollo-client apollo-cache-inmemory`

.babelrc

```
"plugins": [
  "import-graphql",
  "..."
]
```

ssr.js

```js
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

import createStore from 'store'
import App from 'App'
```

```js
export default (req, res) => {
  const graphqlUrl = `${req.protocol}://${req.get('Host')}/graphql`
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

  // ... render app
}
```

```js
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
    htmlTemplate({ reactDom, reduxState, apolloState, helmetData, graphqlUrl })
  )
})
```

```js
function htmlTemplate({
  reactDom = '<div />',
  reduxState,
  apolloState,
  helmetData,
  graphqlUrl
}) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="/static/style.css" />
            ${helmetData.title.toString()}
            ${helmetData.meta.toString()}
        </head>
        <body>
            <div id="app">${reactDom}</div>
            <script>
                window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
                window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
                window.graphqlUrl = '${graphqlUrl}'
            </script>
            <script src="/static/main.js"></script>
        </body>
        </html>
    `
}
```

webpack.ssr.js

```js
```

server.js

```js
import ssr from './dist/ssr'

app.use('/*', ssr)
```

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
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>
)
```

`yarn add --dev npm-run-all`

package.json

```json
"scripts": {
  "start": "npm-run-all --parallel serve watch:build dev",
  "dev": "webpack-dev-server --mode development --history-api-fallback",
  "build": "webpack --mode production",
  "watch:build": "yarn build --watch",
  "serve": "nodemon --exec babel-node server.js --ignore src"
}
```
