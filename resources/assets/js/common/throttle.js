/**
 * 节流函数 -- 防止多次重复事件影响性能
 * @from http://www.alloyteam.com/2012/11/javascript-throttle/
 */
export default function (fn, delay, mustRunDelay) {
    delay = delay || 100
    mustRunDelay = mustRunDelay || 100
    var timer = null
    var startTime
    return function () {
        let context = this
        let args = arguments
        let curTime = +new Date()

        clearTimeout(timer)

        if (!startTime) {
            startTime = curTime
        }

        if (curTime - startTime >= mustRunDelay) {
            fn.apply(context, args)
            startTime = curTime
        } else {
            timer = setTimeout(function () {
                fn.apply(context, args)
            }, delay)
        }
    }
}
