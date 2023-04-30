import express from 'express'
import _ from 'lodash'
import sceneMethod from '../db/scene'
import fs from 'fs'

const { getCollection } = sceneMethod

const router = express.Router()

const url = 'https://moonvrhome.com'

const lang = ['zh', 'ko', 'de', 'fr', 'ja', 'es']

const otherUrl = [
  'https://moonvrhome.com',
  'https://moonvrhome.com/environments',
].concat(
  lang
    .map((key) => [
      `https://moonvrhome.com/${key}`,
      `https://moonvrhome.com/${key}/environments`,
    ])
    .flat()
)

router.get('/', async (req, res) => {
  const collection = await getCollection()
  const queryResult = await collection
    .find({})
    .project({
      id: true,
      name: true,
      number: true,
      authorName: true,
      iconPath: true,
      sortIndex: true,
      version: true,
    })
    .toArray()

  const list = queryResult
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((item) => _.omit(item, '_id', 'sortIndex'))
    .map((scene) => [
      `${url}/environment/${scene.id}/${scene?.name?.replaceAll(' ', '-')}`,
      ...lang.map(
        (key) =>
          `${url}/${key}/environment/${scene.id}/${scene?.name?.replaceAll(
            ' ',
            '-'
          )}`
      ),
    ])
    .flat()
    .concat(otherUrl)
    .join('\n')

  const fileName = '/tmp' + '/tempSitemap.txt'
  fs.writeFileSync(fileName, list, 'utf-8')
  res.sendFile(fileName)
})

export default router
