import { baseSceneT } from '../type/scene'
import { genMethod } from './index'

const methods = genMethod<baseSceneT>('scene')

export default methods
