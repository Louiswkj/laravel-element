const glob = require('glob')
const fs = require('fs')

let prevGeneratedFileContent = null

// 自动生成页面路径和懒加载的模块
module.exports = {
    generate: function (config) {
        let pagesSrcFiles = glob.sync(config.pages.pattern, {cwd: config.pages.base})

        let routes = []

        // 逆向排序
        // 如果同时有test.vue和test.js，则test.vue排前面
        pagesSrcFiles = pagesSrcFiles.sort().reverse()

        let except = config.pages.except
        let moduleBase = config.pages.moduleBase
        // let keepAlives = config.pages.keepAlives

        pagesSrcFiles.forEach(function (srcFile) {
            if (except && except.test(srcFile)) {
                return
            }

            // 计算出页面路径
            // ProductList.vue => product-list
            let pageUrl = srcFile.replace(/\.(\w+)$/, '') // 去掉扩展名
            pageUrl = pageUrl.replace(/[A-Z]+/g, x => '-' + x.toLowerCase()).replace(/^[-]+/, '') // 大写驼峰形式变连字符形式
            pageUrl = '/admin/' + pageUrl

            // 计算出模块路径
            let srcModuleFilePath = moduleBase + '/' + srcFile

            // 加入路由
            routes.push({pageUrl, srcModuleFilePath})

            // 如果是带有'/index'后缀的，则把这个后缀去掉
            // product/index => product
            let withoutIndexPageUrl = pageUrl.replace(/(\/)?index$/g, '')
            if (withoutIndexPageUrl !== pageUrl) {
                routes.push({pageUrl: withoutIndexPageUrl, srcModuleFilePath})
            }
        })

        let generatedFileContent = `
// 注意：这个文件是生成的。请不要修改！
// Note: This file is generated! Please do NOT modify it!
export default [
    ${routes.map(({pageUrl, srcModuleFilePath}) => (
        `{path: '${pageUrl}', component: resolve => void(require(['${srcModuleFilePath}'], resolve))}`
    )).join(',\n    ')}
]

`


        // lazy read the generated file content
        if (prevGeneratedFileContent === null){
            try {
                prevGeneratedFileContent = fs.readFileSync(config.generated, 'utf8') || ''
            } catch (e){
                prevGeneratedFileContent = ''
            }
        }

        // console.log("prevGeneratedFileContent: \n" + prevGeneratedFileContent)
        // console.log("Generated routes: \n" + generatedFileContent)
        if (generatedFileContent !== prevGeneratedFileContent) {
            fs.writeFileSync(config.generated, generatedFileContent, 'utf8')
            prevGeneratedFileContent = generatedFileContent
        }
    }
}
