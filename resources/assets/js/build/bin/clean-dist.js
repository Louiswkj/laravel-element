var fs = require('fs')
var path = require('path')


var PROJECT_ROOT = path.join(__dirname, '../..')

var INDEX_HTML_FILEPATH = path.join(PROJECT_ROOT, 'public/admin/index.html')
var DIST_DIR = path.join(PROJECT_ROOT, 'public/admin/dist')


var indexHtmlContent = fs.readFileSync(INDEX_HTML_FILEPATH, 'utf8')

var appCssFile = indexHtmlContent.match(/[a-zA-Z0-9]+.[a-zA-Z0-9]+?\.css/)[0]
var manifestJsFile = indexHtmlContent.match(/manifest.[a-zA-Z0-9]+?\.js/)[0]
var vendorJsFile = indexHtmlContent.match(/vendor.[a-zA-Z0-9]+?\.js/)[0]
var appJsFile = indexHtmlContent.match(/app.[a-zA-Z0-9]+?\.js/)[0]

var manifestJsFileContent = fs.readFileSync(path.join(DIST_DIR, 'js/' + manifestJsFile), 'utf8')

var chunkFiles = []
searchAll(manifestJsFileContent, /(\d+)['"]?:['"]([a-zA-Z0-9]+?)['"]/g)
    .forEach(function(x){
        chunkFiles.push(x[1] + '.' + x[2] + '.js')
        chunkFiles.push(x[1] + '.' + x[2] + '.css')
    })

rmFilesInDir({
    dir: path.join(DIST_DIR, 'css'),
    exceptFiles: [appCssFile].concat(chunkFiles),
})

rmFilesInDir({
    dir: path.join(DIST_DIR, 'js'),
    exceptFiles: [
        appJsFile,
        manifestJsFile,
        vendorJsFile,
    ].concat(chunkFiles),
})

function searchAll(haystack, needleRe){
    needleRe.lastIndex = 0

    var m, r = []
    while (m = needleRe.exec(haystack)){
        r.push(m)
    }

    return r
}

function rmFilesInDir(options){
    var dir = options.dir
    var exceptFiles = options.exceptFiles
    var exceptFilesMap = exceptFiles.reduce((r, x) => (
        r[x] = true, 
        r[x + '.map'] = true,
        r), {})
    var files = fs.readdirSync(dir)

    files.forEach(function(x){
        if (!exceptFilesMap[x]){
            var fullpath = path.join(dir, x)
            console.log("rm " + fullpath)
            fs.unlink(fullpath, function(err){
                if (err){
                    console.log("Error: failed to rm " + fullpath)
                }
            })
        }
    })
}



