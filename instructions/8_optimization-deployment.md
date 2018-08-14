## Optimization and deployment

### Creating a production build

```bash
yarn add --dev webpack-merge uglifyjs-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin
```

webpack.config.js

```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  plugins: [
    // ...,
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
  // ...
}
```

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

webpack.prod.js

```js
const merge = require('webpack-merge')
const common = require('./webpack.config.js')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map'
})
```

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

## Heroku

Create heroku account https://heroku.com

```bash
yarn global add heroku

heroku login

heroku create

git push heroku master

heroku ps:scale web=1

heroku open
```

Procfile

```
web: yarn index.js
```
