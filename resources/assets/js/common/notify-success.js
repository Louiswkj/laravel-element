import bus from '../services/bus'


export default function (msg, title) {
    return bus.$notify({
        title: title || '提示',
        message: msg,
        type: 'success'
    })
}
