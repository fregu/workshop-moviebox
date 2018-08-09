require('ignore-styles')

require('babel-register')({
  ignore: [/(node_modules)/],
  presets: ['env', 'react', 'flow']
})

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import webpackMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'
import path from 'path'
//import serverRender from './src/server'
import webpackConfig from './webpack.config.server'
import expressGraphQL from 'express-graphql'
import schema from './schema/schema' // our schema file

dotenv.config()

function serverRender(req, res, next) {}
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

// app.use('/*', serverRender)
const compiler = webpack({
  ...webpackConfig,
  mode: process.env.NODE_ENV || 'development'
})

app.use(
  webpackMiddleware(compiler, {
    serverSideRender: true
  })
)

const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
