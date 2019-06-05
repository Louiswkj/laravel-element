/**
 * 这个是专门为CI构建而优化了的构建脚本
 * - 本脚本并不直接构建，而是发送信号（touch某个源文件）让 watch 服务来构建
 * - 然后等待 watch 服务构建完成后，本脚本进程会自动退出
 * - 如果构建失败或者 watch 进程不存在则报错
 */
require('./check-versions')()

const co = require('co')
const fs = require('fs')
const path = require('path')
const touch = require('touch')
const genVueRouter = require('../gen-vue-router')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const PROJECT_ROOT = path.join(__dirname, '../..')

process.chdir(PROJECT_ROOT)

const APP_VUE_FILE = path.join(PROJECT_ROOT, 'src/App.vue')
const LAST_BUILD_INFO_FILE = path.join(PROJECT_ROOT, 'storage/last-build.json')

const buildTriggeredAt = new Date()


console.log('generating vue router...')
genVueRouter(function(err){
    if (err){
        console.error("Error: failed to generate vue router:")
        console.error(err)
        process.exit(1)
    }

    // 确保触发构建
    console.log('trigger building...')
    touch(APP_VUE_FILE)

    let continueSigSent = false
    
    // 等待构建完成
    co(function*(){
        console.log('waiting build compelete...')

        do {
            try{
                const data = tryReadJsonFileSync(LAST_BUILD_INFO_FILE)
                if (!data) {
                    console.log("Warn: failed to read JSON file: " + LAST_BUILD_INFO_FILE)
                    yield sleep(500)
                    continue
                }

                if (!continueSigSent){
                    if (!data.pid || !isProcessRunning(data.pid)){
                        console.log("Error: watch worker is not running! PID: " + data.pid)
                        process.exit(11)
                    }

                    continueSigSent = true
                    process.kill(data.pid, 'SIGCONT')
                    continue
                }

                if (data.startTimestamp > +buildTriggeredAt && data.endTimestamp >= data.startTimestamp) {
                    console.log('Build complete at ' + data.endTime + '. Take ' + ((data.endTimestamp - +buildTriggeredAt) / 1000).toFixed(3) + 's.')
                    console.log(data.detail)
                    process.exit(data.errorCode || 0)
                } else {
                    // console.log("[DEBUG]: build not ready: last build is at ", data)
                    if (data.buildProgress){
                        process.stderr.write(data.buildProgress)
                    }

                    // 如果没有完成，则不要让 watch 服务停下来
                    if (data.pid){
                        process.kill(data.pid, 'SIGCONT')
                    }
                }

                // 如果构建的时间太长了，则报错：超时
                if (+new Date() - +buildTriggeredAt > 5 * 60 * 1000){
                    console.log("Error: build timeout! " + ((+new Date() - +buildTriggeredAt) / 1000).toFixed(3) + ' seconds are taken.')
                    process.exit(12)
                }
            } catch (e){
                if (!/kill ESRCH/.test(e + '')){
                    console.log("Build failed. Got error: ", e)
                    process.exit(13)
                }
            }

            yield sleep(500)
        } while(true)
    })
})


function isProcessRunning(pid) {
    try {
        process.kill(pid, 0)
        return true
    } catch (e){
        console.error(e)
        return false
    }
}


function tryReadJsonFileSync(file) {
    try {
        const fileContent = fs.readFileSync(file, 'utf8')
        return JSON.parse(fileContent)
    } catch (e) {
        return false
    }
}