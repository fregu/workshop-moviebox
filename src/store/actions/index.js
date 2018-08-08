export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'

export const incrementCounter = (step = 1) => {
  return { type: INCREMENT, step }
}
export const decrementCounter = (step = 1) => {
  return { type: DECREMENT, step }
}
