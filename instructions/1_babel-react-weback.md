## Setting up the project

In this session you will setup a basic React App using Webpack 4, Babel and Webpack dev server. It will focus on understanding what the basic boilerplate code does and how you easily can set it up your self from scratch.

Create a new folder for our project

```bash
mkdir moviebox && cd $_

yarn init -y
# (npm init -y)
```

## Git

Initialize a local git repository to be able to commit, branch and reset your work

```bash
git init
git add .
git commit -m "My brand new app"
git checkout -b step1

# Do a lot of work and when ready to merge
git checkout master
git merge step1
```

.gitignore

```
node_modules
dist
```

### Update node

Make sure you have an updated version of node js running, since we will use node for installing dependencies and building assets and later hosting our web application.

```bash
# check node version
node -v
```

install node LTS (Long term support ^8.11.X) stable version via n (or nvm)

```bash
yarn global add n
n lts
```

## Create app

src/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React and Webpack4</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

src/index.js

```js
console.log('Hello JavaScript')
```

### Setup webpack

Webpack is a asset bundler which we use to parse, build and serve our application

This is our app, for now

```bash
yarn add webpack webpack-cli html-webpack-plugin
yarn add --dev webpack-dev-server
```

webpack.config.js

```js
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html'
    })
  ]
}
```

package.json

```json
  "scripts": {
    "start": "webpack-dev-server --mode development --open",
    "build": "webpack --mode production"
  }
```

```bash
# Start up dev server and run application from memory
yarn start

# Compile app and export html and js to /dist
yarn build
```

check dist folder

### Setting up React

To start using something a bit more complex like React, we need to precompile our JSX and ES6 code to good old ES5 code which all browsers understand. For this we need Babel with certain loaders.

Also remember to install the React DevTools extension to your browser to be able to browse the virtual DOM and lookup the properties and state of each component in real time.

```bash
yarn add react react-dom

# Babel with presets and loader to understand JSX and ES6+
yarn add @babel/core @babel/preset-env @babel/preset-react babel-loader
```

webpack.config.js

```js
// ...
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          // Use Babel to transpile all JavaScript
          loader: 'babel-loader'
        }
      }
    ]
  }
  // ...
}
```

Tell babel to expect ES6 and JSX
.babelrc

```js
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ]
}
```

src/index.js

```js
// React is needed to be imported to be able to write JSX
import React from 'react'
import ReactDOM from 'react-dom'

const Root = () => {
  // JSX is not valid javascript, it needs to be transpiled first
  return <div>Hello React!</div>
}

ReactDOM.render(<Root />, document.getElementById('root'))
```

Webpack serves our html document and add styles and script automatically using html-webpack-plugin

`yarn start`

### CSS

By adding specific loaders to webpack.config.js we tell webpack how to handle other file types, like CSS, images, icons, fonts etc.

```bash
yarn add style-loader css-loader
```

webpack.config.js

```js
module.exports = {
  module: {
    rules: [
      //... ,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
  // ...
}
```

src/index.css

```css
html {
  color: blue;
}
```

src/index.js

```js
import './index.css'
```

#### CSS modules

Whether or not to user CSS modules is a hot topic in the biz. If you are into
that, this is how you easily can accomplish it.

webpack.config.js

```js
use: [
  'style-loader',
  {
    loader: 'css-loader',
    options: { modules: true, localIdentName: '[local]__[hash:base64:5]' }
  }
]
```

When using CSS modules importing css will result in a new generated className like class="App\_\_jkgu68", which is why we also need to set the className of each element based on the css module eg.

```js
import styles from './index.css'

export default () => <div className={styles['App']} />
```

! However for the rest of this workshop we will not use CSS modules, no lets set modules to false for now.

### Images, Fonts, Icons

You can import other file types as well from
`yarn add file-loader svg-inline-loader image-webpack-loader`

webpack.config.js

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.(woff|woff2|(o|t)tf|eot)$/i,
        loader: 'file-loader',
        query: {
          name: 'fonts/[name].[hash].[ext]'
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
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
        test: /\.svg$/i,
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
    // ...
  }
}
```

```js
import image from 'assets/images/image.jpg'
import icon from 'assets/icons/icon.svg'
import 'assets/fonts/font.css'

export default () => (
  <div>
    Assets
    <img src={image} alt="" />
    <span
      dangerouslySetInnerHTML={{ __html: icon }}
      style={{ width: '2em', display: 'inline-block' }}
    />
  </div>
)
```

### PostCSS

PostCSS is an excellent CSS precompiler allowing us to use the great features of tomorrow today, almost like Babel but for CSS.

We will use it to aitomatically add vendor prefixes and alternative implementation of specific styling, handle custom media queries, and handling importing and optimizations.

`yarn add postcss postcss-loader postcss-import postcss-preset-env`

webpack.config.js

```js
//...
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        // allow postcss-loader to also parse @imported styles
        importLoaders: 1
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          // resolves @import statements replacing them with actual content
          require('postcss-import')({ skipDuplicates: true }),

          // handle most common rules like autoprefixing, resolving variables, colors and custom media queries
          require('postcss-preset-env')({
            features: {
              'nesting-rules': true,
              'custom-media-queries': true
            }
          })
        ],

        // Allow dev tools to see origin in minified assets
        sourceMap: true,

        // identifier
        ident: 'postcss'
      }
    }
  ]
}
//...
```

This allows us to make much more of our CSS than standard CSS, but still following proposed CSS standards, making other syntax languages like Sass and Less mostly obsolete.

```css
@custom-media --viewport-medium (width <= 50rem);
@custom-selector :--heading h1, h2, h3, h4, h5, h6;

:root {
  --mainColor: #12345678;
}

body {
  color: var(--mainColor);
  font-family: system-ui;
  overflow-wrap: break-word;
}

::placeholder {
  color: gray;
}

:--heading {
  background-image: image-set(
    url(img/heading.png) 1x,
    url(img/heading@2x.png) 2x
  );

  @media (--viewport-medium) {
    margin-block: 0;
  }
}

a {
  color: rebeccapurple;

  &:hover {
    color: color-mod(var(--mainColor) alpha(80%));
  }
}

/* becomes */

:root {
  --mainColor: rgba(18, 52, 86, 0.47059);
}

body {
  color: rgba(18, 52, 86, 0.47059);
  color: var(--mainColor);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Oxygen, Ubuntu, Cantarell, Droid Sans, Helvetica Neue;
  word-wrap: break-word;
}

::-webkit-input-placeholder {
  color: gray;
}
:-ms-input-placeholder {
  color: gray;
}
::-ms-input-placeholder {
  color: gray;
}
::placeholder {
  color: gray;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  background-image: url(img/heading.png);
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    background-image: url(img/heading@2x.png);
  }
}

@media (max-width: 50rem) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    margin-bottom: 0;
  }
}

a {
  color: #639;
}

a:hover {
  color: rgba(18, 52, 86, 0.8);
}
```

Now we have a very basic but good foundation of building a complex application. Depending on the needs for each application you might need to configure loaders for different file types and special setting of how you want webpack to handle them for you.

As a rule of thumb you can think that when you want to import something, you need to configure how in webpack.config.js, but if you want to use some special syntax or methods (not available in EcmaScript5) you will need to transpile it using Babel.
