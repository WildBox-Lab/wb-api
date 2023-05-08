import { Request } from 'express'

declare module 'express-session' {
  interface SessionData {
    userinfo: {
      uuid: string
    }
    captchaToken: string
  }
}

export interface CustomRequest<T> extends Request {
  body: T
}
