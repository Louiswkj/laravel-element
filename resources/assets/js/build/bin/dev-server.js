require('./check-versions')()
require('../dev-server')(err => { if (err) throw err })
