


export default function deepFreezeCopy (x, maxDepth=20) {
    if (!x) {
        return x
    }

    if (maxDepth <= 0){
        console.error("Max depth reached in deepCopy!")
        return 
    }

    if (typeof x === 'object') {
        if (x.constructor === Object) {
            let o = {}
            for (let k in x) {
                if (x.hasOwnProperty(k)) {
                    o[k] = deepFreezeCopy(x[k], maxDepth - 1)
                }
            }

            return Object.freeze(o)
        } else if (x.constructor === Array) {
            let a = new Array(x.length)
            for (let i = 0, n = x.length; i < n; i++) {
                a[i] = deepFreezeCopy(x[i], maxDepth - 1)
            }

            return Object.freeze(a)
        } else {
            return Object.freeze(x)
        }
    } else {
        return Object.freeze(x)
    }
}
