import { baseUserDbType } from '../type/user'
import { genMethod } from './index'

const methods = genMethod<baseUserDbType>('admin')

export default methods
