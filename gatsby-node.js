const path = require('path')

const fs = require('fs-extra')
/**
 * I use `momentjs`, because `momentjs` is already included in Gatsby
 */
const moment = require('moment')
const matter = require('gray-matter')
const DataStore = require('nedb-promises')

const config = require('./prebuild')
const MakeHtml = require('./prebuild/make-html')

/**
 * By default, JavaScript timestamp is in milliseconds,
 *
 * but moment().unix() is in seconds
 */
const now = +new Date()

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'File',
      interfaces: ['Node'],
      fields: {
        html: {
          type: 'String',
          resolve: (s) => {
            if (s.sourceInstanceName === 'slides') {
              return matter(fs.readFileSync(s.absolutePath, 'utf8')).content.split(/\n===\n/g).map((ss) => {
                return ss.split(/\n--\n/g).map((s) => getHtmlFromString(s)).join('\n--\n')
              }).join('\n==\n')
            } else {
              return getHtmlFromPath(s.absolutePath, s.extension)
            }
          },
        },
        excerpt: {
          type: 'String',
          resolve: (s) => {
            if (s.sourceInstanceName === 'posts') {
              const html = (getHtmlFromPath(s.absolutePath, s.extension) || '')
                .split(config.grayMatter.excerptSeparator)[0].trim()
              const excerpt = html
                .substr(0, 500)
                .replace(/<[^>]*?$/, '').trim()

              return excerpt + (html === excerpt ? '' : '...')
            }
            return null
          },
        },
        epoch: {
          type: 'Float',
          resolve: (s) => {
            const { data } = matter(fs.readFileSync(s.absolutePath, 'utf8'))
            return customDateStringToEpoch(data.date)
          },
        },
        title: {
          type: 'String',
          resolve: (s) => {
            const { data } = matter(fs.readFileSync(s.absolutePath, 'utf8'))
            return data.title
          },
        },
        headerImage: {
          type: 'String',
          resolve: (s) => {
            if (s.sourceInstanceName === 'posts') {
              const { data } = matter(fs.readFileSync(s.absolutePath, 'utf8'))
              return data.image
            }
          },
        },
        tag: {
          type: '[String!]',
          resolve: (s) => {
            const { data } = matter(fs.readFileSync(s.absolutePath, 'utf8'))
            return data.tag
          },
        },
        slug: {
          type: 'String!',
          resolve: (s) => {
            const segs = s.absolutePath.split('/')
            return segs[segs.length - 1].split('.')[0]
          },
        },
        isPast: {
          type: 'Boolean!',
          /**
           * `s.correctedDateEpoch` failed, no matter how I tried
           */
          resolve: (s) => {
            const { data } = matter(fs.readFileSync(s.absolutePath, 'utf8'))
            const epoch = customDateStringToEpoch(data.date)
            return epoch ? epoch < now : false
          },
        },
      },
    }),
  ])
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const result = await graphql(`
    {
      allFile (
        filter: {extension: {in: ["md", "pug"]}}
        sort: {fields: epoch, order: DESC}
      ) {
        nodes {
          absolutePath
          isPast

          sourceInstanceName
          excerpt
          html
          slug
          epoch
          title
          tag
          headerImage     
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }

  const posts = result.data.allFile.nodes
  const postsPerPage = 5
  const numPages = Math.ceil(posts.length / postsPerPage)
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/' : `/${i + 1}`,
      component: path.resolve('./src/templates/Listing.tsx'),
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        currentPage: i + 1,
      },
    })
  })

  const allTags = posts.map((p) => p.tag).filter((p) => p).reduce((a, b) => [...a, ...b])
  allTags.map((t) => {
    const taggedPosts = posts.filter((p) => p.tag && p.tag.includes(t))
    const numPages = Math.ceil(taggedPosts.length / postsPerPage)

    Array.from({ length: numPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? `/tag/${t}` : `/tag/${t}/${i + 1}`,
        component: path.resolve('./src/templates/Tag.tsx'),
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          currentPage: i + 1,
          tag: t,
        },
      })
    })
  })

  posts.forEach((p) => {
    const m = p.epoch ? moment(p.epoch) : null
    const truePath = m
      ? `/posts/${m.format('YYYY')}/${m.format('MM')}/${p.slug}`
      : `/posts/${p.slug}`

    createPage({
      path: truePath,
      component: path.resolve('./src/templates/Post.tsx'),
      context: {
        slug: p.slug,
      },
    })
  })

  if (fs.existsSync(path.join(__dirname, 'api/search.json'))) {
    fs.unlinkSync(path.join(__dirname, 'api/search.json'))
  }

  const db = new DataStore(path.join(__dirname, 'api/search.json'))
  await Promise.all([
    db.ensureIndex({ fieldName: 'excerpt' }),
    db.ensureIndex({ fieldName: 'title' }),
    db.ensureIndex({ fieldName: 'slug' }),
  ])

  await Promise.all(posts.map(async (p) => {
    try {
      const { absolutePath: _, isPast: __, ...el } = p
      await db.insert({
        ...el,
        date: new Date(el.epoch),
      })
    } catch (e) {
      console.error(e)
    }
  }))
}

exports.onPostBuild = () => {
  if (fs.existsSync(path.join(process.env.ROOT, 'media'))) {
    fs.copySync(
      path.join(process.env.ROOT, 'media'),
      path.join(__dirname, 'public/media'),
    )
  }
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
    'YYYY-MM-DD',
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

/**
 *
 * @param {string} p absolute path
 * @param {string} ext extension
 */
function getHtmlFromPath (p, ext) {
  if (['md', 'pug'].includes(ext)) {
    const { content } = matter(fs.readFileSync(p, 'utf8'))
    return getHtmlFromString(content, ext)
  }
  return null
}

/**
 *
 * @param {string} s string
 * @param {string} [ext] extension
 */
function getHtmlFromString (s, ext) {
  const makeHtml = new MakeHtml(config.makeHtml)
  return makeHtml.parse(s, ext || 'md')
}
