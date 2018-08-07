import React from 'react'
import { render, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import Test from './index.js'

afterEach(cleanup)
test('Test component shows content Hejhej', () => {
  const { getByText } = render(<Test>Hejhej</Test>)
  expect(getByText(/^Hejhej/))
})
