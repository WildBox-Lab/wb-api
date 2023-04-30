import express from 'express'

const router = express.Router()

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.send('hello, API')
})

export default router
