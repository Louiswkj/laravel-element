import bus from '../services/bus'

export default function (content, title) {
    if (bus && bus.$confirm) {
        return bus.$confirm(content, title || '请确认').then(x => x && x.value || true)
    }

    return new Promise((resolve, reject) => {
        if (window.confirm(title + '\n' + content)) {
            resolve(content)
        } else {
            reject(content)
        }
    })
}
