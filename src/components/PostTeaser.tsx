/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Link } from 'gatsby'
import moment from 'moment'

import PostHeader from './PostHeader'
// eslint-disable-next-line no-unused-vars
import { INode } from './PostQuery'

const PostTeaser = ({ content }: { content: INode }) => (
  <div className="card" style={{
    margin: '10px',
  }}>
    <div className="card-content">
      <PostHeader content={content} />
      <div css={css`
        width: 100%;
        overflow: visible;

        @media only screen and (min-width: 800px) {
          overflow: auto;
        }
      `}>
        { content.headerImage ? (
          <div css={css`
            width: calc(100% + 3rem);
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: -1.5rem;
            margin-right: -1.5rem;

            @media only screen and (min-width: 800px) {
              width: 100%;
              max-width: 300px;
              max-height: 300px;
              float: right;
              margin: 1rem;
            }
          `}>
            <img data-src={content.headerImage} alt={content.title} className="lazyload" />
          </div>
        ) : null }
        <h2 className="title">{ content.title }</h2>
        <div className="content" dangerouslySetInnerHTML={{ __html: content.excerpt }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <Link className="button is-danger is-outlined" to={(() => {
          const m = content.epoch ? moment(content.epoch) : null
          return m
            ? `/posts/${m.format('YYYY')}/${m.format('MM')}/${content.slug}`
            : `/posts/${content.slug}`
        })()}>Read More</Link>
      </div>
    </div>
  </div>
)

export default PostTeaser
