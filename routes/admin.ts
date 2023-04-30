import express from 'express'
import sceneMethod from '../db/scene'
import adminMethod from '../db/admin'
import tagMethod from '../db/tag'
import eventMethod from '../db/event'
import type { baseSceneT } from '../type/scene'
import type { CustomRequest } from '../type/req'
import type { adminLoginT } from '../type/admin'
import { tagT } from '../type/tag'
import { eventT } from '../type/event'
import { cache as viewCache } from './scene'

const {
  findOne,

  findAll,
  insertOne,
  deleteOne,
  updateOne,
  updateMany,
  insertMany,
  deleteMany,
} = sceneMethod

const router = express.Router()

// const DEFAULT_NAME = 'admin'
// // moonvrm00nVR
// const DEFAULT_PASSWORD = '7d7710f509dec7e3a5dd2d7c318769a4'

const NOT_CHECK_LIST = ['/login', '/logout', '/login-status']

router.use(async (req, res, next) => {
  if (NOT_CHECK_LIST.includes(req.path)) {
    next()
    return
  }
  if (!req.session?.adminInfo) {
    res.status(401)
    res.send('')
    return
  }
  next()
})

router.get('/', async (req, res) => {
  res.send({ list: [] })
})

router.post('/login', async (req: CustomRequest<adminLoginT>, res) => {
  const result = await adminMethod.findOne(req.body)
  if (result) {
    req.session.adminInfo = {
      user: req.body.username,
    }
    res.send({ username: req.body.username })
  } else {
    res.send({})
  }
})

router.post('/logout', async (req, res) => {
  if (req.session.adminInfo) {
    req.session.adminInfo = undefined
  }
  res.send({})
})

router.get('/login-status', async (req, res) => {
  res.send({ adminInfo: req.session.adminInfo })
})

router.get('/scene', async (req, res) => {
  const needShareData = !!req.query.needShareData
  const sceneList = (await findAll()).sort((a, b) => a.sortIndex - b.sortIndex)
  const shareData: { [k: string]: eventT[] } = {}
  if (needShareData) {
    const events = await eventMethod.findAll({ eventName: 'mvh_scene_share' })
    events.forEach((item) => {
      if (!item?.eventParams?.sceneId) {
        return null
      }
      const sceneId = item?.eventParams?.sceneId
      if (!shareData[sceneId]) {
        shareData[sceneId] = [item]
      } else {
        shareData[sceneId].push(item)
      }
    })
  }
  res.send({
    list: sceneList.map((item) => {
      const id = item.id
      return {
        ...item,
        lastweekViewCount: viewCache.lastweekCountMap[id] || 0,
        oldViewCount: viewCache.oldCountMap[id] || 0,
        allViewCount: viewCache.allCountMap[id] || 0,
        shareNumber: shareData[id]?.length,
      }
    }),
  })
})

router.get('/scene/:id', async (req, res) => {
  const sceneResult = await findOne(+req.params.id)
  res.send({
    ...sceneResult,
    lastweekViewCount: viewCache.lastweekCountMap[+req.params.id] || 0,
    oldViewCount: viewCache.oldCountMap[+req.params.id] || 0,
    allViewCount: viewCache.allCountMap[+req.params.id] || 0,
  })
})

router.post('/scene', async (req, res) => {
  const result = await insertOne(req.body)
  res.send(result)
})

router.delete('/scene/:id', async (req, res) => {
  const result = await deleteOne(+req.params.id)
  res.send(result)
})

router.put('/scene/:id', async (req: CustomRequest<baseSceneT>, res) => {
  const result = await updateOne(+req.params.id, req.body)
  res.send(result)
})

router.put(
  '/scene-batch',
  async (req: CustomRequest<{ list: baseSceneT[] }>, res) => {
    const result = await Promise.all(
      req.body.list.map(({ id, _id, ...other }) => updateOne(id, other))
    )
    res.send(result)
  }
)

router.post('/scene-refresh-batch', async (req, res) => {
  const nextVer = new Date().getTime().toString()
  updateMany({}, { version: nextVer })
  res.send({ version: nextVer })
})

router.post('/scene-batch', async (req: CustomRequest<baseSceneT[]>, res) => {
  const result = await insertMany(req.body)
  res.send(result)
})

router.delete('/scene-batch', async (req, res) => {
  const result = await deleteMany({})
  res.send(result)
})

router.post('/tag', async (req: CustomRequest<tagT>, res) => {
  const result = await tagMethod.insertOne(req.body)
  res.send(result)
})

router.delete('/tag/:id', async (req, res) => {
  const result = await tagMethod.deleteOne(+req.params.id)
  res.send(result)
})

router.get('/tag/:id', async (req, res) => {
  const result = await tagMethod.findOne(+req.params.id)
  res.send(result)
})

router.get('/tag', async (req, res) => {
  const result = await tagMethod.findAll()
  res.send(result)
})

router.put('/tag', async (req: CustomRequest<tagT>, res) => {
  const result = await tagMethod.updateOne(req.body.id, req.body)
  res.send(result)
})

export default router
