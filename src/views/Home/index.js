// @flow
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import newMovies from 'queries/newMovies.gql'
import Test from 'components/Test'
import { Helmet } from 'react-helmet'
import './index.css'

type Props = {
  data: { newMovies: Array<any> }
}

@graphql(newMovies)
export default class Home extends Component<Props> {
  render() {
    const {
      data: { newMovies = [] }
    } = this.props
    return (
      <div className="View Home">
        <Helmet>
          <title>Home sweet home</title>
        </Helmet>
        <Test>Yayway</Test>
        <div className={'NewMovies'}>
          {newMovies.map(movie => (
            <div key={movie.id}>
              <h3>{movie.title}</h3>
              <img src={movie.poster_path} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

// <SearchMovie />
// <SearchResults />
