require('./check-versions')()
require('../build')(err => { if (err) throw err })
