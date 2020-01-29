import React from 'react'
import dotProp from 'dot-prop'

import DefaultLayout from '../layouts/Default'
import Empty from './Empty'
import PostTeaser from './PostTeaser'
import Pagination from './Pagination'

export interface INode {
  excerpt: string
  title: string
  tag?: string[]
  headerImage?: string
  slug: string
  epoch: number
}

class PostQuery extends React.Component<{
  defaults: {
    nodes: INode[],
    totalCount: number
  }
  currentPage: number
  tag?: string
}, {
  posts: INode[] | null
  count: number
}> {
  q = ''

  constructor (props: any) {
    super(props)

    this.q = (typeof location !== 'undefined' ? new URL(location.href).searchParams.get('q') : '') || ''
    if (!this.q) {
      this.state = {
        posts: this.props.defaults.nodes,
        count: this.props.defaults.totalCount,
      }
    } else {
      this.state = {
        posts: [],
        count: 0,
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
              fontWeight: 'bold',
            }}>{tag}</span>
          </h2>
        ) : null }
        { this.state.posts ? (
          <>
            {this.state.posts.map((p) => (
              <PostTeaser content={p} key={p.slug} />
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
      if (typeof fetch !== 'undefined') {
        const r = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: this.q,
            offset: (this.getCurrentPage() - 1) * 5,
            limit: 5,
          }),
        }).then((r) => r.json())

        this.setState({
          posts: r.data.length > 0 ? r.data : null,
          count: r.count,
        })
      }
    } else {
      this.setState({
        posts: this.props.defaults.nodes,
        count: this.props.defaults.totalCount,
      })
    }
  }
}

export default PostQuery
