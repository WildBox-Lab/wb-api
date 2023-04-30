import express from 'express'
import _ from 'lodash'
import sceneMethod from '../db/scene'
import previewMethod from '../db/preview'
import type { CustomRequest } from '../type/req'
import { v4 as uuidv4 } from 'uuid'
import { baseSceneT } from '../type/scene'

const { findOne, updateMany, getCollection } = sceneMethod

const router = express.Router()

type countMap = {
  [k: string]: number
}

export const cache: {
  oldCountMap: countMap
  lastweekCountMap: countMap
  allCountMap: countMap
} = {
  oldCountMap: {},
  lastweekCountMap: {},
  allCountMap: {},
}

const fetchOldData = async () => {
  const req = await fetch('https://slapi.moonvrhome.com/preview')
  const res: { preview_count_map: countMap } = await req.json()
  cache.oldCountMap = res.preview_count_map
  const collection = await getCollection()
  const fullMap = await collection.find({}).toArray()
  for (let i = 0; i < fullMap.length; i++) {
    await collection.updateOne(
      { id: fullMap[i].id },
      { $set: { oldViewCount: cache.oldCountMap[fullMap[i].id] || 0 } }
    )
  }
}

const genPreviewCount = async () => {
  const lastWeekTime = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
  const allRecord = await previewMethod.findAll()
  cache.lastweekCountMap = {}
  cache.allCountMap = {}
  allRecord.forEach((item) => {
    const time = new Date(Date.parse(item.createTime.toString())).getTime()
    if (!item.sceneId) {
      return
    }

    if (time > lastWeekTime) {
      cache.lastweekCountMap[item.sceneId] = cache.lastweekCountMap[
        item.sceneId
      ]
        ? cache.lastweekCountMap[item.sceneId] + 1
        : 1
    }
    cache.allCountMap[item.sceneId] = cache.allCountMap[item.sceneId]
      ? cache.allCountMap[item.sceneId] + 1
      : 1
  })
}

export const initSyncCountMap = () => {
  const fetch = async () => {
    try {
      await fetchOldData()
    } catch (e) {
      console.log(e)
    }
    try {
      await genPreviewCount()
    } catch (e) {
      console.log(e)
    }
  }
  fetch()
  setInterval(fetch, 1000000)
}

router.get('/', async (req, res) => {
  const collection = await getCollection()
  const queryResult = await collection
    .find({})
    .project({
      id: true,
      name: true,
      name_zh: true,
      name_ko: true,
      name_de: true,
      name_fr: true,
      name_ja: true,
      name_es: true,
      number: true,
      authorName: true,
      iconPath: true,
      sortIndex: true,
      version: true,
      pageViews: true,
    })
    .toArray()
  const list = queryResult
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((item) => _.omit(item, '_id'))
    .map((item) => {
      if (cache?.oldCountMap?.[item.id]) {
        item.pageViews += cache.oldCountMap?.[item.id]
        item.pageViews += cache.allCountMap?.[item.id]
      }
      item.lastWeekViews = cache.lastweekCountMap[item.id] || 0
      return item
    })
  res.send({ list })
})

router.post(
  '/scene-preview',
  async (req: CustomRequest<{ sceneId: number }>, res) => {
    const result = await previewMethod.insertOne({
      id: uuidv4(),
      sceneId: req.body.sceneId,
      createTime: new Date(),
    })
    res.send(result)
  }
)

router.get('/scene-preview', (req, res) =>
  res.send({
    ...cache,
  })
)

router.get('/:id', async (req, res, next) => {
  const sceneResult = await findOne(+req.params.id)
  if (!sceneResult) {
    res.send(null)
    return
  }
  const scene: Omit<baseSceneT, '_id'> & { lastWeekViews?: number } = _.omit(
    sceneResult,
    '_id'
  )
  if (cache?.oldCountMap?.[req.params.id]) {
    scene.pageViews += cache.oldCountMap[req.params.id]
    scene.pageViews += cache.allCountMap[req.params.id]
  }
  scene.lastWeekViews = cache.lastweekCountMap[req.params.id] || 0
  res.send(scene)
})

export default router
