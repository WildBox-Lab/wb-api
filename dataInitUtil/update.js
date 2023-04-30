const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

// Database Name
const dbName = 'mvh'

// Connection URL
const url = `mongodb://127.0.0.1/${dbName}`
const client = new MongoClient(url)
const dataFile = path.resolve(__dirname, './updateData.json')

const fullSceneData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

async function main() {
  // Use connect method to connect to the server
  await client.connect()
  const db = await client.db(dbName)

  const collection = await db.collection('scene')

  for (let i = 0; i < fullSceneData.length; i++) {
    const { id, ...needUpdateData } = fullSceneData[i]

    let scene = await collection.findOne({ id })

    if (scene) {
      await collection.updateOne({ id }, { $set: needUpdateData })
    }
  }

  await client.close()
}

main()
