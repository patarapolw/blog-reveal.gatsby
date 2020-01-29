import React from 'react'
import { graphql } from 'gatsby'

import PostQuery from '../components/PostQuery'

export const query = graphql`
  query IndexPagedQuery($skip: Int!) {
    allFile(
      sort: {fields: epoch, order: DESC},
      filter: {isPast: {eq: true}},
      limit: 5,
      skip: $skip
    ) {
      nodes {
        excerpt
        title
        tag
        headerImage
        slug
        epoch
      }
      totalCount
    }
  }
`

const Index = ({ data, pageContext }: any) => (
  <PostQuery defaults={data.allFile} currentPage={pageContext.currentPage} />
)

export default Index
