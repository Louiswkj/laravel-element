import isPlainObject from 'is-plain-obj'

const isArray = Array.isArray

/**
 * PHP style build querystring
 * @param queryParams {Object|array}
 * @returns {String}
 */
export default function (queryParams, options={}) {
    if (!queryParams) {
        return ''
    }

    if (typeof queryParams === 'string') {
        return queryParams
    }

    const {needArrayIndex=false} = options

    let queryParamsArr = []
    let addQueryParam = (key, val) => {
        if (!val && val !== 0) {
            queryParamsArr.push(key + '=')
            return
        }

        switch (typeof val) {
            case 'object':
                if (val instanceof Date) {
                    queryParamsArr.push(key + '=' + encodeURIComponent(val.toISOString()))
                } else if (isArray(val)) {
                    for (let i = 0, n = val.length; i < n; i++) {
                        addQueryParam(needArrayIndex ? `${key}[${i}]` : `${key}[]`, val[i])
                    }
                } else if (isPlainObject(val)) {
                    for (let k in val) {
                        if (val.hasOwnProperty(k)) {
                            addQueryParam(`${key}[${k}]`, val[k])
                        }
                    }
                } else {
                    queryParamsArr.push(key + '=' + encodeURIComponent(val + ''))
                }
                break
            default: // string, number, undefined ...
                queryParamsArr.push(key + '=' + encodeURIComponent(val))
                break
        }
    }

    for (let key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            addQueryParam(encodeURIComponent(key), queryParams[key])
        }
    }

    return queryParamsArr.join('&')
}
