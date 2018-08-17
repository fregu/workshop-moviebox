// @flow
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import newMovies from 'queries/newMovies.gql'
import Test from 'components/Test'
import Icon from 'components/Icon'
import { Helmet } from 'react-helmet'
import './index.css'

type Props = {
  data: { newMovies: Array<any> }
}

@graphql(newMovies)
export default class Home extends Component<Props> {
  render() {
    const {
      data: { newMovies = [] }
    } = this.props
    return (
      <div className="View Home">
        <Helmet>
          <title>Home sweet home</title>
          <meta
            name="Description"
            content="Browse all movies and TV-shows there is in one place"
          />
        </Helmet>

        {/* {selected ? <Hero {...selected} /> : null}
        {categories.map(category => (
          <Carousel key={category.id}>
            {category.items(item => (
              <Link url={`/${item.type}/${item.id}`} discreet>
                <Poster
                  dimensions="2by3"
                  src={item.poster_path}
                  title={item.title}
                />
              </Link>
            ))}
          </Carousel>
        ))} */}

        <Test>Yayway</Test>
        <Icon />
        <div className={'NewMovies'}>
          {newMovies.map(movie => (
            <div key={movie.id}>
              <h3>{movie.title}</h3>
              <img src={movie.poster_path} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

// <SearchMovie />
// <SearchResults />
