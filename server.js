import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import expressGraphQL from 'express-graphql'
import schema from './schema/schema'
import ssr from './ssr'

dotenv.config()

const app = express()

app.use('/static', express.static('dist'))
app.use('/favicon.ico', (req, res, next) => {})

app.use(cors())
app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
)
app.use('/*', ssr)

const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
