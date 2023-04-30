import { eventT } from '../type/event'
import { genMethod } from './index'

const methods = genMethod<eventT>('event')

export default methods
