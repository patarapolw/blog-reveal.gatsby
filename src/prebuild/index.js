const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const dotenv = require('dotenv')
dotenv.config()

let config = {}
if (fs.existsSync(path.join(process.env.ROOT, 'config.yaml'))) {
  config = yaml.safeLoad(
    fs.readFileSync(path.join(process.env.ROOT, 'config.yaml'), 'utf8'), yaml.JSON_SCHEMA)
} else {
  config = require(path.join(process.env.ROOT, 'config.json'))
}

module.exports = config
