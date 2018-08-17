import React from 'react'
import { renderToString } from 'react-dom/server'
import App from 'App'

export default function render(req, res) {
  const appString = renderToString(<App />)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" value="inital-scale=1" />
        <link rel="stylesheet" href="/static/style.css" />
    </head>

    <body>
        <div id="app">${appString}</div>
        <script src="/static/main.js"></script>
    </body>
    </html>
  `)
}
