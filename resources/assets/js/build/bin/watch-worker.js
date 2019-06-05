require('./check-versions')()

console.log("Watch worker is running...")

process.chdir(require('../../config').PROJECT_ROOT)

require('../watch')(err => {
    if (err) {
        throw err
    }
}, {
    autoSuspend: !!+process.env.AUTO_SUSPEND_WATCH_WORKER
})

