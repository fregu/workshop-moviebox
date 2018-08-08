// @flow

import React from 'react'
import { connect } from 'react-redux'
import { incrementCounter } from 'store/actions'
import './index.css'

type Props = {
  color?: string,
  children: any,
  counter: number,
  incrementCounter: Function
}
export const Test = ({
  children,
  color = 'red',
  counter = 0,
  incrementCounter
}: Props) => (
  <div className="Test" data-color={color} onClick={() => incrementCounter(5)}>
    {children} ({counter})
  </div>
)

export default connect(
  ({ counter }) => ({ counter }),
  dispatch => ({
    incrementCounter: step => dispatch(incrementCounter(step))
  })
)(Test)
