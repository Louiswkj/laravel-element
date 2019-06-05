export default function (obj, keysToBeDeleted) {
    if (!obj) {
        return
    }

    for (let k of keysToBeDeleted) {
        delete obj[k]
    }

    return obj
}
