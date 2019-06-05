const formatWebpackStatsErrorsWarnings = require('format-webpack-stats-errors-warnings')
const PROJECT_ROOT = require('../../config').PROJECT_ROOT

module.exports = function (stats) {
    return formatWebpackStatsErrorsWarnings(stats, PROJECT_ROOT)
}
