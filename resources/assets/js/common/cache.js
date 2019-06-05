import extend from './extend'

export const LocalCache = new Cache('local')
export const SessionCache = new Cache('session')
export const MemCache = new Cache('mem')

/**
 * 缓存
 * @param type
 * @returns {Cache}
 * @constructor
 * @method get(key, defaultValue) => any
 * @method set(key, value) => void
 * @method remember(key, loader, options) => Promise
 */
export default function Cache (type = 'mem') {
    if (!(this instanceof Cache)) {
        if (type === 'session') {
            return SessionCache
        } else if (type === 'local') {
            return LocalCache
        } else {
            return MemCache
        }
    }

    if (!type || typeof type === 'string') {
        if (type === 'session') {
            this.provider = window.sessionStorage
        } else if (type === 'local') {
            this.provider = window.localStorage
        } else {
            this.provider = {
                d: {},
                getItem: function (key) {
                    return this.d[key]
                },
                setItem: function (key, data) {
                    this.d[key] = data
                }
            }
        }
    } else if (typeof type.getItem === 'function' && typeof type.setItem === 'function') {
        this.provider = type
    } else {
        throw new Error('Invalid cache provider: ' + type)
    }

    this.loadings = {}

    return this
}

extend(Cache.prototype, {
        /**
         * 获取缓存内容
         * @param key
         * @param defaultValue
         * @returns {*}
         */
    get (key, defaultValue = null) {
        try {
            return JSON.parse(this.provider.getItem(stringifyKey(key))) || defaultValue
        } catch (e) {
            return defaultValue
        }
    },
        /**
         * 设置缓存内容
         * @param key
         * @param data
         */
    set (key, data) {
        this.provider.setItem(stringifyKey(key), JSON.stringify(data))
    },
        /**
         * 删除一条缓存内容
         * @param key
         * @param data
         */
    del (key) {
        this.provider.setItem(stringifyKey(key), null)
    },
        /**
         * 查找key或者记住key
         * @param key {String}
         * @param loader {Function}
         * @param options {{cache: true/false, timeout: number}}
         * @returns {Promise}
         */
    remember (key, loader, {cache = true, timeout = 30000} = {}) {
        try {
            let data, proc

            key = stringifyKey(key)

            if (cache && (data = this.get(key))) {
                return Promise.resolve(data)
            }

            proc = this.loadings[key]
            if (proc) {
                return proc
            }

            return wrapTimeoutablePromise(loader, timeout).then(data => {
                this.loadings[key] = null
                this.set(key, data)
                return data
            }, e => {
                this.loadings[key] = null
                throw e
            })
        } catch (e) {
            this.loadings[key] = null
            return Promise.reject(e)
        }
    }
})

extend(Cache, {
    get: MemCache.get.bind(MemCache),
    set: MemCache.get.bind(MemCache),
    del: MemCache.del.bind(MemCache),
    remember: MemCache.remember.bind(MemCache)
})

/**
 * 将key转换为字符串
 * @param key
 * @returns {*}
 */
function stringifyKey (key) {
    switch (typeof key) {
        case 'string':
            return key
        case 'object':
            return JSON.stringify(key)
        default:
            return key + ''
    }
}

/**
 * 包装成一个可以超时的Promise
 * @param loader {Function}
 * @param timeout {Number}
 * @param timeoutMsg {String}
 * @returns {Promise}
 */
function wrapTimeoutablePromise (loader, timeout, timeoutMsg = 'timeout after {time}') {
    try {
        if (!timeout || timeout <= 0) {
            return Promise.resolve(loader.call())
        } else {
            return new Promise((resolve, reject) => {
                let done = false
                let start = +new Date()
                let timer = setTimeout(() => {
                    if (!done) {
                        done = true
                        reject(new Error(timeoutMsg.replace(/\{time\}/g, ((+new Date() - start) / 1000).toFixed(2) + 's')))
                    }
                }, timeout)

                try {
                    Promise.resolve(loader.call())
                                                .then(data => {
                                                    if (!done) {
                                                        done = true
                                                        clearTimeout(timer)
                                                        resolve(data)
                                                    }
                                                })
                                                .catch(e => {
                                                    if (!done) {
                                                        done = true
                                                        clearTimeout(timer)
                                                        reject(e)
                                                    }
                                                })
                } catch (e) {
                    if (!done) {
                        done = true
                        clearTimeout(timer)
                        reject(e)
                    }
                }
            })
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
