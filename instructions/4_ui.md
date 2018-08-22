## React Router

The first step we need to start making a basic application is a way to distinguish between views. We accomplish this by using a router, to assign different URLs with different views.

First we need to add history-api-fallback parameter to webpack-dev-server to let redirect any URL to src/index.js

package.json
`"start": "webpack-dev-server --mode development --open --history-api-fallback",`

In webpack we define a root path, allowing us to import assets from a root

webpack.config.js

```js
module.expoerts = {
  output: {
    publicPath: '/'
  }
  // ...
}
```

`yarn add react-router-dom`

src/App.js

```js
import React from 'react'
import { Switch, Route } from 'react-router-dom'

import HomeView from 'views/HomeView'
import MovieView from 'views/MovieView'

const App = () => (
  <Switch>
    <Route exact path="/movies/:id" component={MovieView} />
    <Route component={HomeView} />
  </Switch>
)
export default App
```

src/index.js

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Link } from 'react-router-dom'
import App from './App'

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'))
```

## Views

Views are react components responsible for constructuring the page loaded by a URL. It is usually quite short and relioes instead of Containers, where the actual logic is.

src/views/HomeView/index.js

```js
// @flow
import React, { Component } from 'react'

type Props = {}
export default class HomeView extends Component<Props> {
  render() {
    return <div className="HomeView">Nice to be home</div>
  }
}
```

src/views/MovieView/index.js

```js
// @flow
import React, { Component } from 'react'
import { getMovie } from 'store/actions'
import { connect } from 'react-redux'

type Props = {
  match: any,
  movie: any | false,
  getMovie: Function
}

class MovieView extends Component<Props> {
  componentDidMount = () => {
    const {
      movie,
      match: {
        params: { id }
      },
      getMovie
    } = this.props
    if (!movie || movie.id !== id) {
      getMovie(id)
    }
  }
  render() {
    const { movie } = this.props
    return (
      <div className="MovieView">
        {!movie ? 'Laddar' : <h1>{movie.title}</h1>}
      </div>
    )
  }
}
export default connect(
  ({ activeMovie }) => ({ movie: activeMovie }),
  dispatch => ({ getMovie: id => dispatch(getMovie(id)) })
)(MovieView)
```

## Containers

Containers are complex building blocks, which views are build with. They have a single (major) purpose and are in turn mostly constructed out of Components.

In our case we can initially identify four specific containers.

```jsx
<Search />          // Search form responsible of calling 'SEARCH_MOVIE'
<SearchResults />   // Result list which will display all movies/TV-shows found in search
<BrowseByCategory /> // A way to browse movies or TV-shows by category (separate API-call)
<CategorySlider />  // Which fetcher items for a category and presents it in a slider
<Single />          // Finally a place to show details for an active Movie/TV-show
```

## Components

Components are the reusable building blocks which are used to render actual HTML and or other components

In our app we will need components for.

```jsx
<Hero />            // Area with big background for highlighting specific content
<Carousel />        // Horizontal scrollable area of items
<Form />            // Form handler to handle form elements and events
<FormInput />       // Input component to render HTMLFormElement and label
<Figure />          // Image/Video container
<Video />           // Video player/embeder
<Card />            // Styled container
<MovieCard />       // <Card /> for purpose of showing movie/TV-show
<Button />          // Button element to listen for clicks
<Link />            // Anchor element with a URL to redirect to.
<Icon />            // Icon importer, allowing buttons, links and forms etc. to show icons
<Title />           // Title handler to render different <hx> tags with appropriate styling
<TabList />         // Tabs are always a nice way to navigate sub content
<TabPanel />        // Content container for toggleble content
<List />            // Hansler to generate and style different sorts of lists
<Rating />          // Show rating for movie/TV-show

<Grid />            // Layout handler for dividing content in <GridCell />s
<GridCell />        // Content wrapper in <Grid /> to specify widths
<Gutter />          // Separator adding gutter (padding) between elements
<Layout />          // Layout handler for other ways of aligning content
<View />            // View container used to wrap and add basic stylign to each view
```

## Base styling

To break stuff up even further, we have lots of common styling between components which we will handle using utility classes and CSS variables in what i like to call base styling. In some it might be a good idea to include prefixes according to screen size.

In this project and in most projects they can be divided in something like this.

```
Animation           // Declare animations and standard transitions (.animation-appear )
Color               // Define the color palette (.color-darkred )
Text                // Define fonts and text styles and sizes (.text-header3> )
Layout              // Define layout widths and gutters (.layout-container )
Flex                // Helper utility for handling flex box styling (.flex-row )
Width               // Define % width of a container (.width-1of2, .m-width-1of4 )
Dimension           // Define dimension of image container (.dimension-4by3 )
Theme               // Theme helper to handle background and text colors (.theme-dark)
Hidden              // Helper to hide/show content (.hidden-text, .smax-hidden)
```

Besides these utility classes we also need a set of variables for all common values, like colors, font-sizes, shadows, border-radiuses and breakpoints.

Since this would take too long to go through and build theese together, these components are available as a starting point to use, style and modify to accomodate our needs.

Checkout the git branch step4-sollution in the workshop repository and copy the folders src/components, src/assets, src/helpers and src/base to your working repository.

`yarn add cuid form-serialize`

### BEM Styling

The styling in these components follow the model of BEM (Block Element Modifiers) which I think is a really great pattern especially for react components.

The basic idea of BEM is to write class names based on every elements purpose and origin.

Block: The block is the root element, usually equals the name of the react component.
The block name is written using PascalCase (just as react components)
`className="Button"`

Element: Elements are sub elements to a block, with a describing name for it's purpose. Elements are written by writing the Block name, a single dash and camel case element name.
`className="Button-textWrapper"`

Modifier: Modifiers are a way to create alternative styling for block elements or subelement, and a declared with block name and double dash before the moddifier name in camelCase. The modifier class is always added after the original className, this way we only need to specify the variations in CSS.
`className="Button Button--large"`

By clearly defining the origin and purpose of elements we never need to get a deeper CSS seletor path than 2, and this only when using a modifier on the Block element. This makes it easy to override without the need for extra selectors or !important statements.

It also makes it crystal clear exacly where the styling belongs, and in my opinion makes CSS modules obsolete.

We also have utility classnames which can be used for a single purpose extended styling of "any" other element. These are defined in in lowercase with a name block and purpose.
`text-large theme-dark layout-bottom-padding flex-fill`

These classes can be used to handle all definition of font, colors, and basic layout, making it uneccessary defining this in the component styling. Insted just sprinkle some extra class names to define colors, text size, widths etc. keeping each style section clean with a single purpose.

### PostCSS

PostCSS is an excellent CSS precompiler allowing us to use the great features of tomorrow today.

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
        importLoaders: 1,
        minimize: false,
        sourceMap: false
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          // IS THIS HANDLING THE @imports??
          require('postcss-import')(),
          require('postcss-preset-env')({
            features: {
              'nesting-rules': true,
              'custom-media-queries': true
            }
          })
        ],
        sourceMap: true,
        ident: 'postcss'
      }
    }
  ]
}
//...
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
module.exports = require('./webpack.config.js')
```

## Exercises

- Create a connected React component src/containers/Search/index.js with a
  input field dispatching `{ type: 'SEARCH', query}` (using action creator ofcourse)

- Create the connected React component src/containers/SearchResults/index.js which displays the search results from redux linking each result page '/movie/{id}'

- Create the container connected component `<Single />` that shows the information about the active movie under the view `<MovieView />`, such as title, production year, genre etc.

- Create the connected component `<PopularMovies />` which presents a list with all popular movies, which also is linkable, which is displayed whenever the search field is empty

- Design your own basic movie/TV browsing experience on paper with the possibility to browse by category, search and open a certain movie/TV-show to see details such as actors, images, trailers etc.
