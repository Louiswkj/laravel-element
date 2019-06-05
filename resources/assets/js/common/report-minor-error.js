import bus from '@/services/bus'

import formatError from './format-error'
import {onUnauthorized} from './report-error'

export default function (error, innerError) {
    try {
        console.warn(error, innerError)
    } catch (e) {}

    // abort或canceled的错误忽略
    if ((error && (error.type === 'abort' || error.type === 'canceled'))
        || (innerError && (innerError.type === 'abort' || error.type === 'canceled'))) {
        return Promise.resolve()
    }
    
    // 未登录的处理
    const status = +(error && (error.status || error.s)) || +(innerError ? innerError.status || innerError.s : 0)
    if (status === 104 || status === 10000004) {
        return onUnauthorized()
    }

    return bus.$notify({
        title: '出了点小问题：',
        message: formatError(error) + (innerError ? formatError(innerError) : ''),
        type: 'error'
    })
}
