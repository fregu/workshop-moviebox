## Deploying your app

Now we have finally got to the last part of this tutorial, where we actually will take you app online so you can share it with everyone in the world of internet.

package.json

```json
"engines": {
  "node": "^8.11.0",
  "yarn": "^1.1.0"
},
"scripts": {
  "build": "webpack --config webpack.prod.js",
  "build:ssr": "webpack --config webpack.ssr.js",
  "postinstall": "yarn build && yarn build:ssr",
  "server": "babel-node server"
}
```

Procfile

```
web: yarn server
```

## Heroku
Heroku is a cloud based Platform as a Service (PaaS), that makes deploying and hosting your application really easy, using it's awesome integrations and powerful CLI

Create heroku account https://heroku.com

```bash
yarn global add heroku

heroku login

# Generate a new app
heroku create <myAppName>

# Set heroku environment variables
heroku config:set HOST=<myAppName>.herokuapp.com TMDB_API_KEY=<your api key>

# Build your app to heroku
git push heroku master

# Checking the app status
heroku ps:scale web=1

# Checking the logs
heroku logs --tail

# Open app in browser
heroku open
```

## Continous integration
Continous intergration means that we activate automatic deploys every time code is pushed to GitHub. It is a powerful idea and makes it easy to build fast and deploy fast. But it does require a lot of confidence in your code. That is why it is extra important to takt the time to write good unit tests for all functionality.

- Create a Git-hub repository for your app

- Log into https://dashboard.heroku.com/

- Open app > Deploy

- Pick Github

- Connect to GitHub by searching for your repository and connect

- Enable automatic deploys from GitHub

- Done (every push to master on Github will also automatically deploy on Heroku).

To be safer, we can also activate Heroku CI, to run all tests before deploying, as a fail safe, assuming you have a well written test suite for your application.


## Integration testing using Cypress

Cypress is new and very sensible way of making sure your application works as expected. It is focusing on intergration tests, instead of unit tests, and is testing how the application works as a whole. The way you write test cases are really intuitive and as soon as you save, the tests run and shows you exacly what happens. You dont even have to bother with delays and timeouts, Cypress waits for pages to load and content to render.

The tests can be written by anyone using the familiar syntax of Mocha and Chai Assertions. And can run against your local machine as easy as against the deployed application.

https://www.cypress.io/

`yarn add cypress`

```json
"scripts": {
  "cypress": "cypress open"
}
```

Open cypress and look at examples
`yarn cypress`

cypress/integration/search_movie.js

```js
/* global cy */
describe('Our app is live and finds movies based on query', () => {
  it('Opens the app', () => {
    cy.visit('https://moviebox-2.herokuapp.com')
  })

  it('Contains images', () => {
    cy.get('img')
  })

  it('Searched for results', () => {
    cy.get('input[type=search]').type('Aveng').should('have.value', 'Aveng')
    cy.get('.MovieCard figcaption').first().contains(/aveng/i)
  })
})
```

Switch to the Cypress app and run our new test cases.

cypress/integration/open_movie.js

```js
/* global cy */
describe('Clicking a movie or show should open a single page', () => {
  it('Opens the app', () => {
    cy.visit('https://moviebox-2.herokuapp.com')
  })
  it('Clicks a result', () => {
    cy.get('.MovieCard .Link').first().click()
  })

  it('Loads the movie page', () => {
    cy.url().should('include', /movie/)
  })

  it('Should have link back to start', () => {
    cy.contains('Tillbaka').click()
  })

  it('Start page should load again', () => {
    cy.url().should('equal', 'https://moviebox-2.herokuapp.com')
  })
})

And voila, it "hopefully" worked.
```

## Final words

I hope you have enjoyed this tutorial in creating a web app from scratch to production and that you have learned a thing or two.

A lot of the topics we have gone through are really complicated and usually you need to spend hours in documentation to find answers to you problems. By creating this tutorial I have learned alot and even though I have been using these technologies before, I usually (like most of us) gets thrown in into some sort of setup or boilerplate that takes care of the heavy lifting for us.

My hope is that by going through these technologies step by step, this tutorial can be of value in your real projects when you want to understand how a certain part can be implemented.

We have only been scratching the surface of how to configure and work with technologies like, webpack, babel, jest, eslint, redux, apollo, koa, css, storybook, lighthouse and progressive web apps. And once you have taken alittle break, maybe you feel like digging a bit deeper in certain areas.

Feel free to enhance and evolve this app, with further functionality and design.

I will try to evolve this tutorial into a set of blog posts which hopefully is a bit easier to follow along in by your self.

Good job getting this far!

Fredrik
