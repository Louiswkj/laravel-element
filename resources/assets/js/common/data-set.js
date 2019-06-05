export default function (data, key, value) {
    let keys = Array.isArray(key) ? key : key.split('.')
    let rootData = data
    let prevData = [data]
    let prevKey = 0

    for (let i = 0, n = keys.length; i < n; i++) {
        let k = keys[i]

        if (typeof data !== 'object' || !data) {
            prevData[prevKey] = data = (!isNaN(k) ? [] : {})
            if (i === 0) {
                rootData = data
            }
        }

        if (i === n - 1) {
            data[k] = value
            return rootData
        } else {
            prevData = data
            prevKey = k
            data = data[k]
                        // continue
        }
    }

    return rootData
}
