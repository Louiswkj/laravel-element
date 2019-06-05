export default function (func, funcName) {
    return function (...args) {
        let ret = func.apply(this, args)
        let argsFormatStr = args.map(() => '%o').join(', ')
        console.log('[SpyFunc] ' + funcName + '(' + argsFormatStr + ') => %o', ...args, ret)
        return ret
    }
}
