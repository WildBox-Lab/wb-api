export const dbName = 'wb'

export const dbUri = `mongodb://${
  process.env.MONGO_URI || '0.0.0.0:27017'
}/${dbName}`
