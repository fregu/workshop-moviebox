import React from 'react'
import ReactDOM from 'react-dom'
import Test from './components/Test'

const App = () => {
  return <Test>Hello React!</Test>
}

ReactDOM.render(<App />, document.getElementById('app'))
