import code from 'svg-captcha'

export const codeMap: { [k: string]: code.CaptchaObj } = {}

export const createCode = () => {
  return code.create({
    size: 4,
    ignoreChars: '0o1iIl',
    noise: 3,
    color: true,
    background: '#fff',
    fontSize: 60,
  })
}
