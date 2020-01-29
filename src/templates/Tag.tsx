import React from 'react'
import { graphql } from 'gatsby'

import PostQuery from '../components/PostQuery'

export const query = graphql`
  query TagPagedQuery($skip: Int!, $tag: String!) {
    allFile(
      sort: {fields: epoch, order: DESC},
      filter: {
        isPast: {eq: true}
        tag: {in: [$tag]}
      },
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
  <PostQuery defaults={data.allFile} currentPage={pageContext.currentPage} tag={pageContext.tag} />
)

export default Index
