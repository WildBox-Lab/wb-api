import { adminLoginT } from '../type/admin'
import { genMethod } from './index'

const methods = genMethod<adminLoginT>('admin')

export default methods
