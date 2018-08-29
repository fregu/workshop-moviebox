## Performance tracking

Our app is working, but is it ready for users? Before we deploy anything, lets make sure it is as optimized as we can.

Install browser extension Lighthouse (Chrome)
Generate report

We still dont have a big application to the score is already quite fair, but there is a lot we can do to to optimize the build process anyway.

- Minify all styles and javascript
- enable text compression (gzip, br)
- Compress image assets

For our production build we import minifiers for css, js, with extra file compression using brotli and gzip and the manifest plugin, wo help webpack keep track of all assets

```bash
yarn add webpack-merge clean-webpack-plugin uglifyjs-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin cssnano webpack-manifest-plugin zopfli-webpack-plugin brotli-webpack-plugin
```

webpack.prod.js

```js
const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')('production')

const HtmlWebPackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
// gzip compression
const ZopfliPlugin = require('zopfli-webpack-plugin')
// br compression
const BrotliPlugin = require('brotli-webpack-plugin')

module.exports = merge(common, {
  devtool: 'source-map',

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  },
  module: {
    rules: []
  },
  plugins: [
    // Delete dist folder before every build
    new CleanWebpackPlugin('dist'),

    // Export html-file to dist/template.html
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './template.html'
    }),

    // Generate a webpack-manifest of all exported assets
    new ManifestPlugin({ fileName: 'webpack.manifest.json' }),

    // General options for loaders
    new webpack.LoaderOptionsPlugin({
      // Switch loaders to `minimize mode` where possible
      minimize: true,

      // Turn off `debug mode` where possible
      debug: false,
      options: {
        // The 'context' that our loaders will use as the root folder
        context: __dirname,

        // image-webpack-loader image crunching options
        imageWebpackLoader: {
          mozjpeg: {
            quality: 65
          },
          pngquant: {
            quality: '65-90',
            speed: 4
          },
          svgo: {
            plugins: [
              {
                removeViewBox: false
              },
              {
                removeEmptyAttrs: false
              }
            ]
          }
        }
      }
    }),

    // export CSS file to style.css
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),

    // Minify and optimize CSS
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    })
    // Compress assets into .gz files, for browsers with support
    new ZopfliPlugin(),

    // Also generate .br files, with Brotli compression-- often significantly smaller than the gzip equivalent, but not yet universally supported
    new BrotliPlugin()
  ]
})
```

And for SSR we import config from webpack.prod.js instead and import optimizations. We also add a raw-loader for HTML files, since we soon need to import the generated html-template.

webpack.ssr.js

```js
const prodConfig = require('./webpack.prod.js')

// ...
module.exports = {
  // ...
  optimization: prodConfig.optimization,
  module: {
    rules: [
      ...prodConfig.module.rules.map(
        rule =>
          '.css'.match(rule.test) ? { ...rule, use: 'null-loader' } : rule
      ),
      {
        test: /\.html$/,
        use: 'raw-loader'
      }
    ]
  }
}
```

Now we update the html template generator, and insted of printing a complete document we import the webpack generated html-template including assets, manifest files etc.

server/htmlTemplate.js

```js
import html from '../dist/template.html'

export default function htmlTemplate({
  reactDom = '<div />',
  reduxState,
  apolloState,
  helmetData,
  graphqlUrl
}) {
  const headString = `
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
    ${helmetData.link.toString()}
    ${helmetData.style.toString()}
  `
  const stateScript = `
    <script>
      window.__REDUX_STATE__ = ${JSON.stringify(reduxState)}
      window.__APOLLO_STATE__ = ${JSON.stringify(apolloState)}
      window.graphqlUrl = '${graphqlUrl}'
    </script>
  `

  return html
    .replace(
      '<div id="root"></div>',
      `${helmetData.noscript.toString()}<div id="root">${reactDom}</div>${stateScript}`
    )
    .replace('</head>', `${headString}</head>`)
    .replace('<body', `<body ${helmetData.bodyAttributes.toString()}`)
    .replace('<html', `<html ${helmetData.htmlAttributes.toString()}`)
    .replace('</body>', `${helmetData.script.toString()}</body>`)
}
```

Now all assets are compressed, so lets also compress the html response on the server.

sertver/index.js

```js
import compress from 'koa-compress'
// ...
app.use(compress())
```

## Favicons

Another important factor of any web app is app icons. The definition of which dimension a icon (touch-icon) should have varies a lot between devices, and the full list can quickly become massive.

```html
<head>
  <!-- ... -->
  <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/apple-touch-icon-57x57.png" />
  <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/apple-touch-icon-60x60.png" />
  <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/apple-touch-icon-72x72.png" />
  <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76.png" />
  <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/apple-touch-icon-114x114.png" />
  <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120.png" />
  <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/apple-touch-icon-144x144.png" />
  <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152.png" />
  <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
  <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/png" href="/favicon-128x128.png" sizes="128x128" />
  <link rel="icon" type="image/png" href="/favicon-196x196.png" sizes="196x196" />
  <!-- ... -->
</head>
```

We will however not export icons for dimensions manually, instead let webpack handle it for us.

`yarn add favicons-webpack-plugin`

webpack.prod.js

```js
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    // ...
    new FaviconsWebpackPlugin('./src/assets/images/large-icon.png')
  ]
}
```

## Progressive Web Apps - future of web development

Progressive web app is a relative new terminology allowing us to take full control of all network request from the app, and caching of assets to create a truly offline fallback behaviour, and heavily speeding up the initial load time.

### Web app manifest

The first thing we need to define a PWA is a web app manifest, which tells the browser how we want the app to behave when installed (saved to homescreen).

`yarn add webpack-pwa-manifest`

webpack.prod.js

```js
// ...
const WebpackPwaManifest = require('webpack-pwa-manifest')
const path = require('path')

module.exports = {
  // ...
  plugins: [
    // ...
    new WebpackPwaManifest({
      name: 'Moviebox app',
      short_name: 'Moviebox',
      description: 'My awesome Progressive Web App!',
      theme_color: '#ffffff',
      display: 'standalone',
      background_color: '#ffffff',
      crossorigin: 'use-credentials', // can be null, use-credentials or anonymous
      icons: [
        {
          src: path.resolve(__dirname, 'src/assets/images/large-icon.png'),
          sizes: [96, 114, 120, 128, 144, 152, 192, 256, 384, 512] // multiple sizes
        },
        {
          src: path.resolve(__dirname, 'src/assets/images/large-icon.png'),
          size: '1024x1024' // you can also use the specifications pattern
        }
      ],
      ios: true
    })
  ]
}
```

outputs dist/manifest.<fingerprint>.json

```json
{
  "name": "Moviebox app",
  "short_name": "Moviebox",
  "description": "My awesome Progressive Web App!",
  "orientation": "portrait",
  "display": "standalone",
  "start_url": "/",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    {
      "src": "/assets/icon_1024x1024.<fingerprint>.png",
      "sizes": "1024x1024",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_512x512.<fingerprint>.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_384x384.<fingerprint>.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_256x256.<fingerprint>.png",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_192x192.<fingerprint>.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_128x128.<fingerprint>.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/assets/icon_96x96.<fingerprint>.png",
      "sizes": "96x96",
      "type": "image/png"
    }
  ]
}
```

Since we are basing our serverside rendering on the generated HTML, it will already include the manifest file in the header

```html
<link rel="manifest" href="/assets/manifest.b4123d1231231as234da.json">
```

## Service worker and offline caching

Next we will actually make the app woking when there is no internet connection, by registering a service worker.
(https://developers.google.com/web/fundamentals/primers/service-workers/)

Mount /sw as a path got get service worker, since on /assets/sw the scope would be /assets/ and we need to be able to cache '/' as well.

server/index.js

```js
app.use(
  mount('/sw', serve(path.resolve(__dirname, '..', 'dist'), { index: 'sw.js' }))
)
```

server/htmlTemplate.js

```js
const stateScript = `
  <script>
  // ...
  if ('serviceWorker' in navigator && location.protocol === 'https') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw').then(
        registration => {
          // Registration was successful
          console.log(
            'ServiceWorker registration successful with scope: ',
            registration.scope
          )
        },
        err => {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err)
        }
      )
    })
  }
  <script>
`
```

src/sw.js

```js
var CACHE_NAME = 'app-cache-v1'

self.addEventListener('install', event => {
  console.log('Installed')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        // fetch and parse webpack.manifest to add js/css assets to cache
        fetch('/assets/webpack.manifest.json')
          .then(response => response.json())
          .then(assets =>
            cache.addAll([
              '/',
              ...(Object.keys(assets)
                .filter(name => name.match(/.(js|css)$/))
                .map(key => assets[key]) || [])
            ])
          )
      )
      .then(() => self.skipWaiting())
  )
})

// Llisten for fetch events
self.addEventListener('fetch', event => {
  console.log('trying to fetch are you')

  event.respondWith(
    // First try network, and if not successful fallback to cache
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
```

However with a self signing certificate the service worker can not be correctly installed, but to test the functionality there is a way to solve this.

open a new instance of Chrome without security flags

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/foo --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:5501
```

### Handle offline mode

Since the app still will work when there is no internet connection, it might be nice to handle the UI accordingly. For now we will use the navigator.onLine property to tell react what to render depending on connection.

first lets create a src/views/OfflineView/index.js

```js
// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import View from 'components/View'
import Link from 'components/Link'

type Props = {
  className?: string
}

export default class OfflineView extends Component<Props> {
  render() {
    const { className } = this.props
    return (
      <View className={classNames('OfflineView', className)}>
        App is offline
        <Link to="/">Back to start</Link>
      </View>
    )
  }
}
```

And in HomeView lets hide the search field for offline users.
src/views/HomeView/index.js

```js
<View className="HomeView">
  {typeof navigator === 'undefined' || navigator.onLine ? <Search /> : null}
  {query.length ? <SearchResults /> : <BrowseByCategory />}
</View>
```

src/views/MovieView/index.js

```js
render() {
  const isOnline = typeof navigator === 'undefined' || !('onLine' in navigator) || navigator.onLine

  return !isOnline ? <OfflineView /> : (
    <View className="MovieView">
      <Link to="/">Back</Link>
      <Single id={id} type={path.match(/\/movie/) ? 'movie' : 'tv'} />
    </View>
  )
}
```

### Add to home screen

If you are on a android device and build an app with web app manifest and register a service worker which handles fetch, served over https. You will auomatically get a "Add to homescreen" banner allowing you to install the app, just as any installed from google Play.

(https://developers.google.com/web/fundamentals/app-install-banners/)
