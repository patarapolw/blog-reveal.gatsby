import path from 'path'

import { NowRequest, NowResponse } from '@now/node'
import DataStore from 'nedb-promises'
import yaml from 'js-yaml'

const db = new DataStore(path.join(__dirname, 'search.json'))

export default async (req: NowRequest, res: NowResponse) => {
  const { q, offset, limit } = req.body

  let cond: any = null
  if (typeof q === 'string') {
    if (/\{.*\}/.test(q)) {
      try {
        cond = yaml.safeLoad(q, { schema: yaml.JSON_SCHEMA })
      } catch (e) {}
    }

    if (!cond) {
      const anyOf = ['title', 'excerpt', 'slug', 'tag']
      const anyOfValueRegex = new RegExp(`(${q
        .split(' ')
        .map((el) => el.trim())
        .filter((el) => el)
        .map((el) => escapeRegExp(el))
        .join('|')})`, 'i')
      cond = {
        $or: anyOf.map((a) => ({ [a]: { $regex: anyOfValueRegex } })),
      }
    }
  } else {
    cond = q
  }

  let c = db.find(cond).sort({ epoch: -1 })

  if (offset) {
    c = c.skip(offset)
  }

  if (limit !== null) {
    c = c.limit(limit || 5)
  }

  res.json({
    data: await c,
    count: await db.count(cond),
  })
}

function escapeRegExp (s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
