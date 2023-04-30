import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import userMethod from '../db/user'
import type { CustomRequest } from '../type/req'
import { baseSignType, genderType, roleType } from '../type/user'
import { getPasswordMd5hash } from '../util/crypto'
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

const otherUserInfoPick = [
  'uuid',
  'username',
  'gender',
  'cover',
  'links',
  'bio',
  'birthday',
]

const baseSelfInfoPick = [
  ...otherUserInfoPick,
  'email',
  'phoneNumber',
  'role',
  'blockList',
]

router.post('/login', async (req: CustomRequest<userLoginT>, res) => {
  const hashedPassword = getPasswordMd5hash(req.body.password)
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

router.post('/signup', async (req: CustomRequest<baseSignType>, res) => {
  const result = await userMethod.findOne({
    email: req.body.email,
  })

  if (result) {
    res.status(500)
    res.send({ error: 1, message: 'email exist!' })
    return
  }
  const uuid = uuidv4()
  const user = {
    uuid,
    username: req.body.username,
    email: req.body.email,
    password: getPasswordMd5hash(req.body.password),
    bio: '',
    gender: genderType.hide,
    avatar: '',
    cover: '',
    phoneNumber: '',
    birthday: new Date(),
    role: roleType.unauth,
    blockList: [],
    tempAuthKey: uuidv4(),
  }
  await userMethod.insertOne(user)
  res.send(_.pick(user, ...baseSelfInfoPick))
})

router.get('/auth-email/:authId', async (req, res) => {
  const result = await userMethod.findOne({
    tempAuthKey: req.params.authId,
  })
  if (!result) {
    res.send('激活失败')
    return
  }
  result.role = roleType.normal
  result.tempAuthKey = ''
  await userMethod.updateOne(result.uuid, result)
  res.send('激活成功')
})

router.get('/info', async (req, res) => {
  console.log(req.headers.cookie)
  if (!req.session?.userinfo) {
    res.status(401)
    res.end()
    return
  }
  const result = await userMethod.findOne({
    uuid: req.session?.userinfo.uuid,
  })
  if (!result) {
    res.status(404)
    res.end()
    return
  }
  res.send(_.pick(result, ...baseSelfInfoPick))
})

router.get('/info/:uuid', async (req, res) => {
  if (!req.session?.userinfo) {
    res.status(401)
    res.end()
    return
  }
  const uuid = req.params.uuid

  const result = await userMethod.findOne({
    uuid,
  })
  if (!result) {
    res.status(404)
    res.end()
    return
  }
  res.send(_.pick(result, ...otherUserInfoPick))
})

export default router
