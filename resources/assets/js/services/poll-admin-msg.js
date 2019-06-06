
import ajax from '../common/ajax'

var params = {
    vue_mtime: 0,
    auth_mtime: nowTimestamp(),
}

var msgHandlers = {}
window.mainaerAdminMsgHandlers = msgHandlers

var failIntervalMsMin = 500
var failIntervalMsMax = 10000
var failIntervalMs = failIntervalMsMin

var started = false

export function start(){
    if (!started){
        started = true
        params.vue_mtime = +new Date(window.MAINAER_VUE_FILE_LAST_MODIFIED_AT) || nowTimestamp()
        doPoll()
    }
}

function doPoll(){
    if (process.env.NODE_ENV === 'development'){
        return
    }

    ajax({
        type: 'GET',
        url: `//${location.hostname}:8010/msg`,
        data: params,
    }).then(data => {
        failIntervalMs = failIntervalMsMin
        setTimeout(doPoll, 0)

        if (!data || !data.type){
            return
        }
        
        if (data.type === 'vue-file-updated'){
            params.vue_mtime = +data.timestamp || nowTimestamp()
        } else if (data.type === 'auth-updated'){
            params.auth_mtime = +data.timestamp || nowTimestamp()
        }

        if (msgHandlers[data.type]){
            msgHandlers[data.type](data)
        }
    }, e => {
        setTimeout(doPoll, failIntervalMs)
        failIntervalMs = Math.min(failIntervalMs * 2, failIntervalMsMax)
    })
}

export function setMsgHandler(type, handler){
    msgHandlers[type] = handler
}

function nowTimestamp(){
    return (+new Date()) / 1000
}

