import bus from '../services/bus'

export default function (content, title) {
    if (bus && bus.$alert) {
        title = title || '提示'
        return bus.$alert(content, title).catch(e => { console.error(e) })
    }

    return new Promise((resolve, reject) => {
        window.alert(title + '\n' + content)
        resolve(content)
    })
}
