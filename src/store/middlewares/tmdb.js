// import TMDB from 'helpers/tmdb-fetch'
const API_KEY = '72e8013728917209a38a06e945fb6a2f'
const api = { get() {} } // new TMDB(API_KEY)

export const tmdb = ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case 'GET_MOVIE':
      dispatch({ type: 'LOADING_MOVIE' })
      api
        .get(`/movie/${action.id}`, { language: 'sv_SE' })
        .then(data => dispatch({ type: 'SET_MOVIE', data }))
      break
    case 'SEARCH_MOVIE':
      api
        .get(`/search/movie`, {
          language: 'sv_SE',
          include_adult: false,
          query: action.query
        })
        .then(data => dispatch({ type: 'SET_SEARCH_RESULT', data }))
      break
    default:
  }
  next(action)
}
