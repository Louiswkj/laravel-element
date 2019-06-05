import {Loading} from 'element-ui'
export default async function performLoading(action, loadFunc, options){
    // allow empty action
    //    performLoading(loadFunc, options)
    // or performLoading(options, loadFunc)
    if (typeof action !== 'string'){
        [action, loadFunc, options] = ['加载', action, loadFunc]
    }

    // allow performLoading(action, options, loadFunc)
    if (typeof loadFunc === 'object' && typeof options === 'function'){
        [loadFunc, options] = [options, loadFunc]
    }

    const loading = Loading.service({
        target: '.site-main',
        fullscreen: false,
        lock: true,
        text: "正在" + action + "...",
        ...options,
    })

    const closeLoading = () => setTimeout(() => loading.close())

    try {
        const res = await loadFunc()
        closeLoading()
        return res
    } catch (e){
        closeLoading()
        throw e
    }
}

