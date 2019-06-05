// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')

// 加载 process.env
require('../build/lib/load-dotenv')()

const PROJECT_ROOT = path.join(__dirname, '..')
const SRC_PATH = path.join(PROJECT_ROOT, '')
const ASSETS_ROOT = path.join(PROJECT_ROOT, 'public/admin/dist')

module.exports = {
    PROJECT_ROOT,
    SRC_PATH,
    ASSETS_ROOT,

    hosts: require('./hosts'),

    // 自动生成路由文件
    autoGenerateRoutes: {
        pages: {
            base: path.join(SRC_PATH, 'pages'),
            moduleBase: '../../pages',
            pattern: '**/*.vue',

            // 排除什么，匹配文件路径 --  生成页面的时候去掉 xxx/_yyy 形式的文件 -- 这些个文件用于保存页面的一部分临时控件
            except: !process.env.QUICK_DEV_MODE ? /\/_/ : (() => {
                const quickModeRegex = new RegExp(process.env.QUICK_DEV_MODE)
                const exceptRegex = /\/_/
                return {
                    test: (path) => exceptRegex.test(path) || !quickModeRegex.test(path)
                }
            })()
        },
        generated: path.join(SRC_PATH, 'router/generated/index.js')
    },

    devServer: {
        port: process.env.DEV_SERVER_PORT || 1081,
        host: process.env.DEV_SERVER_HOST || 'localhost',
        autoOpenBrowser: !!+process.env.DEV_AUTO_OPEN_BROWSER
    },

}
