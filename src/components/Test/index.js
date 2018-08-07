// @flow

import React from 'react'
import './index.css'

type Props = {
  color?: string,
  children: any
}
export default ({ children, color = 'red' }: Props) => (
  <div className="Test" data-color={color}>
    {children}
  </div>
)
