import { tagT } from '../type/tag'
import { genMethod } from './index'

const methods = genMethod<tagT>('tag')

export default methods
