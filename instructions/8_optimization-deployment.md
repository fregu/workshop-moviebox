## Optimization and deployment

### Creating a production build

webpack.dev.js

```js
const merge = require('webpack-merge')
const common = require('./webpack.config.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
})
```

```bash
yarn add --dev webpack-merge uglifyjs-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin
```

webpack.prod.js

```js
const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const common = require('./webpack.config.js')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
})
```

### Performance tracking

Chrome extension Lighthouse
Generate report

package.json

```json
"engines": {
  "node": "v10.8.0",
  "yarn": "^1.1.0"
},
"scripts": {
  "dev": "webpack-dev-server --history-api-fallback --config webpack.dev.js",
  "build": "webpack --config webpack.prod.js",
  "watch:build": "yarn build --watch",
  "start:server": "yarn build && yarn server",
}
```

## Favicons

```html
<link rel="apple-touch-icon-precomposed" sizes="57x57" href="apple-touch-icon-57x57.png" />
<link rel="apple-touch-icon-precomposed" sizes="60x60" href="apple-touch-icon-60x60.png" />
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="apple-touch-icon-72x72.png" />
<link rel="apple-touch-icon-precomposed" sizes="76x76" href="apple-touch-icon-76x76.png" />
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="apple-touch-icon-114x114.png" />
<link rel="apple-touch-icon-precomposed" sizes="120x120" href="apple-touch-icon-120x120.png" />
<link rel="apple-touch-icon-precomposed" sizes="144x144" href="apple-touch-icon-144x144.png" />
<link rel="apple-touch-icon-precomposed" sizes="152x152" href="apple-touch-icon-152x152.png" />
<link rel="icon" type="image/png" href="favicon-16x16.png" sizes="16x16" />
<link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32" />
<link rel="icon" type="image/png" href="favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/png" href="favicon-128x128.png" sizes="128x128" />
<link rel="icon" type="image/png" href="favicon-196x196.png" sizes="196x196" />
```

## Manifest

`yarn add webpack-pwa-manifest`
webpack.prod.js

```js
// ...
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = {
  // ...
  plugins: [
    // ...
    new WebpackPwaManifest({
      name: 'Moviebox db',
      short_name: 'Moviebox',
      description: 'My awesome Progressive Web App!',
      background_color: '#ffffff',
      crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
      icons: [
        {
          src: path.resolve('src/assets/icon.png'),
          sizes: [96, 114, 120, 128, 144, 152, 192, 256, 384, 512] // multiple sizes
        },
        {
          src: path.resolve('src/assets/large-icon.png'),
          size: '1024x1024' // you can also use the specifications pattern
        }
      ]
    })
  ]
}
```

outputs dist/manifest.<fingerprint>.json

```json
{
  "name": "My Progressive Web App",
  "orientation": "portrait",
  "display": "standalone",
  "start_url": ".",
  "short_name": "MyPWA",
  "description": "My awesome Progressive Web App!",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icon_1024x1024.<fingerprint>.png",
      "sizes": "1024x1024",
      "type": "image/png"
    },
    {
      "src": "icon_512x512.<fingerprint>.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "icon_384x384.<fingerprint>.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icon_256x256.<fingerprint>.png",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "icon_192x192.<fingerprint>.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon_128x128.<fingerprint>.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icon_96x96.<fingerprint>.png",
      "sizes": "96x96",
      "type": "image/png"
    }
  ]
}
```

ssr.js

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
    <html ${helmetData.htmlAttributes.toString()}>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="manifest" href="/manifest.webmanifest">
        ...
  `
}
```

Procfile

```
web: yarn start:server
```

## Heroku

Create heroku account https://heroku.com

```bash
yarn global add heroku

heroku login

# Generate a new app
heroku create myAppName

# Build your app to heroku
git push heroku master

# Checking the app status
heroku ps:scale web=1

# Checking the logs
heroku logs --tail

# Open app in browser
heroku open
```

## Progressive Web App - PWA

Progressive web app is a relative new terminology allowing us to take control of all network request from the app, alowing us to create a offline fallback behaviour, and speeding up initial load time heavily.

### Exercises

- Enhance the lighthouse score further if you can
-
