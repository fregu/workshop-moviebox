import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import newMovies from 'queries/newMovies.gql'

@graphql(newMovies)
export default class Home extends Component {
  render() {
    const {
      data: { newMovies = [] }
    } = this.props
    return (
      <div className="Home">
        {newMovies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
            <img src={movie.poster_path} />
          </div>
        ))}
      </div>
    )
  }
}

// <SearchMovie />
// <SearchResults />
