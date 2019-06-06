import Q from '../common'
import bus from '../services/bus'
import Vue from 'vue'
import noop from '../common/noop'
import ajax from '../common/ajax'
import formatError from '../common/format-error'
import createUrl from '../common/create-url'
import cached from '../common/cached'
import extend from 'extend'

export default {
    data () {
        return {
            r: this.$route ? this.$route.query.r : null,
            location: null,
            referrer: null,
            ajaxRequests: [],
            ajaxErrors: [],
            ajaxLoading: false,
            ajaxBeginLoadingAt: null,
            ajaxEndLoadingAt: null,
            ajaxLoadingMinTime: 15, // 毫秒
            ajaxLoadingUpdateTimer: 0,
            hasMounted: false,
            hasDestroyed: false,
            hasDeactivated: false,
            hasRequiredReload: false,
            gracefulReloadTimer: 0,
            gracefulReloadTimeout: 15, // 毫秒
            activatedTimes: 0,
            deactivatedTimes: 0,
            isDebug: /debug/.test(location.href),
            isDev: /dev/.test(location.href),
        }
    },
    computed: {
    },
    watch: {
        r (v) {
            console.log('router updated: ', v)
            if (v) {
                this.reload()
            }
        },
        /**
         * 监听 ajaxRequests 的修改，从而来更新 ajaxLoading 的状态
         * 并且保证 ajaxLoading 从 true 变 false 的间隔时间至少有 ajaxLoadingMinTime (毫秒)
         * -- 为了解决加载过快反而导致 v-loading 指令的动画一直持续的 bug
         */
        ajaxRequests () {
            if (this.ajaxLoadingUpdateTimer) {
                clearTimeout(this.ajaxLoadingUpdateTimer)
            }

            if (this.ajaxRequests.length > 0) {
                if (!this.ajaxLoading) {
                    this.ajaxLoading = true
                    this.ajaxBeginLoadingAt = new Date()
                }
            } else {
                this.ajaxLoadingUpdateTimer = setTimeout(() => {
                    if (this.ajaxRequests.length <= 0) {
                        this.ajaxLoading = false
                        this.ajaxEndLoadingAt = new Date()
                    }
                }, Math.max(0, this.ajaxLoadingMinTime - (+new Date() - +this.ajaxBeginLoadingAt)))
            }
        }
    },
    methods: {
        /**
         * Ajax请求
         * @param options
         *  - type: GET/POST  - HTTP的方法类型
         *  - url:  String
         *  - data: Object/String/FormData   GET的参数(如果没有params)，POST的内容数据
         *  - params: Object/String          GET/POST 的 URL 参数
         *  - headers: Object                额外的HTTP请求头
         *
         *  回调（也可以使用）
         *  - done(data)        - 成功的回调
         *  - fail(err)         - 失败的回调
         *  - canceled(err)     - 取消的回调
         *  - always(type, data/err) 总是会回调, type 是 done/fail/canceled
         *
         * @returns {Promise.<{}>}
         */
        $ajax (options) {
            let request = {
                done: false,
                canceled: false,
                cancel: noop
            }

            let removeRequest = () => {
                this.ajaxRequests = this.ajaxRequests.filter(x => x !== request)
            }

            this.ajaxRequests = this.ajaxRequests.concat([request])

            options.onCreated = decorate(options.onCreated, (next, xhr) => {
                request.cancel = () => {
                    request.canceled = true
                    xhr.abort()
                    removeRequest()
                }
                next(xhr)
            })

            let done = options.done || noop
            let fail = options.fail || noop
            let canceled = options.canceled || noop
            let always = options.always || noop

            return ajax(options)
                    .then(data => {
                        if (request.canceled) {
                            throw new Error('Canceled')
                        }

                        request.done = true
                        removeRequest()

                        done(data)
                        always('done', data)

                        return data
                    })
                    .catch(err => {
                        request.done = true
                        removeRequest()

                        if (request.canceled || (err && err.type === 'abort')) {
                            err = extend(new Error('已取消加载'), {type: 'canceled', canceled: true, url: options.url, method: options.type})

                            canceled(err)
                            always('canceled', err)
                        } else {
                            err = extend(new Error(formatError(err)), {type: 'error', status: err && err.status, detail: err, url: options.url, method: options.type})

                            fail(err)
                            always('fail', err)
                        }

                        throw err
                    })
        },
        $cancelAllAjaxRequests () {
            this.ajaxRequests.forEach(x => x.cancel())
            this.ajaxRequests = []
                        // this.ajaxRequests.splice(0)
        },
        // 判断是否正在 ajax 加载数据
        isAjaxLoading () {
            return this.ajaxLoading
        },
        // 判断是否是列表页面
        isKindaListsPage () {
            return /lists(\?.*)?$/.test(this.location)
        },
        // 优雅地重新加载数据
        gracefulReload () {
            this.hasRequiredReload = true

            if (this.gracefulReloadTimer) {
                clearTimeout(this.gracefulReloadTimer)
            }

            this.gracefulReloadTimer = setTimeout(() => {
                this.gracefulReloadTimer = 0

                if (!this.hasDeactivated && !this.hasDestroyed) {
                    this.hasRequiredReload = false
                    this.reload()
                }
            }, this.gracefulReloadTimeout)
        },
        // 重新加载页面数据
        reload(reason) {
            console.warn(`reload(${reason}) is not implemented yet! Performing default reload strategy`)

            let grid = this.$refs.grid
            if (grid) {
                grid.refreshDataAndView()
            } else {
                if (reason !== 'route:enter') {
                    Q.reloadPage()
                }
            }
        },
        resetData ({only = null, except = null} = {}) {
            Q.each(this.$options.data.call(this), (v, k) => {
                if (only) {
                    if (only.indexOf(k) >= 0) {
                        this[k] = v
                    }
                } else if (except) {
                    if (except.indexOf(k) < 0) {
                        this[k] = v
                    }
                } else {
                    this[k] = v
                }
            })
        },
        onRouteChange (to, from, changeType) {
            this.location = to.fullPath
            this.referrer = from.fullPath === '/' ? getReferPath() : from.fullPath
            // 为了防止页面刷新后referrer改变，尝试把referrer存放到window.name中
            window.name = "referrer:" + this.referrer
            console.log("RouteChanged! %s -> %s, referrer: %s", from.fullPath, to.fullPath, this.referrer)

            bus.$emit('page:enter', this)

            if (this.isKindaListsPage()) {
                this.reload('route:' + changeType)
            }

            if (this.$options.onRouteChange) {
                this.$options.onRouteChange.call(this, to, from, changeType)
            }

            if (changeType === 'enter' && this.$options.onRouteEntered) {
                this.$options.onRouteEntered.call(this, to, from)
            }

            if (changeType === 'update' && this.$options.onRouteUpdated) {
                this.$options.onRouteUpdated.call(this, to, from)
            }
        },
        createUrl (path, params) {
            return createUrl(path, params)
        },
        navigateTo (path, params) {
            return Q.navigateTo(path, params)
        },
        goBack () {
            return window.history.back()
        },
        scrollToTargetIfNeeded () {
            Vue.nextTick(() => {
                if (!location.hash || location.hash === '#') {
                    return
                }

                let el = document.querySelector(location.hash)
                if (el && el.scrollIntoViewIfNeeded) {
                    el.scrollIntoViewIfNeeded()
                    el.classList.add('targeted')
                } else if (el && el.scrollIntoView) {
                    el.scrollIntoView()
                    el.classList.add('targeted')
                }
            })
        },
        reloadGrid(){
            this.$refs.grid.refreshDataAndView()
        },
        notifySuccess(msg){
            this.$notify.success(msg)
        }
    },
    mounted(){
        this.hasMounted = true
    },
    destroyed () {
        console.log('page destroyed, cancel all ajax requests.')
        this.hasDestroyed = true
        this.$cancelAllAjaxRequests()
    },
    onRouteChange (to/*, from, reason */) {
        this.r = to.query.r
    },
    beforeRouteEnter (to, from, next) {
        console.log('base: beforeRouteEnter: ', {to, from})
        next(vm => {
            vm.onRouteChange(to, from, 'enter')
        })
    },
    beforeRouteUpdate (to, from, next) {
        console.log('base: beforeRouteUpdate: ', {to, from})

        next()

        Vue.nextTick(() => {
            this.onRouteChange(to, from, 'update')
        })
    },
    activated () {
        console.log('base: activated: ', this)

        this.hasDeactivated = false
        this.activatedTimes++

        bus.$emit('page:activated', this)

        if (this.activatedTimes > 1 && (this.isKindaListsPage || this.hasRequiredReload)) {
            this.gracefulReload()
        }
    },
    deactivated () {
        console.log('base: deactivated: ', this)

        this.hasDeactivated = true
        this.deactivatedTimes++
        bus.$emit('page:deactivated', this)
    }
}

function decorate (func, decorator) {
    return function (...args) {
        return decorator.call(this, func || noop, ...args)
    }
}

// 获取引用的路径（忽略不同域名的）
let getReferPath = cached(function () {
    // 尝试去获取window.name中存储的页面referrer
    const refPrefix = "referrer:"
    const winName = window.name
    if (winName.substring(0, refPrefix.length) === refPrefix){
        return winName.substring(refPrefix.length)
    }

    let referrer = document.referrer
    if (!referrer) {
        return ''
    }

    let i
    let host = location.host
    if ((i = referrer.indexOf(host)) < 0) {
        return ''
    }

    return referrer.substring(i + host.length)
})
