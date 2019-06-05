// 这个文件用来帮助代理API，防止跨域问题
const proxy = require('http-proxy-middleware')

const TARGET_HOST = process.env.DEV_API_TARGET_HOST || 'nj.test.mainaer.com'

// 需要代理的请求的前缀
const prefixesOfShouldProxyRequests = [
    '/api/mainaeross',
    '/api/admin',
    '/Public',
]

module.exports = {
    shouldProxy: req => strStartsWith(req.path, prefixesOfShouldProxyRequests),
    doProxy: proxy({
        target: `http://${TARGET_HOST}`, // target host
        changeOrigin: true, // for virtual hosted
        pathRewrite: {},
        logLevel: 'debug'
    }),
}

function strStartsWith(s, needles){
    for (let x of needles){
        if (s.substring(0, x.length) === x){
            return true
        }
    }

    return false
}

