
module.exports = function filter (arr) {
    let res = []
    for (let i = 0, n = arr.length; i < n; i++) {
        if (arr[i]) {
            res.push(arr[i])
        }
    }

    return res
}
