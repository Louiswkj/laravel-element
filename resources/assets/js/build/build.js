module.exports = function (done) {
    const chalk = require('chalk')
    const webpack = require('webpack')
    const webpackConfig = require('./webpack.conf')
    const moment = require('moment')

    console.log("Generating routers...")
    require('./gen-vue-router')(function(err){
        if (err){
            done(err)
            return
        }

        console.log('Begin building...')
        webpack(webpackConfig, function (err, stats) {
            if (err) {
                console.error(err)
                done(err)
                return
            }
    
            process.stdout.write(stats.toString({
                colors: !+process.env.DISABLE_OUTPUT_COLOR,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n')
    
            console.log(require('./lib/format-webpack-stats')(stats))
            console.log('Build complete at ' + moment().format('HH:mm:ss'))
            console.log(chalk.yellow(
                            '  Tip: built files are meant to be served over an HTTP server.\n' +
                            '  Opening index.html over file:// won\'t work.'
                    ))
    
            done()
        })
    })
}
