import qs from 'qs'
const fetch =
  typeof window === 'undefined' ? require('node-fetch') : window.fetch

export default function tmdb(api_key) {
  const BASE_URL = 'https://api.themoviedb.org/3'
  const defaults = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const defaultQuery = {
    api_key: api_key
  }

  function request({ url, path, query = {}, ...req }) {
    return fetch(
      url ||
        `${BASE_URL}${path}${path.indexOf('?') > -1 ? '&' : '?'}${qs.stringify({
          ...defaultQuery,
          ...query
        })}`,
      { ...defaults, ...req }
    )
      .then(response => response.json())
      .catch(error => console.error('Error:', error))
  }

  return {
    get(path, params) {
      return request({
        path,
        query: params,
        method: 'GET'
      })
    },
    post(path, params) {
      return request({
        path,
        body: JSON.stringify(params),
        method: 'POST'
      })
    },
    put(path, params) {
      return request({
        path,
        body: JSON.stringify(params),
        method: 'PUT'
      })
    },
    delete(path, params) {
      return request({
        path,
        method: 'DELETE'
      })
    }
  }
}
