require('./check-versions')()
require('../dist-server')(err => { if (err) throw err })
