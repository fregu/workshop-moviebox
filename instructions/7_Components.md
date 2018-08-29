## Thinking in components

### Webpack config

common, prod, dev, ssr

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

### Storybook

By creating example stories of our components, views and containers we can present them in a storybook styleguide

`yarn add @storybook/react`

package.json

```json
{
  "scripts": {
    "storybook": "start-storybook -p 9001 -c .storybook"
  }
}
```

src/components/Button/stories.js

```js
import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Button from './Button'

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </Button>
  ))
```

.storybook/config.js

```js
import { configure } from '@storybook/react'

const req = require.context('src/components/Button', true, /stories\.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
```

.storybook/webpack.config.js

```js
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, { mode: 'development' })
```
