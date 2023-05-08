import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { createCode, codeMap } from '../util/captcha'

const router = express.Router()

router.get('/gen', async (req, res) => {
  if (!req.session?.captchaToken) {
    req.session.captchaToken = uuidv4()
  }

  const captchaToken = req.session.captchaToken
  const code = createCode()
  codeMap[captchaToken] = code
  res.send(codeMap[captchaToken].data)
})

export default router
