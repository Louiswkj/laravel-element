import buildQueryString from './build-query-string'

export default function (path, queryParams) {
    path = encodeURI('/' + ((path || '') + '').replace(/^\/|^\s/, ''))
    queryParams = buildQueryString(queryParams)

    let url = path

    if (queryParams) {
        url += (url.indexOf('?') > 0 ? '&' : '?') + queryParams
    }

    return url
}
