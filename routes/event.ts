import express from 'express'
import _ from 'lodash'
import eventMethod from '../db/event'
import type { CustomRequest } from '../type/req'
import { eventT } from '../type/event'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

router.post('/', async (req: CustomRequest<Omit<eventT, 'id'>>, res) => {
  const result = await eventMethod.insertOne({
    ...req.body,
    id: uuidv4(),
    createTime: new Date(),
  })
  res.send(result)
})

router.get('/', async (req, res) => {
  const result = await (await eventMethod.getCollection())
    .find({})
    .limit(20)
    .toArray()
  res.send(result)
})

export default router
