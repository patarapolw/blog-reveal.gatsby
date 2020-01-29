const fs = require('fs')

const yaml = require('js-yaml')

/**
 *
 * @param {string} p path to load
 * @returns {any}
 */
function loadYamlOrJson (p) {
  if (fs.existsSync(`${p}.yaml`)) {
    return yaml.safeLoad(fs.readFileSync(`${p}.yaml`, 'utf8'), { schema: yaml.JSON_SCHEMA })
  } else if (fs.existsSync(`${p}.yml`)) {
    return yaml.safeLoad(fs.readFileSync(`${p}.yml`, 'utf8'), { schema: yaml.JSON_SCHEMA })
  } else if (fs.existsSync(`${p}.json`)) {
    return JSON.parse(fs.readFileSync(`${p}.json`, 'utf8'))
  }

  return {}
}

function deepMerge (dst, src) {
  for (const [k, v] of Object.entries(src)) {
    if (dst[k]) {
      if (Array.isArray(dst[k])) {
        dst[k] = [
          ...dst[k],
          ...(Array.isArray(v) ? v : [v]),
        ]
      } else if (typeof dst[k] === 'object') {
        deepMerge(dst[k], v)
      } else {
        dst[k] = v
      }
    } else {
      dst[k] = v
    }
  }

  return dst
}

module.exports = {
  loadYamlOrJson,
  deepMerge,
}
