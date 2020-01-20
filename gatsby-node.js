const path = require('path')

const fs = require('fs-extra')
const rimraf = require('rimraf')
const { createFilePath } = require('gatsby-source-filesystem')
/**
 * I use `momentjs`, because `momentjs` is already included in Gatsby
 */
const moment = require('moment')

/**
 * By default, JavaScript timestamp is in milliseconds,
 *
 * but moment().unix() is in seconds
 */
const now = +new Date()

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'MarkdownRemark',
      interfaces: ['Node'],
      fields: {
        correctedDateEpoch: {
          type: 'Float',
          resolve: (s) => customDateStringToEpoch(s.frontmatter.date)
        },
        correctedSlug: {
          type: 'String!',
          resolve: (s) => s.fields.slug.replace(/^.*\/(.+?)\//, '$1')
        },
        isPast: {
          type: 'Boolean!',
          /**
           * `s.correctedDateEpoch` failed, no matter how I tried
           */
          resolve: (s) => {
            const epoch = customDateStringToEpoch(s.frontmatter.date)
            return epoch ? epoch < now : false
          }
        }
      }
    })
  ])
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC },
          filter: {isPast: {eq: true}}
        ) {
          nodes {
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
      }
    `)
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }

  const posts = result.data.allMarkdownRemark.nodes
  const postsPerPage = 5
  const numPages = Math.ceil(posts.length / postsPerPage)
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/' : `/${i + 1}`,
      component: path.resolve('./src/templates/Listing.tsx'),
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        currentPage: i + 1
      }
    })
  })

  const allTags = posts.map((p) => p.frontmatter.tag).filter((p) => p).reduce((a, b) => [...a, ...b])
  allTags.map((t) => {
    const taggedPosts = posts.filter((p) => p.frontmatter.tag && p.frontmatter.tag.includes(t))
    const numPages = Math.ceil(taggedPosts.length / postsPerPage)

    Array.from({ length: numPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? `/tag/${t}` : `/tag/${t}/${i + 1}`,
        component: path.resolve('./src/templates/Tag.tsx'),
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          currentPage: i + 1,
          tag: t
        }
      })
    })
  })

  posts.forEach((p) => {
    const m = p.correctedDateEpoch ? moment(p.correctedDateEpoch) : null
    const truePath = m
      ? `/posts/${m.format('YYYY')}/${m.format('MM')}/${p.correctedSlug}`
      : `/posts/${p.correctedSlug}`

    createPage({
      path: truePath,
      component: path.resolve('./src/templates/Post.tsx'),
      context: {
        slug: p.fields.slug
      }
    })
  })

  fs.writeFileSync(path.join(__dirname, 'public/search.json'), JSON.stringify(posts))
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === 'MarkdownRemark') {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: 'slug',
      node,
      value
    })
  }
}

exports.onPostBuild = () => {
  rimraf.sync(
    path.join(process.env.ROOT, 'dist')
  )
  fs.copySync(
    path.join(__dirname, 'public'),
    path.join(process.env.ROOT, 'dist')
  )
  fs.copySync(
    path.join(process.env.ROOT, 'media'),
    path.join(process.env.ROOT, 'dist/media')
  )
}

exports.onCreateDevServer = ({ app }) => {
  app.use('/media', require('express').static(path.join(process.env.ROOT, 'media')))
}

function customDateStringToEpoch (date) {
  if (!date) {
    return null
  }

  /**
   * Moment will default timezone to local if not specified, unlike Date.parse
   *
   * https://momentjs.com/docs/#/parsing/
   *
   * See #please-read
   */
  let m = moment(date, [
    'YYYY-MM-DD HH:MM ZZ',
    'YYYY-MM-DD ZZ',
    'YYYY-MM-DD HH:MM',
    'YYYY-MM-DD'
  ])

  if (m.isValid()) {
    /**
     * moment().unix() is in seconds
     */
    return m.unix() * 1000
  }

  m = moment(date)

  if (m.isValid()) {
    return m.unix() * 1000
  }

  return null
}
