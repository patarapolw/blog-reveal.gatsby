/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { graphql, Link } from 'gatsby'

import PostHeader from '../components/PostHeader'
import DefaultLayout from '../layouts/Default'

export const query = graphql`
  query PostFullQuery($slug: String!) {
    file(
      slug: {eq: $slug}
    ) {
      html
      excerpt
      title
      tag
      headerImage
      epoch
    }
  }
`

const Post = ({ data }: any) => {
  const content = data.file

  return (
    <DefaultLayout
      title={content.title}
      description={content.excerpt}
      image={content.headerImage}
      keywords={content.tag}
    >
      <div className="card">
        <div className="card-content content">
          <PostHeader content={content}/>
          <h1>{content.title}</h1>

          <div css={css`
            text-align: center;
            margin: 1rem;

            @media only screen and (max-width: 800px) {
              margin-left: -1.5rem;
              margin-right: -1.5rem;
            }
          `}>
            <img className="lazyload" data-src={content.headerImage} css={css`
              min-width: 500px;
              width: auto;

              @media only screen and (max-width: 800px) {
                min-width: unset;
              }
            `} />
          </div>

          <div dangerouslySetInnerHTML={{ __html: content.html }} />

          <div style={{
            wordBreak: 'break-word',
          }}>
            <span>Tags: </span>
            { content.tag ? (
              <span>
                { content.tag.map((t: string) => (
                  <Link key={t} to={`/tag/${t}`} style={{
                    marginRight: '0.5em',
                  }}>{t}</Link>
                )) }
              </span>
            ) : null }
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default Post
