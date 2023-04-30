export const dbName = 'mvh'

export const dbUri = `mongodb://${
  process.env.MONGO_URI || '0.0.0.0:27017'
}/${dbName}`
