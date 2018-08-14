## Thinking in components

Based on a design, break it down in resulable components and specific functions to create an experience where:

## Home

Show different categories Popular Movies, On TV now, In cinemas, Coming soon, Available for rent

## Search

Search results based on title, character name, cast member, studio

## Movie

Show info of movie / TV-show with Hero image/video, list of cast members with character names (ordered by most payed), rating, episodes, trailers and images. And related movies/TV-shows.

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
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve('svg-inline-loader'),
            options: {
              removeTags: true,
              removeSVGTagAttrs: true,
              idPrefix: 'special'
            }
          }
        ]
      }
    ]
    // ...
  }
}
```
