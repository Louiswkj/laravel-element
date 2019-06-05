require('./check-versions')()
require('../clean')(err => {
    if (err) {
        throw err
    }

    require('../build')(err => {
        if (err) {
            throw err
        }
    })
})
