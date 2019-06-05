import {Loading} from 'element-ui'

/**
 * 代理了element-ui的Loading.service
 * 注：解决了element-ui的Loading.service在microtask中立即关闭却关闭不掉的问题
 * options:
 *  - text: string 显示在加载图标下方的加载文案
 *  - spinner: string 自定义加载图标类名
 */
export function service(options) {
    const mask = Loading.service(options)
    return {
        close: () => {
            setTimeout(() => mask.close(), 1)
        }
    }
}

export function serviceFullscreenLocked(options) {
    return service({
        fullscreen: true,
        body: true,
        lock: true,
        ...options,
    })
}


