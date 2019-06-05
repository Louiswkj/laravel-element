/**
 * 防止弹跳 -- 一段时间(timeout)内，保证不会多次操作(func)
 * @param func {function} 要执行的操作
 * @param timeout {int}   超时时间
 * @param defaultReturn {any} 如果有弹跳操作，返回什么？
 * @return {function} 返回新的防弹跳的函数
 */
export default function (func, timeout, defaultReturn) {
    timeout = timeout || 1000
    defaultReturn = defaultReturn || false

    let isAllowed = true // 是否允许操作的标志位

    return function () {
        if (!isAllowed) {
            return defaultReturn
        }

                // 更新标志位
        isAllowed = false
        setTimeout(function () {
            isAllowed = true
        }, timeout)

                // 真正调用
        return func.apply(this, arguments)
    }
}
