export default function cached (init) {
    let inited = null
    return function (options = {}) {
        let {cache = true} = options
        if (!inited || !cache) {
            inited = init(options)
        }

        return inited
    }
}
