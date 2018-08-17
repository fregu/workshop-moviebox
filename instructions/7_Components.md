## Thinking in components

Based on a design, break it down in resulable components and specific functions to create an experience where:

## Structure

base
components
containers
helpers
views

## Page

```js
<Page>
  <PageHeader>
    <SearchBar />
  </PageHeader>
  {children}
  <Modal />
</Page>
```

## Home

Show different categories Popular Movies, On TV now, In cinemas, Coming soon, Available for rent

```js
{
  selected ? <Hero {...selected} /> : null
}
{
  categories.map(category => (
    <Carousel key={category.id}>
      {category.items(item => (
        <Link url={`/${item.type}/${item.id}`} discreet>
          <Poster dimensions="2by3" src={item.poster_path} title={item.title} />
        </Link>
      ))}
    </Carousel>
  ))
}
```

## Search

Search results based on title, character name, cast member, studio

```js
{
  results.length ? (
    <Grid withGutter>
      {result.map(item => (
        <GridCell widths={'':'1of2', s: '1of3', m: '1of4', l: '1of5'}>
          <Link url={`/${item.type}/${item.id}`} discreet>
            <Poster
              dimensions="2by3"
              src={item.poster_path}
              title={item.title}
            />
          </Link>
        </GridCell>
      ))}
    </Grid>
  ) : <p>Inga resultat</p>
}
```

## Movie / Show

Show info of movie / TV-show with Hero image/video, list of cast members with character names (ordered by most payed), rating, episodes, trailers and images. And related movies/TV-shows.

```js
<Hero {...movie} /> // with hero image, description, rating, director, actors,
// Carousel with Cast members <Carousel><CastMember /></Carousel>
// Carousel with trailers, backgrounds, posters and images <Carousel><Link><Figure /></Link></Carousel>
// Facts <DefintionList> <TagList> <Tag>
// Epoisode list <Tabs><Tab><Link><Episode /></Link></Tab></Tabs>
// Related <Carousel><Link><Poster></Link></Carousel>
```

### Components we need

Page
Carousel
Poster
Figure
Link
Button
Icon
Hero
Grid

### Storybook

By creating example stories of our components, views and containers we can present them in a storybook styleguide

src/components/Button/stories.js
`yarn add --dev @storybook/react`

package.json

```json
{
  "scripts": {
    "storybook": "start-storybook -p 9001 -c .storybook"
  }
}
```

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

.stories.config.js
import { configure } from '@storybook/react';

const req = require.context('../src/components', true, /\.stories\.js$/)

function loadStories() {
req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);

```js
import { configure } from '@storybook/react'

const req = require.context('../src/components', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
```

### Exercises

- Create the experience by using predefined components and adding your own
