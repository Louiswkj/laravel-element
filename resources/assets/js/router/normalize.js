// 缓存正则表达式：
const RE_HOME = /^\/admin(\.php)?$/i
const RE_ADMIN_PREFIX = /^(\/admin(\.php)?\/)/i
const RE_UPPER_CASES = /[A-Z]+/g
const RE_DD = /\/-/g
const RE_ONLY_CONTROLLER = /^\/[a-z0-9_-]+$/
const RE_REWRITE_INDEX_TO_LISTS = /^(\/[a-z0-9_-]+\/)index/

// 将路径规范化
// /admin.php/ProductSuite/lists => /product-suite/lists
export default function normalize (path) {
        // 首页
    if (RE_HOME.test(path)) {
        return '/'
    }

        // 去掉前缀
        // /admin/foo/bar 或 /admin.php/foo/bar => /foo/bar
    path = path.replace(RE_ADMIN_PREFIX, '/')

        // 转换大小写
        // /ProductSuite/lists => /product-suite/lists
    path = path.replace(RE_UPPER_CASES, ($0) => '-' + $0.toLowerCase()).replace(RE_DD, '/')

        // 如果没有action，则补上action
    if (path !== '/' &&
                path !== '/login' &&
                path !== '/logout' &&
                path !== '/403' &&
                path !== '/404' &&
                RE_ONLY_CONTROLLER.test(path)) {
        path += '/lists'  // (默认action是lists)
    }

    // 把 /product/index 这样的重定向到 /product/lists
    path = path.replace(RE_REWRITE_INDEX_TO_LISTS, ($all, $1) => $1 + 'lists')

    return path
}
