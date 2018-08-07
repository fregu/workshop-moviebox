## Setting up the project
```bash
mkdir moviebox && cd $_

yarn init -y
```

### Setup webpack 4
```bash
yarn add --dev webpack webpack-cli html-webpack-plugin webpack-dev-server
```
```json
  "scripts": {
    "start": "webpack-dev-server --mode development --open",
    "build": "webpack --mode production"
  }
```

```bash
echo "console.log('Hello Javascript')" > src/index.js
```
```bash
npm run start
npm run build
```

check dist folder

### Setting up React
```bash
yarn add react react-dom
yarn add --dev babel-core babel-loader babel-preset-env babel-preset-react
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
          loader: "babel-loader"
        }
      }
    ]
  }
}
```

.babelrc
```js
{
  "presets": ["env", "react"]
}
```

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React and Webpack4</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

index.js
```js
import React from "react";
import ReactDOM from "react-dom";

const Index = () => {
  return <div>Hello React!</div>;
};

ReactDOM.render(<Index />, document.getElementById("app"));
```

```bash
yarn add --dev html-webpack-plugin
```
```js
const HtmlWebPackPlugin = require("html-webpack-plugin");

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});
module.exports = {
  ...,
  plugins: [htmlPlugin]
}
```

### Webpack dev server
```json
"start": "webpack-dev-server --mode development --open",
```

### CSS
```bash
yarn add --dev css-loader style-loader
```

webpach.config.js
```js
    ...,
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    }
  ]
},
...
