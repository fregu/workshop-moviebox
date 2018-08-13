import TMDB from 'helpers/tmdb-fetch'
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList
} from 'graphql'
import dotenv from 'dotenv'

dotenv.config()
const api = new TMDB(process.env.TMDB_API_KEY)

const NewMoviesType = new GraphQLObjectType({
  name: 'NewMovies',
  fields: {
    id: { type: GraphQLInt },
    poster_path: { type: GraphQLString },
    title: { type: GraphQLString }
  }
})
const VideoType = new GraphQLObjectType({
  name: 'Video',
  fields: {
    id: { type: GraphQLString },
    key: { type: GraphQLString },
    url: { type: GraphQLString }
  }
})
const MovieCreditsType = new GraphQLObjectType({
  name: 'MovieCredits',
  fields: {
    id: { type: GraphQLString },
    character: { type: GraphQLString },
    name: { type: GraphQLString },
    profile_path: { type: GraphQLString },
    order: { type: GraphQLString }
  }
})

const MovieReviewsType = new GraphQLObjectType({
  name: 'MovieReviews',
  fields: {
    id: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString }
  }
})
const MovieInfoType = new GraphQLObjectType({
  name: 'MovieInfo',
  description: 'Get a single movie',
  fields: {
    id: { type: GraphQLString },
    overview: { type: GraphQLString },
    title: { type: GraphQLString },
    poster_path: { type: GraphQLString },
    genres: { type: GraphQLString },
    release_date: { type: GraphQLString },
    vote_average: { type: GraphQLString },
    production_companies: { type: GraphQLString },
    vote_average: { type: GraphQLString },
    runtime: { type: GraphQLString },
    videos: {
      type: new GraphQLList(VideoType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api.get(`/movie/${parentValue.id}/videos`).then(data =>
          data.results.map(video => ({
            ...video,
            url: `https://www.youtube.com/embed/${video.key}`
          }))
        )
      }
    },
    movieReviews: {
      type: new GraphQLList(MovieReviewsType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/movie/${parentValue.id}/reviews`)
          .then(data => data.results)
      }
    },
    movieCredits: {
      type: new GraphQLList(MovieCreditsType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/movie/${parentValue.id}/credits`)
          .then(data => data.cast.filter(cast => cast.profile_path))
      }
    }
  }
})
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    videos: {
      description: 'Get the movie trailers for a certain flick',
      type: new GraphQLList(VideoType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api
          .get(`/movie/${args.id}/videos`)
          .then(data => data.results)
          .map(video => ({
            ...video,
            url: `https://www.youtube.com/embed/${video.key}`
          }))
      }
    },
    newMovies: {
      type: new GraphQLList(NewMoviesType),
      resolve() {
        return api.get(`/movie/now_playing`).then(data => {
          const movies = data.results
          movies.map(
            movie =>
              (movie.poster_path =
                'https://image.tmdb.org/t/p/w500' + movie.poster_path)
          )
          return movies
        })
      }
    },
    movieInfo: {
      type: MovieInfoType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api.get(`/movie/${args.id}`).then(movie => {
          movie.genres = movie.genres.map(g => g.name).join(', ')
          movie.production_companies = movie.production_companies
            .map(g => g.name)
            .join(', ')
          movie.runtime += ' min.'
          return movie
        })
      }
    }
  }
})
export default new GraphQLSchema({
  query: RootQuery
})
