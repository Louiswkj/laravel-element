import alert from './alert'
import formatError from './format-error'

/**
 * 报告一个错误
 */
export default function (error, innerError) {
    try {
        console.error(error)
    } catch (e) {
    }

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

    const formated = formatError(error) + (innerError ? formatError(innerError) : '')
    return alert(formated, formated.title || '')
}

