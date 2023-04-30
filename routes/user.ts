import express from 'express'
import _ from 'lodash'
import userMethod from '../db/user'
import type { CustomRequest } from '../type/req'
const router = express.Router()

router.use(async (req, res, next) => {
  if (req.session?.userinfo) {
    req.session?.userinfo
  }
  next()
})

router.get('/', async (req, res) => {
  res.send({ list: [] })
})

export type userLoginT = {
  email: string
  password: string
}

const baseSelfInfoPick = [
  'uuid',
  'email',
  'username',
  'gender',
  'cover',
  'phoneNumber',
  'links',
  'birthday',
  'role',
  'blockList',
]

const otherUserInfoPick = ['uuid', 'username', 'gender', 'cover', 'links']

router.post('/login', async (req: CustomRequest<userLoginT>, res) => {
  const hashedPassword = `wildbox-${req.body.password}`
  const result = await userMethod.findOne({
    password: hashedPassword,
    email: req.body.email,
  })
  if (!result) {
    res.status(502)
    res.end()
    return
  }
  req.session.userinfo = {
    uuid: result.uuid,
  }
  res.send(_.pick(result, ...baseSelfInfoPick))
})

router.get('/:uuid', async (req, res) => {
  if (!req.session?.userinfo) {
    res.status(401)
    res.end()
    return
  }
  const uuid = req.params.uuid || req.session?.userinfo.uuid
  const isSelf = !req.params.uuid
  const result = await userMethod.findOne({
    uuid,
  })
  if (!result) {
    res.status(404)
    res.end()
    return
  }
  res.send(_.pick(result, ...(isSelf ? baseSelfInfoPick : otherUserInfoPick)))
})
