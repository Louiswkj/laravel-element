
import extend from './extend'

export default function clone (obj) {
    return Array.isArray(obj) ? cloneArray(obj) : extend({}, obj)
}

function cloneArray (arr) {
    let len = arr.length
    let ret = new Array(arr.length)

    for (var i = 0; i < len; i++) {
        ret[i] = arr[i]
    }

    return ret
}
