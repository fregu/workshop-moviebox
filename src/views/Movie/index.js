import React, { Component } from 'react'
import classNames from 'classnames'

export default class Movie extends Component {
  render() {
    const {
      className,
      match: {
        params: { id }
      }
    } = this.props
    return <div className={classNames('Movie', className)}>Movietime {id}</div>
  }
}
