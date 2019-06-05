module.exports = function (cb) {
    const ora = require('ora')
    const rm = require('rimraf')
    const path = require('path')
    const config = require('../config')

    const spinner = ora('cleaning...')
    spinner.start()
    rm(config.ASSETS_ROOT, err => {
        spinner.stop()

        if (err) {
            console.error(err)
            cb(err)
        } else {
            cb()
        }
    })
}
