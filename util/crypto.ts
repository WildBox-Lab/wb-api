import crypto from 'crypto'

export const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export const getPasswordMd5hash = (password: string) => {
  return md5(`wildbox-${password}`)
}
