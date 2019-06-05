
import once from './once'

export default function(loader, errHandler){
    let loadOptionsOnce
    if (typeof loader === 'function'){
        loadOptionsOnce = once(async () => await loader())
    } else {
        loadOptionsOnce = once(async () => {
            const options = {}

            for (let k in loader){
                if (loader.hasOwnProperty(k)){
                    options[k] = loader[k]()
                }
            }

            for (let k in options) {
                if (options.hasOwnProperty(k)){
                    try {
                        options[k] = await options[k]
                    } catch (e) {
                        console.warn("failed to load %s option: %o", k, e)
                        if (errHandler){
                            errHandler(e, k, options, loader)
                        }
                    }
                }
            }
            return options
        })
    }

    return (field) => {
        if (field) {
            return loadOptionsOnce()
                    .then(options => (options && options[field]) || [])
        }
        return loadOptionsOnce()
    }
}