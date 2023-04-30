import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

// Database Name
const dbName = 'wb'

// Connection URL
const url = `mongodb://${process.env.MONGO_URI ?? '127.0.0.1:27017'}/${dbName}`
const client = new MongoClient(url)
const dataFile = path.resolve(__dirname, './full.json')

const fullSceneData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
const adminData = [
  { id: 0, username: 'admin', password: '7d7710f509dec7e3a5dd2d7c318769a4' },
]

export const TAG_LIST = [
  { id: 0, bg: '#ffdee4', color: '#ff90a8', label: 'All' },
  { id: 1, bg: '#ffe0d6', color: '#ff9660', label: 'Game' },
  { id: 2, bg: '#ffe2b6', color: '#ddaa00', label: 'Sci-Fi' },
  { id: 3, bg: '#e5f000', color: '#b1b900', label: 'Cartoon' },
  { id: 4, bg: '#98ff68', color: '#60c900', label: 'Interior' },
  { id: 5, bg: '#74ffc3', color: '#00ca8c', label: 'Urban' },
  { id: 6, bg: '#4bffee', color: '#00c6b8', label: 'Nature' },
  { id: 7, bg: '#aff1ff', color: '#00c3d9', label: 'Sky' },
  { id: 8, bg: '#d4e8ff', color: '#52baff', label: '3D' },
  { id: 9, bg: '#e6e3ff', color: '#b2a6ff', label: 'TV' },
  { id: 10, bg: '#f9ddff', color: '#ed8cff', label: 'Anime' },
  {
    id: 11,
    bg: '#fbe546',
    color: '#897d24',
    label: 'Customizable',
    label_zh: '可编辑',
  },
]

async function main() {
  // Use connect method to connect to the server
  await client.connect()
  console.log('Connected successfully to server')
  const db = await client.db(dbName)

  const initCollection = async (collectionName: string, initData: any[]) => {
    const collection = await db.collection(collectionName)
    await collection.deleteMany({})
    const res = await collection.insertMany(initData)
    console.log(`collection ${collection}:`)
    console.log(res)
  }

  // await initCollection('scene', fullSceneData)
  // await initCollection('admin', adminData)
  await initCollection('tag', TAG_LIST)

  client.close()
}

main()
