require('./check-versions')()

require('../gen-vue-router')(function(err){
    if (err) {
        throw err
    }
})
