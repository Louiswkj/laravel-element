
/**
 * 加载一个脚本
 * @param scriptUrl {string} 脚本的URL
 * @param options {{amd:bool,timeout:Number}}
 *  - amd: 是否使用AMD的方式加载，默认不使用AMD
 *  - timeout: 超时时间(ms)，默认10秒钟
 * @return {Promise} 一个是否完成加载的Promise -- resolve(amdModule|scriptTag)
 */
export default function loadScript (scriptUrl, options) {
    let {timeout = 60000} = options || {}

    if (scriptUrl instanceof one ||
                scriptUrl instanceof parallel ||
                scriptUrl instanceof serial) {
        return scriptUrl.exec(options)
    }

    return new Promise(function (resolve, reject) {
        var head = document.getElementsByTagName('head')[0]
        if (!head) {
            reject(new Error('Cannot find head element!'))
        }

                // create a script tag and append it to head
        var scriptTag = document.createElement('script')
        scriptTag.onload = scriptTag.onreadystatechange = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                resolve(scriptTag)

                                // avoid memory leak in IE
                scriptTag.onload = scriptTag.onreadystatechange = null
            }
        }

        scriptTag.onerror = reject
        scriptTag.src = scriptUrl
        setTimeout(() => reject(new Error('Timeout when loading script ' + scriptUrl)), timeout)

        if (head.appendChild) {
            head.appendChild(scriptTag)
        }
    })
}

/**
 * 运行加载脚本
 */
export let exec = loadScript

/**
 * 加载一个脚本
 * @param scripts
 * @returns {one}
 */
function One (script) {
    if (!(this instanceof One)) {
        return new One(script)
    }

    this.exec = function (options) {
        return loadScript(script, options)
    }

    return this
}

export let one = One

/**
 * 定义并行加载（多个脚本）
 * @param scripts
 * @returns {parallel}
 */
function Parallel (scripts) {
    if (!(this instanceof Parallel)) {
        return new Parallel(scripts)
    }

    this.exec = function (options) {
        return Promise.all(scripts.map(x => loadScript(x, options)))
    }

    return this
}

export let parallel = Parallel

/**
 * 定义串行加载脚本对象
 * @param scripts
 * @returns {serial}
 */
function Serial (scripts) {
    if (!(this instanceof Serial)) {
        return new Serial(scripts)
    }

    this.exec = function (options) {
        let result = Promise.resolve()

        scripts.forEach(x => {
            result = result.then(() => loadScript(x, options))
        })

        return result
    }

    return this
}

export let serial = Serial
