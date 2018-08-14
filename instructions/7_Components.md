## Thinking in components

Based on a design, break it down in resulable components and specific functions to create an experience where:

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

### importing assets

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

### Exercises

- Create the experience by using predefined components and adding your own
