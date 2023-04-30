import { Request } from 'express'

declare module 'express-session' {
  interface SessionData {
    adminInfo: {
      user: string
    }
  }
}

export interface CustomRequest<T> extends Request {
  body: T
}
