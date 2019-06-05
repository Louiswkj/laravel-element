import createUrl from './create-url'
import * as urlUtils from './url-utils'
import Vue from 'vue'
import router from '../router'
import formatError from './format-error'
import reportError from './report-error'
import reportMinorError from './report-minor-error'
import ajax, {get, post, put, request} from './ajax'
import Cache from './cache'
import cached from './cached'
import extend from './extend'
import alert from './alert'
import confirm from './confirm'
import bus from '../services/bus'
import debounce from './debounce'
import throttle from './throttle'
import buildQueryString from './build-query-string'
import each from 'lodash/each'
import map from 'lodash/map'
import reduce from 'lodash/reduce'
import toArray from './to-array'
import notifySuccess from './notify-success'
import performLoading from './perform-loading'
import fillModelWithData from './fill-model-with-data'

const Q = {
    createUrl,
    getPageParams () {
        return urlUtils.parseQueryParamsOfUrl(location.href)
    },
    navigateTo (url, params, options) {
        if (options && options.reload) {
            bus.$once('page:activated', page => {
                if (page.gracefulReload) {
                    page.gracefulReload()
                } else if (page.reload) {
                    page.reload()
                } else {
                    Q.reloadPage()
                }
            })
        }

        router.push(params ? createUrl(url, params) : url)
    },
    reloadPage (params) {
        bus.$emit('reload-page', params)
    },
    isListPage (url){
        return url && (typeof url === 'string') && /list(s)?$/i.test(url.replace(/[?#].*$/g, ''))
    },
    buildQueryString,
    formatError,
    reportError,
    reportMinorError,
    notifySuccess,
    registerComponents (components) {
        for (let name in components) {
            if (components.hasOwnProperty(name)) {
                Vue.component(name, components[name])
            }
        }
    },
    ajax,
    get,
    post,
    put,
    request,

    Cache,
    cached,

    debounce,
    throttle,
    initAjaxButton,
    bus,
    each,
    map,
    reduce,
    toArray,

    alert,
    confirm,
    performLoading,
    fillModelWithData,
}

const Mainaer = Q

// 导出到全局作用域下
extend(window, {
    Q,
    Mainaer,
    throttle,
    adminUrl,
    apiUrl
})

// 导出到jQuery对象中去
if (typeof $ !== 'undefined') {
    extend($, {
        alert,
        confirm
    })
}

// 模块方式导出
export default Q

function adminUrl (controllerAction, params) {
    return createUrl('/admin/' + controllerAction, params)
}

function apiUrl (path, params) {
    return createUrl('/api/' + path, params)
}

/**
 * 初始化一个通过Ajax提交的button
 * 注意：这个selector对应的元素中的data-xxx属性中除了一下三个，都将被作为参数传到服务端：
 * 1. method -- 指定请求类型GET/POST
 * 2. url    -- 指定服务端的URL
 * 3. confirm -- 指定发起请求前的确认提示内容
 * @param selector
 * @param options
 */
function initAjaxButton (selector, options) {
    if (typeof $ === 'undefined') {
        throw new Error('jQuery not loaded!')
    }

    options = extend({
        method: 'POST',
        url: '',
        data: {},
        onSubmit: function (data) {
        },
        onSuccess: function (responseData) {
            if (responseData && responseData.nextUrl) {
                location.href = responseData.nextUrl
            } else {
                location.reload()
            }
        },
        onFail: function (reason) {
            alert(reason.message)
        }
    }, options || {})

    $(document).on('click', selector, debounce(function () {
        var $el = $(this)
        var data = extend($el.data() || {}, options.data || {})
        var confirmContent = $el.data('confirm')
        var method = $el.data('method') || options.method
        var url = $el.data('url') || options.url

                // 已经禁用的不能点击！
        if ($el.is('.disabled') || $el.attr('disabled')) {
            return false
        }

        if (confirmContent) {
            confirm(confirmContent)
                                .then(doSubmit, e => {})
        } else {
            doSubmit()
        }

        return false

        function doSubmit () {
            var preCheck = options.onSubmit.call($el, data)
            if (preCheck === false) {
                return
            }

            if (preCheck && preCheck.then && typeof (preCheck.then) === 'function') {
                preCheck.then(function (thenData) {
                    reallyDoSubmit(thenData || data)
                })
            } else {
                reallyDoSubmit(data)
            }

            function reallyDoSubmit (data) {
                                // 去除不需要传到服务端的信息
                delete data.confirm
                delete data.method
                delete data.url

                request(method, url, data)
                                        .then(options.onSuccess.bind($el),
                                                options.onFail.bind($el))
            }
        }
    }))
}
