import React from 'react'
import { globalHistory } from '@reach/router'
import { Search } from 'js-search'
import dotProp from 'dot-prop'

import DefaultLayout from '../layouts/Default'
import Empty from './Empty'
import PostTeaser from './PostTeaser'
import Pagination from './Pagination'

export interface IEdge {
  node: {
    excerpt: string
    frontmatter: {
      title: string
      tag?: string[]
      image?: string
    }
    fields: {
      slug: string
    }
    correctedDateEpoch: number
    correctedSlug: string
  }
}

class PostQuery extends React.Component<{
  defaults: {
    edges: IEdge[],
    totalCount: number
  }
  currentPage: number
  tag?: string
}, {
  posts: IEdge[] | null
  count: number
}> {
  allDocs: any[] | null = null
  jsSearch = new Search(['fields', 'slug'])
  q = ''

  constructor (props: any) {
    super(props)
    this.jsSearch.addIndex(['frontmatter', 'title'])
    this.jsSearch.addIndex(['frontmatter', 'tag'])

    this.q = (typeof location !== 'undefined' ? new URL(location.href).searchParams.get('q') : '') || ''
    if (!this.q) {
      this.state = {
        posts: this.props.defaults.edges,
        count: this.props.defaults.totalCount
      }
    } else {
      this.state = {
        posts: [],
        count: 0
      }
      this.loadQ()
    }
  }

  render () {
    const { tag } = this.props

    return (
      <DefaultLayout title={tag ? `Tag: ${tag}` : ''}>
        { tag ? (
          <h2 className="title is-2">
            <span>Tag: </span>
            <span style={{
              fontWeight: 'bold'
            }}>{tag}</span>
          </h2>
        ) : null }
        { this.state.posts ? (
          <>
            {this.state.posts.map((p) => (
              <PostTeaser content={p} key={p.node.fields.slug} />
            ))}
            <Pagination current={this.getCurrentPage()} totalPosts={this.state.count}
              baseUrl={this.props.tag ? `/tag/${this.props.tag}/` : '/'} />
          </>
        ) : <Empty /> }
      </DefaultLayout>
    )
  }

  componentDidUpdate () {
    const newQ = (typeof location !== 'undefined' ? new URL(location.href).searchParams.get('q') : '') || ''
    if (newQ !== this.q) {
      this.q = newQ
      this.loadQ()
    }
  }

  getCurrentPage () {
    return dotProp.get<number>(this.props, 'pageContext.currentPage') || 1
  }

  async loadQ () {
    if (this.q) {
      if (!this.allDocs && typeof fetch !== 'undefined') {
        this.allDocs = await fetch(`${globalHistory.location.origin}/search.json`).then((r) => r.json())
        this.jsSearch.addDocuments(this.allDocs as any[])
      }

      const r = this.jsSearch.search(this.q) as IEdge[]
      const currentPage = this.getCurrentPage()
      const posts = r.slice((currentPage - 1) * 5, currentPage * 5)

      this.setState({
        posts: posts.length > 0 ? posts : null,
        count: r.length
      })
    } else {
      this.setState({
        posts: this.props.defaults.edges,
        count: this.props.defaults.totalCount
      })
    }
  }
}

export default PostQuery
