module.exports = function(arr) {
    let r = {}

    arr.forEach(x => {
        r[x.val] = x.label
    })

    return r
}

