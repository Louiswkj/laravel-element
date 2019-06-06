


export default function deepCopy (x, maxDepth=20) {
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
                    o[k] = deepCopy(x[k], maxDepth - 1)
                }
            }

            return o
        } else if (x.constructor === Array) {
            let a = new Array(x.length)
            for (let i = 0, n = x.length; i < n; i++) {
                a[i] = deepCopy(x[i], maxDepth - 1)
            }

            return a
        } else {
            return x
        }
    } else {
        return x
    }
}
