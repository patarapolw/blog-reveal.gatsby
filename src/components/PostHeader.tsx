import React from 'react'
import moment from 'moment'
import { graphql, StaticQuery } from 'gatsby'

const PostHeader = ({ content }: any) => (
  <StaticQuery
    query={graphql`
    query PostHeaderQuery {
      site {
        siteMetadata {
          author {
            image
            name
            url
          }
        }
      }
    }
  `}
    render={(data) => {
      const m = content.epoch ? moment(content.epoch) : null
      const dateString = m ? m.format('LL') : ''
      const { author } = data.site.siteMetadata

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          whiteSpace: 'nowrap',
          overflow: 'auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            whiteSpace: 'nowrap',
            justifyContent: 'center',
          }}>
            <a href={author.url} style={{
              width: '24px',
              minWidth: '24px',
            }}>
              { author.image ? (
                <img src={author.image} alt={author.name} style={{
                  borderRadius: '50%',
                }} />
              ) : null }
            </a>
            <a href={author.url}>{author.name}</a>
          </div>
          <div style={{
            flexGrow: 1,
          }}></div>
          <div>{dateString}</div>
        </div>
      )
    }}
  />
)

export default PostHeader
