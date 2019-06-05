
// 加载process.env
module.exports = function(dotEnvFile){
    dotEnvFile = dotEnvFile || require('path').join(__dirname, '../../.env')
    if (!require('dotenv').load({path: dotEnvFile})) {
        console.error('Abort due to failed to load .env (' + dotEnvFile + ') ')
        process.exit(1)
    }

    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development'
    }
}
