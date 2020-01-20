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
            avatar
            login
            link
          }
        }
      }
    }
  `}
    render={(data) => {
      const m = content.correctDateEpoch ? moment(content.correctDateEpoch) : null
      const dateString = m ? m.format('LL') : ''
      const { author } = data.site.siteMetadata

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          whiteSpace: 'nowrap',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            whiteSpace: 'nowrap',
            justifyContent: 'center'
          }}>
            <a href={author.link} style={{
              width: '24px',
              minWidth: '24px'
            }}>
              <img src={author.avatar} alt={author.login} style={{
                borderRadius: '50%'
              }} />
            </a>
            <a href={author.link}>{author.login}</a>
          </div>
          <div style={{
            flexGrow: 1
          }}></div>
          <div>{dateString}</div>
        </div>
      )
    }}
  />
)

export default PostHeader
