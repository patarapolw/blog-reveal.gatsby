const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const config = require('./prebuild')

try {
  const repoUrl = execSync('git config --get remote.origin.url', {
    cwd: process.env.ROOT,
  }).toString().trim()

  const [_, repoAuthor, repoName] = /github\.com\/([^/]+)\/([^/]+)\.git$/.exec(config.repoUrl) || []

  Object.assign(config, {
    repo: {
      url: repoUrl,
      author: repoAuthor,
      name: repoName,
    },
  })
} catch (e) {}

module.exports = {
  siteMetadata: config,
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-typescript',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.resolve(process.env.ROOT, 'posts'),
        name: 'posts',
      },
    },
    ...(() => {
      const slides = path.resolve(process.env.ROOT, 'slides')
      if (fs.existsSync(slides)) {
        return [{
          resolve: 'gatsby-source-filesystem',
          options: {
            path: slides,
            name: 'slides',
          },
        }]
      }
      return []
    })(),
    ...(config.comment.disqus ? [
      {
        resolve: 'gatsby-plugin-disqus',
        options: {
          shortname: config.disqus,
        },
      },
    ] : []),
  ],
}
