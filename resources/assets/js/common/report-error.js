import alert from './alert'
import noop from './noop'
import formatError from './format-error'
import extractDefault from '@/common/extract-default'
import LoginDlg from '@/components/login-dlg'

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

/**
 * 未登录的处理
 * @type {boolean}
 */
let isInUnauthorizedProcessing = false
export function onUnauthorized () {
    if (isInUnauthorizedProcessing) {
        return isInUnauthorizedProcessing
    }

    isInUnauthorizedProcessing = ((/login$/.test(location.pathname) || !window.VUE_APP) ? Promise.resolve() : alert('您尚未登录或会话已过期，请登录后再继续操作', ''))
        .catch(noop)
        .then(() => LoginDlg.showModal({onSuccess: () => alert('登录成功！请重新操作或刷新页面。')}))
        .then(() => {
            isInUnauthorizedProcessing = false
        })
        .catch((e) => {
            isInUnauthorizedProcessing = false
            console.error(e && e.message)
            console.error(e)

            return {
                next: 'retry'
            }
        })

    return isInUnauthorizedProcessing
}
