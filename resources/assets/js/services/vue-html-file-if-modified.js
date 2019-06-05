/*
 * 判断vue文件是否有修改，如果有修改则应该及时刷新页面 
 */

 import * as pollAdminMsg from './poll-admin-msg'

// 是否有修改的标志
let vueHtmlFileHasModified = false

export function hasModifiedVueHtmlFile(){
    return vueHtmlFileHasModified
}

// 定时轮询并更新是否修改了
export function start(){
    pollAdminMsg.setMsgHandler('vue-file-updated', () => {
        vueHtmlFileHasModified = true
    })
    pollAdminMsg.start()
}
