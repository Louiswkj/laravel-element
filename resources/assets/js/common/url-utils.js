/**
 * 解析URL中的参数
 * @param url
 * @returns {{}}
 */
export function parseQueryParamsOfUrl (url) {
    if (!url) {
        return {}
    }

    var queryPos = url.indexOf('?')
    if (queryPos < 0) {
        return {}
    }

    return parseQueryString(url.substring(queryPos + 1))
}

/**
 * 解析QueryString中的参数
 * @param query
 * @returns {{}}
 */
export function parseQueryString (query) {
    if (!query) {
        return {}
    }

    var params = {}
    var parts = query.split('&')
    for (var i = 0, len = parts.length; i < len; i++) {
        var part = parts[i]
        var assignPos = part.indexOf('=')
        var key = decodeURIComponent(part.substring(0, assignPos))
        params[key] = decodeURIComponent(part.substring(assignPos + 1))
    }

    return params
}

/**
 * 解析URL中的路径
 * @param url
 * @returns {*}
 */
export function parsePathOfUrl (url) {
    if (!url) {
        return ''
    }

        // 先干掉查询字符串
    var queryPos = url.indexOf('?')
    url = (queryPos > 0 ? url.substring(0, queryPos) : url)

        // 干掉协议
    var hasHost = false
    var schemaPos = url.indexOf('://')
    if (schemaPos > 0) {
        url = url.substring(schemaPos + 3)
        hasHost = true
    } else if (url.substring(0, 2) === '//') {
        url = url.substring(2)
        hasHost = true
    }

        // 干掉主机和认证部分
    if (hasHost) {
        url = url.replace(/^[^/]+/, '')
    }

    return url
}

/**
 * 将一个字符串从路径格式转换为URL格式
 * @param str
 * @returns {*}
 */
export function urlify (str) {
    return (str + '').replace(/\\/g, '/')
}
