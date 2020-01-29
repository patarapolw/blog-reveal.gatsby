import React from 'react'
import { Link } from 'gatsby'

const Pagination = ({ current, totalPosts, baseUrl }: any) => {
  const totalPages = Math.ceil(totalPosts / 5)

  const prevCount = (current - 1)
  const nextCount = (totalPages - current)

  const formatTo = (p: number) => {
    const to = (p === 1 ? baseUrl : `${baseUrl}${p}`)
    const q = typeof location !== 'undefined' ? new URL(location.href).searchParams.get('q') : ''
    return q ? `/?q=${encodeURIComponent(q)}` : to
  }

  return (
    <nav className="pagination" role="navigation" aria-label="pagination" style={{
      margin: '10px',
    }}>
      { prevCount > 0 ? (
        <Link to={formatTo(current - 1)} className="pagination-previous">Previous</Link>
      ) : (
        <button disabled className="pagination-previous">Previous</button>
      ) }

      { nextCount > 0 ? (
        <Link to={formatTo(current + 1)} className="pagination-next">Next</Link>
      ) : (
        <button disabled className="pagination-next">Next</button>
      ) }

      <ul className="pagination-list">
        { prevCount >= 3 ? (
          <li>
            <Link to={formatTo(1)} className="pagination-previous" aria-label="Goto page 1">1</Link>
          </li>
        ) : null }

        { prevCount > 3 ? (
          <li>
            <a className="pagination-ellipsis">&hellip;</a>
          </li>
        ) : null }

        { prevCount >= 2 ? (
          <li>
            <Link to={formatTo(current - 2)} className="pagination-previous" aria-label={`Goto page ${current - 2}`}>
              {current - 2}
            </Link>
          </li>
        ) : null }

        { prevCount >= 1 ? (
          <li>
            <Link to={formatTo(current - 1)} className="pagination-previous" aria-label={`Goto page ${current - 1}`}>
              {current - 1}
            </Link>
          </li>
        ) : null }

        <li>
          <a className="pagination-link is-current" aria-label={`Page ${current}`} aria-current="page">{current}</a>
        </li>

        { nextCount >= 1 ? (
          <li>
            <Link to={formatTo(current + 1)} className="pagination-next" aria-label={`Goto page ${current + 1}`}>
              {current + 1}
            </Link>
          </li>
        ) : null }

        { nextCount >= 2 ? (
          <li>
            <Link to={formatTo(current + 2)} className="pagination-next" aria-label={`Goto page ${current + 2}`}>
              {current + 2}
            </Link>
          </li>
        ) : null }

        { nextCount > 3 ? (
          <li>
            <a className="pagination-ellipsis">&hellip;</a>
          </li>
        ) : null }

        { nextCount >= 3 ? (
          <li>
            <Link to={formatTo(totalPages)} className="pagination-next" aria-label={`Goto page ${totalPages}`}>
              {totalPages}</Link>
          </li>
        ) : null }
      </ul>
    </nav>
  )
}

export default Pagination
