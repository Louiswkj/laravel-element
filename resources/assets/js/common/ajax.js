import extend from 'extend'
import buildQueryString from './build-query-string'
import buildFormData from './build-form-data'
// import {getToken} from '@/services/auth'
import isPlainObject from 'is-plain-obj'
import Cache from './cache'

const RE_LOGLESS_URLS = /vue-html-file-if-modified/

/**
 * ajax请求，自带判断业务成功与否
 * @param options {{}} 选项，其中值如下：
 *  - method {string} HTTP动词（即GET/POST/PUT...），默认是POST
 *  - type   {string} 同 method ，优先级比 method 低
 *  - url    {string} 接口的URL
 *  - data   {Object|string|FormData} GET请求的参数，或者POST/PUT请求的body
 *  - enctype {string} 编码方式，支持下面几种方式：
                                                - default
                                                - application/x-www-form-urlencoded
                                                - application/json
                                                - text/json
                                                - multipart/form-data
 *  - dataType {string} 响应的数据格式，默认 json
 *  - cache {bool} 是否缓存
 *
 * @returns {Promise}
 */
export default function ajax (options) {
        // 如果要求使用缓存，则使用缓存
    if (options.cache) {
        let cacheKey = [
            options.method,
            options.type,
            options.url,
            '?',
            JSON.stringify(options.params),
            '!',
            JSON.stringify(options.data),
            '#',
            JSON.stringify(options.headers)
        ].join('')

        delete options.cache

        return Cache(options.cacheType).remember(cacheKey, () => ajax(options))
    }

    options = extend({
        dataType: 'json',
        headers: {}
    }, options)

    // 兼任method和type
    options.type = options.method || options.type || 'POST'

    // let adminToken = getToken()
    let commonParams = {
        // token: adminToken,
        // admin_token: adminToken,
        // client: 'Admin'
    }

    if (!RE_LOGLESS_URLS.test(options.url) && console.warn){
        console.warn('executing ajax: ', options)
    }

    if (options.type === 'GET') {
        if (!options.params && options.data) {
            options.params = options.data
            options.data = null
        }

        options.params = extend(commonParams, options.params || {})
        fixOssParams(options.params, options.url)
    } else {
        commonParams['_token'] = $('meta[name="csrf-token"]').attr('content');
        if (!options.data || isPlainObject(options.data)) {
            options.data = extend(commonParams, options.data || {})
            fixOssParams(options.data, options.url)

            options.params = options.params || {}
            fixOssParams(options.params, options.url)
        } else if (options.data instanceof FormData) {
            for (let k in commonParams) {
                if (commonParams.hasOwnProperty(k)) {
                    options.data.append(k, commonParams[k])
                }
            }

            fixOssParams(options.data, options.url)
        } else {
            console.warn('Unknown type of data, no common params appended. ', options.data)
        }
    }

        // 构建URL
    options.url = options.url + (options.params ? (options.url.indexOf('?') > 0 ? '&' : '?') + buildQueryString(options.params) : '')

        // 如果是POST之类的，构建下data内容
    if (options.type !== 'GET' && isPlainObject(options.data)) {
        if (!options.enctype || (options.enctype === 'default') || (options.enctype === 'application/x-www-form-urlencoded')) {
            options.data = buildQueryString(options.data)
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        } else if (options.enctype === 'application/json' || options.enctype === 'text/json') {
            options.data = JSON.stringify(options.data)
            options.headers['Content-Type'] = options.enctype
        } else if (options.enctype === 'multipart/form-data') {
            options.data = buildFormData(options.data)
            // multipart/form-data 方式的 Content-Type 需要设定 boundary -- 由 FormData 自动完成
            // options.headers['Content-Type'] = options.enctype
        } else {
            return Promise.reject(new Error('Invalid enctype: ' + options.enctype))
        }
    }

    return sendAjaxRequest(options)
                .then(function (response) {
                    if (options.dataType === 'json' && response) {
                        let status = +response.status || +response.s
                        if (status !== 100 &&
                            status !== 10000001 &&
                            status !== 101) {
                            throw response
                        } else {
                            return response.data || response.d
                        }
                    }

                    return response
                })
}

export function request (method, url, data, params) {
    return ajax({
        type: method,
        url: url,
        data: data,
        params: params,
        dataType: 'json'
    })
}

/**
 *
 * @param url {String}
 * @param params {Object|String|null}
 * @returns {Promise}
 */
export function get (url, params) {
    return request('GET', url, null, params)
}

/**
 *
 * @param url {String}
 * @param data {Object|String|null}
 * @param params {Object|String|null}
 * @returns {Promise}
 */
export function post (url, data, params) {
    return request('POST', url, data, params)
}

/**
 *
 * @param url {String}
 * @param data {Object|String|null}
 * @param params {Object|String|null}
 * @returns {Promise}
 */
export function put (url, data, params) {
    return request('PUT', url, data, params)
}

// 空操作
function noop () {

}

// 一个基本的与业务无关的ajax请求函数
function sendAjaxRequest (options) {
    return new Promise((resolve, reject) => {
        options = extend({
            type: 'GET',
            url: '',
            data: null,
            dataType: '',
            headers: {},
            onCreated: noop,
            onSend: noop,
            onSent: noop,
            onProgress: null,
            onUploadProgress: null
        }, options)

        let xhr = new XMLHttpRequest()
        options.onCreated(xhr)

        xhr.onreadystatechange = function () {
                        // console.log('on xhr readystate change: ', e)
            if (xhr.readyState === 4) { // completed
                let responseType = xhr.responseType
                let response = xhr.response

                if (xhr.status === 200) {
                    try {
                        if (responseType === '' || responseType === 'text') {
                            if (options.dataType === 'json' && typeof response === 'string') {
                                try {
                                    resolve(JSON.parse(response))
                                } catch (e) {
                                    reject(extend(new Error('服务器返回的数据格式不正确！'), {status: 777}))
                                }
                            } else {
                                resolve(response)
                            }
                        } else {
                            resolve(response)
                        }
                    } catch (e) {
                        reject(e)
                    }
                } else {
                    let status = 778
                    let message = xhr.statusText
                    if (options.dataType === 'json') {
                        if (typeof response === 'string') {
                            try {
                                response = JSON.parse(response)
                            } catch (e) {
                                response = null
                            }
                        }

                        message = response ? response.message || response.m || message : message
                        status = response ? response.status || response.s || status : status
                    }

                    reject(extend(new Error(message), {
                        status: status,
                        response: xhr.response,
                        xhr: xhr
                    }))
                }
            }
        }

        if (options.onProgress) {
            xhr.onprogress = function (e) {
                options.onProgress(e, xhr)
            }
        }

        xhr.onerror = function (e) {
            reject(e)
        }

        xhr.onabort = function (e) {
            // reject(e)
            // todo: abort的时候要不要reject?
            reject(extend(new Error('Aborted'), {type: 'abort', detail: e}))
        }

        xhr.ontimeout = function (e) {
            reject(e)
        }

        xhr.open(options.method || options.type, options.url)

        let xrw = 'X-Requested-With'
        if (!options.headers[xrw]) {
            options.headers[xrw] = 'XMLHttpRequest'
        }

        for (let headerKey in options.headers) {
            if (options.headers.hasOwnProperty(headerKey)) {
                let headerValue = options.headers[headerKey]
                xhr.setRequestHeader(headerKey, headerValue)
            }
        }

        if (options.onUploadProgress) {
            xhr.upload.onprogress = function (e) {
                options.onUploadProgress(e, xhr)
            }
        }

        options.onSend(xhr)

        if (options.data !== null) {
            xhr.send(options.data)
        } else {
            xhr.send()
        }

        options.onSent(xhr)
    })
}

// for 政委的运营支持系统
function fixOssParams (params, url) {
    if (params && /mainaeross/.test(url)) {
        if (params instanceof FormData) {
        } else {

            if (params.page) {
                params.curPage = params.page
                delete params.page
            }

            if (params.limit) {
                params.rowsPerPage = params.limit
                delete params.limit
            }

            delete params.city_id
            delete params.token
            delete params.admin_token
        }
    }
}
