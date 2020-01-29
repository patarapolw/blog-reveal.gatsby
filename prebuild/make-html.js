const showdown = require('showdown')
const pug = require('pug')
const scopeCss = require('scope-css')
const nanoid = require('nanoid')
const h = require('hyperscript')
const cheerio = require('cheerio')

class MakeHtml {
  /**
   *
   * @param {{ pug: any; markdown: any; }} plugins
   */
  constructor (plugins) {
    this.plugins = plugins

    this.id = `el${nanoid()}`
    this.md = new showdown.Converter()
    this.html = ''

    this.md.setFlavor('github')
    this.md.addExtension({
      type: 'lang',
      regex: /\n```pug parsed\n(.+)\n```\n/gs,
      replace: (_, p1) => {
        return this.pugConvert(p1)
      },
    }, 'pug')

    this.md.addExtension({
      type: 'lang',
      regex: /\n```css parsed\n(.+)\n```\n/gs,
      replace: (_, p1) => {
        return this.makeCss(p1)
      },
    }, 'css')

    Object.entries(this.plugins.markdown).map(([k, v]) => this.md.addExtension(v, k))
  }

  /**
   *
   * @param {string} s
   * @param {string} [ext]
   */
  parse (s, ext) {
    try {
      if (ext === 'pug') {
        this.html = this.pugConvert(s)
      } else {
        this.html = this.mdConvert(s)
      }
    } catch (e) {}

    const $ = cheerio.load(`<div>${this.html}</div>`)
    $('[data-content]').each((_, el) => {
      const $el = $(el)
      $el.html($el.attr('data-content'))
      $el.removeAttr('data-content')
    })

    return `<div id="${this.id}">${$.root().html()}</div>`
  }

  pugConvert (s) {
    return pug.render(s, {
      filters: {
        markdown: (s) => {
          return this.mdConvert(s)
        },
        ...this.plugins.pug,
      },
    })
  }

  mdConvert (s) {
    return this.md.makeHtml(s)
  }

  makeCss (s) {
    return h('style', {
      attrs: {
        'data-content': scopeCss(s, `#${this.id}`),
      },
    }).outerHTML
  }
}

module.exports = MakeHtml
