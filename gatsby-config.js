const path = require('path')

const yaml = require('js-yaml')

const siteMetadata = require('./src/prebuild')

module.exports = {
  pathPrefix: siteMetadata.pathPrefix || '',
  siteMetadata,
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-typescript',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        excerpt_separator: '<!-- excerpt_separator -->',
        engines: {
          yaml: {
            parse: (s) => yaml.safeLoad(s, {
              schema: yaml.JSON_SCHEMA
            })
          }
        },
        plugins: [
          'gatsby-remark-images',
          'gatsby-remark-lazy-load'
        ]
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.join(process.env.ROOT, 'data/posts'),
        name: 'posts'
      }
    }
    // {
    //   resolve: 'gatsby-source-filesystem',
    //   options: {
    //     path: path.join(process.env.ROOT, 'data/hidden'),
    //     name: 'hidden'
    //   }
    // }
  ]
}
