require('./check-versions')()

const path = require('path')
const fork = require('child_process').fork

const reloadDotEnv = require('../lib/reload-dotenv')

process.chdir(require('../../config').PROJECT_ROOT)

const WORK_SCRIPT = path.join(__dirname, 'watch-worker.js')

let worker = null

function work()
{
    let w = worker = fork(WORK_SCRIPT, {
        stdio: 'inherit',
    })

    w.on('exit', () => {
        w = null
        reloadDotEnv()
        work()
    })
}

process.on('exit', () => {
    if (worker){
        worker.kill()
        worker = null
    }
})

work()

