// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

type Props = {
  className: string,
  match: any
}

export default class Movie extends Component<Props> {
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
