export type eventT = {
  _id?: string
  id: string
  eventName: string
  eventParams?: { [k: string]: any }
  createTime: Date
}
