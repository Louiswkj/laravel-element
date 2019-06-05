/**
 * @module WebpackPreRunPlugin
 */

/**
 * @constructor
 * @param {Function} callback - will be called before run/watch-run
 */
function WebpackPreRunPlugin (callback) {
    this.callback = callback
};

/**
 * @callback onBuildCallback
 * @param {object} stats - webpack stats object
 */

/**
 * @param {object} compiler
 */
WebpackPreRunPlugin.prototype.apply = function (compiler) {
    let self = this
    compiler.hooks.run.tap('WebpackPreRunPlugin', function (complier) {
        self.callback(complier, 'run')
    })

    compiler.hooks.watchRun.tap('WebpackPreRunPlugin', function (watching) {
        self.callback(watching, 'watch-run')
    })
}

module.exports = WebpackPreRunPlugin
