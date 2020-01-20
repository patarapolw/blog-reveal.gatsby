import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { graphql, Link, StaticQuery } from 'gatsby'
import { navigate, globalHistory } from '@reach/router'

const DefaultLayout = ({
  children,
  title, description, image, keywords
}: any) => (
  <StaticQuery
    query={graphql`
    query DefaultLayout {
      allTags: allMarkdownRemark(
        filter: {isPast: {eq: true}}
      ) {
        nodes {
          frontmatter {
            tag
          }
        }
      }
      site {
        siteMetadata {
          title
          banner
          tabs {
            name
            to
            url
          }
          social {
            twitter
          }
          fullUrl
        }
      }
    }
  `}
    render={(data) => {
      const { siteMetadata } = data.site
      const { twitter } = siteMetadata.social
      const trueTitle = (title ? `${title} - ` : '') + siteMetadata.title

      const [q, setQ] = useState(() => {
        return typeof location !== 'undefined' ? new URL(location.href).searchParams.get('q') || '' : ''
      })

      const [isActive, setIsActive] = useState(false)

      return (
        <section>
          <Helmet>
            <meta charSet="utf8"/>
            <link rel="icon" href={`${globalHistory.location.origin}/media/favicon.ico`} />
            <link rel="canonical" href={ siteMetadata.fullUrl } />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{ trueTitle }</title>
            <meta property="og:title" content={ trueTitle } />
            <meta property="twitter:title" content={ trueTitle } />

            <meta name="description" content={ description } />
            <meta property="og:description" content={ description } />
            <meta property="twitter:description" content={ description } />

            <meta property="og:image" content={ image } />
            <meta property="twitter:image" content={ image } />
            <meta property="twitter:card" content="summary_large_image" />

            { keywords ? (
              <meta name="keywords" content={ keywords.join(',') } />
            ) : null }
          </Helmet>
          <nav className="navbar is-primary is-fixed-top-desktop" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
              <Link className="navbar-item" to="/">
                <h1>{ siteMetadata.banner }</h1>
              </Link>

              <a role="button" className={`navbar-burger burger${isActive ? ' is-active' : ''}`}
                aria-label="menu" aria-expanded="false" onClick={() => setIsActive(!isActive)}>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </a>
            </div>

            <div className={`navbar-menu${isActive ? ' is-active' : ''}`}>
              <div className="navbar-start">
                { siteMetadata.tabs.map((t: any) => {
                  return t.to ? (
                    <Link className="navbar-item" to={t.to} key={t.name}>{t.name}</Link>
                  ) : (
                    <a className="navbar-item" href={t.url} key={t.name}>{t.name}</a>
                  )
                }) }
              </div>

              <div className="navbar-end">
                <form className="field" onSubmit={(evt) => {
                  evt.preventDefault()
                  navigate(`/?q=${encodeURIComponent(q)}`)
                }} style={{
                  margin: '5px',
                  marginRight: '2em'
                }}>
                  <div className="control">
                    <input className="input is-rounded" placeholder="Search"
                      value={q} onChange={(evt) => setQ(evt.target.value)} />
                  </div>
                </form>
              </div>
            </div>
          </nav>

          <section className="container" style={{
            marginTop: '60px'
          }}>
            <div className="columns">
              <main className="column is-8">
                { children }
              </main>
              <aside className="column">
                <div className="card" style={{
                  margin: '10px'
                }}>
                  <header className="card-header">
                    <h3 className="card-header-title">
                      Tag Cloud
                    </h3>
                  </header>
                  <div className="card-content" style={{
                    whiteSpace: 'pre-wrap'
                  }}>
                    { (() => {
                      const tagCountDict: Record<string, number> = {}
                      const cSize = 0.6

                      data.allTags.nodes.forEach((n: any) => {
                        const { tag } = n.frontmatter
                        if (tag) {
                          tag.forEach((t: string) => {
                            tagCountDict[t] = tagCountDict[t] || 0
                            tagCountDict[t]++
                          })
                        }
                      })

                      return Object.keys(tagCountDict).sort((a, b) => {
                        return tagCountDict[b] - tagCountDict[a]
                      }).slice(0, 30).map((t) => {
                        if (t === 'pinned') {
                          return null
                        }
                        return (
                          <span key={t}>
                            <Link style={{
                              display: 'inline-block',
                              marginRight: '10px',
                              wordBreak: 'keep-all',
                              fontSize: (() => {
                                const count = tagCountDict[t]
                                if (count > 20) {
                                  return `${10 * cSize}em`
                                } else if (count > 10) {
                                  return `${5 * cSize}em`
                                } else if (count > 5) {
                                  return `${3 * cSize}em`
                                } else if (count > 3) {
                                  return `${2 * cSize}em`
                                } else if (count > 1) {
                                  return `${1.5 * cSize}em`
                                }
                                return `${cSize}em`
                              })()
                            }} to={`/tag/${t}`}>
                              {t}
                            </Link>
                          </span>
                        )
                      })
                    })() }
                  </div>
                </div>

                <div className="card" style={{
                  margin: '10px'
                }}>
                  <a className="twitter-timeline" data-height="800" href={`https://twitter.com/${twitter}`}>
                    Tweets by { twitter }
                  </a>
                </div>
              </aside>
            </div>
          </section>
        </section>
      )
    }}
  />
)

export default DefaultLayout
