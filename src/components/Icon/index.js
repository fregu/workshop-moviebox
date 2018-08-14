import React from 'react'
// import InlineSVG from 'inline-svg-react'
import classNames from 'classnames'
import bin from 'assets/icons/icon.svg'

export default function Icon() {
  return (
    <div className={classNames('Icon')}>
      <span dangerouslySetInnerHTML={{ __html: bin }} />
    </div>
  )
}
