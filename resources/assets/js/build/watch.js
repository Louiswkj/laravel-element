module.exports = function (cb, options){
    doWatchBuildSrc(cb, options)
}

function doWatchBuildSrc(cb, {autoSuspend=false}={}) {
    const config = require('../config')
    const path = require('path')
    const chalk = require('chalk')
    const webpack = require('webpack')
    const moment = require('moment')
    const webpackConfig = require('./webpack.conf')
    const fs = require('fs')
    const glob = require('glob')
    const touch = require('touch')
    const WebpackPreRunPlugin = require('./lib/webpack-pre-run-plugin')
    const genVueRouter = require('./gen-vue-router')

    const LAST_BUILD_INFO_FILE = path.join(__dirname, '../storage/last-build.json')


    // 修改配置，以 watch
    webpackConfig.watch = true
    webpackConfig.watchOptions = {
        aggregateTimeout: 100, // ms
        // poll: 500, // ms. Only in NFS like fs which cannot be notified changes
    }

    // 记录下构建启动的时间
    let webpackBuildStartTime = new Date()
    webpackConfig.plugins.push(
        new WebpackPreRunPlugin(() => {
            console.log("Webpack begin run...")
            
            webpackBuildStartTime = new Date()
            
            // 记录下来最后一次构建的信息
            writeLastBuildInfo()
        })
    )

    // 记录构建过程
    let lastProgressWrittenTime = 0
    webpackConfig.plugins.forEach(function (x, i){
        if (x instanceof webpack.ProgressPlugin){
            let lastMsg = null
            webpackConfig.plugins[i] = new webpack.ProgressPlugin(function(percentage, msg) {
                var progressMsg
                if (+percentage < 1) {
                    progressMsg = '\rwebpack: ' + (+percentage * 100).toFixed(0) + '%  ' + msg + '...'
                } else {
                    progressMsg = '\rwebpack: 100%  ' + (msg || 'done') + '.                                         \n'
                }

                if (progressMsg !== lastMsg){
                    process.stderr.write(progressMsg)
                    lastMsg = progressMsg
                }

                const now = Date.now()
                if (percentage >= 1 || now - lastProgressWrittenTime > 1000){
                    lastProgressWrittenTime = now
                    writeLastBuildInfo({
                        buildProgress: progressMsg,
                    })
                }
            })
        }
    })

    // 记录下来最后一次构建的信息
    writeLastBuildInfo()

    // 自动生成vue的路由
    console.log("Generating vue routers...")
    genVueRouter(function (err){
        if (err) {
            dieWithError("Failed to generate vue router.")
        } else {
            beginWebpackWatching()
        }
    })

    const genVueRouterForFileAddOrRemoved = debounce(function(){
        console.log("Generating vue routers... (due to file added/removed.)")
        genVueRouter(function (err){
            if (err) {
                dieWithError("Failed to generate vue router.")
            } else {
                // triggerBuild({file: file})
            }
        })
    }, 200)

    // fix bug: 非构建内容的修改，比如新增了一个文件，也是不能被webpack监听到...
    watchDirRec(path.join(__dirname, '../src'), function(type, file){
        if (type === 'add' || type === 'rename'){
            genVueRouterForFileAddOrRemoved()
        }
    })

    // 如果系统文件变了，则退出此进程
    watchDirRec(__dirname, quit99)
    watchDirRec(path.join(__dirname, '../config'), quit99)
    '.babelrc .env .postcssrc.js package.json webpack.config.js'
        .split(' ')
        .forEach(f => fs.watch(path.join(__dirname, '../' + f), quit99))

    // 注意：WebStorm/PHPStorm 中的请不要开启 Appearance & Behavior > System Settings > Use "safe write" (save changes to a temporary file first)
    //      否则，webpack 的 watch会不能正确地监听到文件的改动
    //      此外，非构建内容的修改，比如新增了一个文件，也是不能被webpack监听到...
    function beginWebpackWatching(){
        console.log("building...")
        webpack(webpackConfig, function (err, stats) {
            if (err) {
                console.error(err)
                throw err
            }

            const disableOutputColors = !!+process.env.DISABLE_OUTPUT_COLOR
            const statsStr = stats.toString({
                colors: !disableOutputColors,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n'

            process.stdout.write(statsStr)

            console.log(require('./lib/format-webpack-stats')(stats))
            console.log('Build complete at ' + moment().format('HH:mm:ss'))
            console.log(chalk.yellow(
                '  Tip: built files are meant to be served over an HTTP server.\n' +
                '  Opening index.html over file:// won\'t work.'
            ))

            // 记录下来最后一次构建的信息
            writeLastBuildInfo({
                startTime: webpackBuildStartTime.toISOString(),
                startTimestamp: +webpackBuildStartTime,
                endTime: (new Date()).toISOString(),
                endTimestamp: +new Date(),
                pid: process.pid,
                errorCode: (stats.toJson().errors || []).length > 0 ? 1 : 0,
                detail: statsStr,
            })

            // 如果需要自动暂停的话，则自动暂停
            if (autoSuspend){
                try{
                    console.log("Auto suspending...")
                    process.kill(process.pid, 'SIGTSTP')
                } catch (e){
                    console.log("Error: Failed to suspend self: ", e)
                }
            }
        })
    }

    /**
     * cb: (type, file) => void
     *  - type {string} add/rename/change 
     *      - add -- it must be an add operation
     *      - rename -- add or delete
     *      - change -- file added or changed 
     */
    function watchDirRec(dir, cb){
        glob('**/*', {cwd: dir}, function(err, allFiles){
            let allFilesMap = {}

            ~(allFiles || []).forEach(x => allFilesMap[x.replace(/(\/)/g, path.sep)] = true)

            fs.watch(dir, {recursive: true}, function(type, file){
                if (!allFilesMap[file]) {
                    allFilesMap[file] = true
                    cb('add', file)
                } else {
                    cb(type, file)
                }
            })
        })
    }

    function triggerBuild() {
        touch(path.join(__dirname, '../src/App.vue'))
    }

    function writeLastBuildInfo(info){
        fs.writeFileSync(
            LAST_BUILD_INFO_FILE,
            JSON.stringify({
                startTime: webpackBuildStartTime.toISOString(),
                startTimestamp: +webpackBuildStartTime,
                pid: process.pid,
                ...info,
            }),
            'utf8'
        )
    }

    function quit99(){
        console.log("Warn: system files changed! Watch process exit! Please restart it.")
        process.exit(99)
    }

    function dieWithError(msg){
        console.error(msg)
        process.exit(1)
    }
}


function debounce(func, timeout, defaultReturn) {
    timeout = timeout || 1000
    defaultReturn = defaultReturn || false

    let isAllowed = true // 是否允许操作的标志位

    return function () {
        if (!isAllowed) {
            return defaultReturn
        }

        // 更新标志位
        isAllowed = false
        setTimeout(function () {
            isAllowed = true
        }, timeout)

        // 真正调用
        return func.apply(this, arguments)
    }
}