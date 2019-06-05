

module.exports = function(done){
    var err = null

    try {
        require('./lib/auto-vue-router')
            .generate(require('../config').autoGenerateRoutes)
    } catch (e){
        err = e
    }

    done(err)
}