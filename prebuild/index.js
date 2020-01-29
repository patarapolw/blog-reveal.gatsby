const path = require('path')

const dotenv = require('dotenv')

const { loadYamlOrJson, deepMerge } = require('./utils')

dotenv.config()

process.env.ROOT = path.resolve(process.env.ROOT)

/**
 * @type {{
 *    makeHtml: {
 *      pug: any
 *      markdown: any
 *    }
 *    grayMatter: { excerptSeparator: string }
 *    comment: { disqus: string }
 *    repo?: { url: string; author: string; name: string }
 * }}
 */
const config = deepMerge(
  loadYamlOrJson(path.join(process.env.ROOT, 'config')),
  loadYamlOrJson(path.join(__dirname, 'default')),
)

module.exports = config
