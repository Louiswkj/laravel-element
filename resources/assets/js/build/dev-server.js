module.exports = function () {
    const path = require('path')
    const config = require('../config')
    const fs = require('fs')
    const express = require('express')
    const opn = require('opn')
    const debug = require('debug')('dev-server')
    const log = console.log.bind(console)

    // 默认静态文件路径
    const STATIC_DIR = path.join(__dirname, '../public')

    // 主页路径
    const MAIN_PAGE_PATH = path.join(STATIC_DIR, '/admin/index.html')
    
    const sendMainPage = (req, res) => {
        debug(`${req.method} ${req.url}`)
        fs.readFile(MAIN_PAGE_PATH, 'utf8', function (err, data) {
            if (err) {
                if (/ENOENT/.test(err.message)) {
                    res.send('Please wait a minute and refresh later. Building...')
                } else {
                    log('Failed to load main page content: ', err)
                    res.send('Error: failed to read main page! Detail: ' + err.message)
                }
            } else {
                // 开发版本使用非压缩版本的js
                data = data.replace(/\.min\.js/g, '.js')

                res.send(data)
                debug(`${req.method} ${req.url} ${data.length} bytes served.`)
            }
        })
    }

    // 创建服务器
    const app = express()

    // proxy api requests
    const proxy = require('./dev-api-proxy')

    // 首页，及各个页面，只要没有带"."的，都处理
    app.get('/', function (req, res) {
        res.redirect('/admin')
    })


    // 静态文件服务目录
    app.use(express.static(STATIC_DIR, {
        dotfiles: 'ignore',
        etag: true,
        extensions: ['.js', '.json', '.css', '.jpg', '.png', '.ico'],
        index: false,
        maxAge: '365d',
        lastModified: true,
        redirect: false
    }))

    // 处理API代理和其他请求
    app.use(function(req, res, next){
        if (proxy.shouldProxy(req)){
            proxy.doProxy(req, res, next)
            return 
        }

        if (req.path === '/admin/logout'){
            res.clearCookie('admin_token2')
            res.redirect('/admin/login')
            return
        }

        if (/^\/admin/i.test(req.path)){
            if (req.method === 'GET' && !(req.xhr || req.query._isAjax)){
                sendMainPage(req, res)
                return
            } else {
                proxy.doProxy(req, res, next)
                return
            }
        }

        next()
    })

    // 开始监听
    const {host, port, autoOpenBrowser} = config.devServer
    app.listen(port, host, function () {
        log(`listening on ${host}:${port}`)
        log(`you can visit it via http://${host}:${port}`)
        if (autoOpenBrowser) {
            opn(`http://${host}:${port}`)
        }
    })
}

