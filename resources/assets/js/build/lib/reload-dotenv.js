module.exports = (function(){
    const fs = require('fs')
    const path = require('path')
    const dotenv = require('dotenv')
    const dotEnvFilePath = path.join(__dirname, '../../.env')

    return function(){
        const envFileContent = fs.readFileSync(dotEnvFilePath)
        const envItems = dotenv.parse(envFileContent) 
        
        if (envItems) {
            for (var k in envItems) {
                if (envItems.hasOwnProperty(k)){
                    process.env[k] = envItems[k]
                }
            }
        }
    }
})()
