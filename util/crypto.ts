import crypto from 'crypto'

const md5Gen = crypto.createHash('md5')

export const md5 = (str: string) => {
  return md5Gen.update(str).digest('hex')
}

export const getPasswordMd5hash = (password: string) => {
  return md5(`wildbox-${password}`)
}
