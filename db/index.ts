import {
  MongoClient,
  Document,
  OptionalUnlessRequiredId,
  Filter,
  UpdateFilter,
  FindOptions,
} from 'mongodb'
import { dbUri, dbName } from '../config'

export const client = new MongoClient(dbUri)
export const connect = client.connect()

export const getCollectionGen =
  <T extends Document = Document>(collectionName: string) =>
  async () => {
    const db = await client.db(dbName)
    const collection = await db.collection<T>(collectionName)
    return collection
  }

interface baseDataWithIdT extends Document {
  id: number | string
}

export const genMethod = <T extends baseDataWithIdT = baseDataWithIdT>(
  collectionName: string
) => {
  const getCollection = getCollectionGen<T>(collectionName)

  const findOne = async (param: number | Partial<T>) => {
    const collection = await getCollection()
    const query = typeof param === 'number' ? { id: param } : param
    const res = await collection.findOne(query as Filter<T>)
    if (!res) {
      return res
    }
    const { _id, ...result } = res
    return result
  }

  const findAll = async (
    query?: Partial<T>,
    option?: FindOptions<Document>
  ) => {
    const collection = await getCollection()
    const res = await collection.find(query || {}, option).toArray()
    const result = res.map((item) => {
      const { _id, ...other } = item
      return other
    })
    return result
  }

  const insertOne = async (item: OptionalUnlessRequiredId<T>) => {
    const collection = await getCollection()
    const res = await collection.insertOne(item)
    return res
  }

  const insertMany = async (list: OptionalUnlessRequiredId<T>[]) => {
    const collection = await getCollection()
    const res = await collection.insertMany(list)
    return res
  }

  const deleteOne = async (id: number) => {
    const collection = await getCollection()
    const res = await collection.deleteOne({ id } as Filter<T>)
    return res
  }

  const deleteMany = async (query: Partial<T>) => {
    const collection = await getCollection()
    const res = await collection.deleteOne(query)
    return res
  }

  const updateOne = async (id: number, sceneInfo: Partial<T>) => {
    const collection = await getCollection()
    const res = await collection.updateOne(
      { id } as Filter<T>,
      { $set: sceneInfo } as UpdateFilter<T>
    )
    return res
  }

  const updateMany = async (query: Partial<T>, updateInfo: Partial<T>) => {
    const collection = await getCollection()
    const res = await collection.updateMany(query, {
      $set: updateInfo,
    } as UpdateFilter<T>)
    return res
  }

  return {
    getCollection,
    findOne,
    findAll,
    insertOne,
    insertMany,
    deleteOne,
    deleteMany,
    updateOne,
    updateMany,
  }
}
