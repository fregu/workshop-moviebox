# Creating an App from scratch

In this series of courses we will step by step learn how to create a modern web application from scratch. The purpose of the app will be to browse and search movies and TV-shows using the tmdb (The Movie DataBase) API. The focus is not to build and app that will earn you a lot of money, but hopefully give you the understanding och each underlaying technology, which will make you a better developer, with the confidence and understanding of how to setup and build your next project from scratch.

This series is divided in several sessions focusing on the small parts, that all fit together in building an advanced web application.

### Course 1 - Webpack, Babel and React

Focuses on setting up the basic development environment and buildd process to get a development server up and running with you code. Basically a way for you to say Hello world in javascript.

### Course 2 - Editor, syntax and testing

This part focusing in creating the good habits in writing clean and understandable code, with the help of tools and tests that makes sure that the syntaxt is clean no unused variables and that you follow good standards in the way you write code. We look closer into how to setup and use Prettier, Eslint, Flow types and Jest tests to ensure working and easily read code.

### Course 3 - Redux state and REST API

We add Redux to the mix with reducers, actions and middlewares to connect our components to a single source of truth. We also look how we through redux connect to the tmdb REST API, to get some extarnal data to our app and setup some actual behaviour. And we look into how we setup the Redux developer tool, and how to use it.

### Course 4 - Routing, Views, Containers, Components

Now when we have the setup needed to get and search movies and TV-shows, we need to build the basic UI to present the data in a "beautiful" user interface.

### Course 5 - Server and GraphQL

After all our hard work connecting our app to the API, it is time to throw it all away (almost). And instead start looking at what all the cool kids are playing with. GraphQL is the way to concatinate multiple REST request on the server to serve the client with exacly the data it needs, no more, no less. We look in to creating a schema for data types and how to query and resolve the data we need. And then refactor our app to use our brand new graphql queries.

### Course 6 - Server side rendering

Who want to stare at a spinner when opening an app? Using the techniques of server side rendering, we can enhance our server to fetch all data needed for the inial render and render our app with all its data directly from the server. Speeding up the app even more.

### Course 7 - User experience

By using the knowledge and tools from earlier courses, we will now focus on implementing design using a set of pre build components.

### Course 8 - Optimization and deployment

Our app is ready for production, but will need some finishing touches. We look into how to configure webpack for production, adding a service worker and deploy the app onto an external hosting, using heroku cli and git remote.
