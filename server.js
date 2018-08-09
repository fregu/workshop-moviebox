import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import webpackMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'
import path from 'path'
import webpackConfig from './webpack.config.js'
import expressGraphQL from 'express-graphql'
import schema from './schema/schema' // our schema file

dotenv.config()

const app = express()
app.get('env')
app.use(cors())

app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
)

const compiler = webpack(webpackConfig)
app.use(webpackMiddleware(compiler))
// Fallback when no previous route was matched
app.use('*', (req, res, next) => {
  const filename = path.resolve(compiler.outputPath, 'index.html')
  compiler.outputFileSystem.readFile(filename, (err, result) => {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.listen(5500, () => {
  console.log('Listening')
})
