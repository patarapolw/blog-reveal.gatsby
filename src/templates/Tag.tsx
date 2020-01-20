import React from 'react'
import { graphql } from 'gatsby'

import PostQuery from '../components/PostQuery'

export const query = graphql`
  query TagPagedQuery($skip: Int!, $tag: String!) {
    allMarkdownRemark(
      sort: {fields: frontmatter___date, order: DESC},
      filter: {
        isPast: {eq: true},
        frontmatter: {tag: {in: [$tag]}}
      },
      limit: 5,
      skip: $skip
    ) {
      edges {
        node {
          excerpt(truncate: true, format: HTML)
          frontmatter {
            title
            tag
            image
          }
          fields {
            slug
          }
          correctedDateEpoch
          correctedSlug
        }
      }
      totalCount
    }
  }
`

const Index = ({ data, pageContext }: any) => (
  <PostQuery defaults={data.allMarkdownRemark} currentPage={pageContext.currentPage} tag={pageContext.tag} />
)

export default Index
