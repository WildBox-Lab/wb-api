enum genderType {
  male = 1,
  female = 2,
  other = 3,
  hide = 4,
}

export type SnsLinkObject = {
  qq: string
  weibo: string
  bilibili: string
  twitter: string
  youtube: string
}

export enum roleType {
  block,
  unauth,
  normal,
  admin,
  superAdmin,
}

export type baseUserDbType = {
  uuid: string
  username: string
  email: string
  password: string
  bio: string
  gender: genderType
  avatar: string
  cover: string
  phoneNumber: string
  links?: SnsLinkObject
  birthday: Date
  role: roleType
  blockList: string[]
}
