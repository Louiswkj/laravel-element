
module.exports = function (arr, filter) {
    filter = filter || (x => !!x)

    let res = []
    for (let i = 0, n = arr.length; i < n; i++) {
        if (filter(arr[i])) {
            res.push(arr[i])
        }
    }

    return res
}
