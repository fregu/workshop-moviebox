import qs from 'qs'

export default function tmdb(api_key) {
  const BASE_URL = 'https://api.themoviedb.org/3'
  const defaults = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  function request({ url, ...req }) {
    return fetch(url, { ...defaults, ...req })
      .then(response => response.json())
      .catch(error => console.error('Error:', error))
  }

  return {
    get(path, params) {
      return request({
        url: `${BASE_URL}${path}?${qs.stringify({
          api_key: api_key,
          ...params
        })}`,
        method: 'GET'
      })
    },
    post(path, params) {
      return request({
        url: `${BASE_URL}${path}?${qs.stringify({ api_key: API_KEY })}`,
        body: JSON.stringify(params),
        method: 'POST'
      })
    },
    put(path, params) {
      return request({
        url: `${BASE_URL}${path}?${qs.stringify({ api_key: API_KEY })}`,
        body: JSON.stringify(params),
        method: 'PUT'
      })
    },
    delete(path, params) {
      return request({
        url: `${BASE_URL}${path}?${qs.stringify({ api_key: API_KEY })}`,
        method: 'DELETE'
      })
    }
  }
}
