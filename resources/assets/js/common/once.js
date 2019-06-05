/**
 * init something only once
 * @param {function} init () => {*}
 */
export default function (init) {
    let inited = false
    let initResult = null
    return function (...args) {
        if (!inited) {
            inited = true
            initResult = init.apply(this, args)
        }

        return initResult
    }
}
