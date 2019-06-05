module.exports = function deepCopy (x) {
    if (!x) {
        return x
    }

    if (typeof x === 'object') {
        if (x.constructor === Object) {
            let o = {}
            for (let k in x) {
                if (x.hasOwnProperty(k)) {
                    o[k] = x[k]
                }
            }

            return o
        } else if (x.constructor === Array) {
            let a = new Array(x.length)
            for (let i = 0, n = x.length; i < n; i++) {
                a[i] = deepCopy(x[i])
            }

            return a
        } else {
            return x
        }
    } else {
        return x
    }
}
