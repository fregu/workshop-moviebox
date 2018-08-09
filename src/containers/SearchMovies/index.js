import React, { Component } from 'react'
import classNames from 'classnames'

class SearchMovies extends Component {
  render() {
    const { className } = this.props
    return <div className={classNames('SearchMovies', className)} />
  }
}

export default connect(
  ({}) => ({}),
  dispatch => ({
    search: query => dispatch({ type: 'SEARCH_MOVIE', query })
  })
)(SearchMovies)
