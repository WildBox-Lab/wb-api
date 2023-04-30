import { previewT } from '../type/preview'
import { genMethod } from './index'

const methods = genMethod<previewT>('preview')

export default methods
