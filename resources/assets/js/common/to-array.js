export default function (x) {
    if (Array.isArray(x)) {
        return x
    }

    if (!x) {
        return []
    }

    if (typeof x === 'number'){
        return []
    }

    if (typeof x === 'string' || ('length' in x)) {
        return [].slice.call(x, 0)
    }

    let arr = []
    for (let k in x) {
        if (x.hasOwnProperty(k)) {
            arr.push(x[k])
        }
    }

    return arr
}
