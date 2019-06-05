import ApiStatus from './api-status'

export default function (error) {
    if (typeof error === 'string'){
        return error
    }

    let status = (!isNaN(error) ? error
                : (error && !isNaN(error.status) ? error.status
                        : (error && !isNaN(error.s) ? error.s : '778')))

    let message = (typeof error === 'string' ? error
                        : (error && typeof error.message === 'string' ? error.message
                        : (error && typeof error.m === 'string' ? error.m : '')))

    message = message || '网络故障，请刷新页面或稍后再试。'

    switch (status) {
        case ApiStatus.ERR_NOT_FOUND:
            return message === '未找到' ? '很抱歉，但是此页面走丢了，请返回上一级页面或首页再试试。' : message
        case ApiStatus.ERR_EMPTY_DATA:
            return '网络似乎不太好呀，服务器连不上了，请刷新页面或稍后再试。'
        case ApiStatus.ERR_DUPLICATED_LIKE:
            return message
        default:
            if (status >= 500) {
                console.error("Got error: %o (message: %o, status: %o)", error, message, status)
                return message
            } else {
                return message
            }
    }
}
