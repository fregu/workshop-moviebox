## Setting up the project

In this session you will setup a basic React App using Webpack 4, Babel and Webpack dev server. It will focus on understanding what the basic boilerplate code does and how you easily can set it up your self from scratch.

Create a new folder for our project

```bash
mkdir moviebox && cd $_

yarn init -y
npm init -y
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

### Setup webpack 4

Webpack is a asset bundler which we use to parse, build and serve our application

This is our app, for now

```bash
yarn add webpack
yarn add --dev webpack-cli html-webpack-plugin webpack-dev-server
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

```json
  "scripts": {
    "start": "webpack-dev-server --mode development --open",
    "build": "webpack --mode production"
  }
```

```bash
yarn start
yarn build
```

check dist folder

### Setting up React

To start using something more complex like React, we need to precompile our JSX and ES6 code to good old ES5 code which all browsers understand. For this we need Babel with certain loaders.

Also remember to install the React DevTools extension to your browser to be able to browse the virtual DOM and lookup the properties and state of each component in real time.

```bash
yarn add react react-dom

# Babel with presets and loader to understand JSX and ES6+
yarn add babel-core babel-loader babel-preset-env babel-preset-react
```

webpack.config.js

```js
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
}
```

Tell babel to expect ES6 and JSX
.babelrc

```js
{
  "presets": ["env", "react"]
}
```

index.js

```js
// React is needed to be able to write JSX
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
    //...,
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    }
  ]
},
// ...
```

index.css

```css
html {
  color: blue;
}
```

#### CSS modules

Whether or not to user CSS modules is a hot topic in the biz. If you are into
that, this is how you easily can accomplish it

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

```js
import styles from './index.css'

export default () => <div className={styles['App']} />
```

! However for the rest of this workshop we will not use CSS modules, no lets set modules to fale for now.

### Images, Fonts, Icons

You can import other file types as well from
`yarn add file-loader svg-inline-loader`

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
          }
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
