
import Q from '../common'
import ajax from '../common/ajax'

import * as auth from '../services/auth'


export function recordClient(){
    if (sessionStorage.rc_done){
        return
    }

    const user = auth.getCurrentUser()
    const currentCity = auth.getCurrentCity()
    const message = `recordClient`
    const data = {
        userId: user && user.id,
        userName: user && user.username,
        userNickName: user && user.nickname,
        userPhone: user && user.phone,
        currentCity: currentCity && currentCity.name,
        userAgent: navigator && navigator.userAgent,
        screen: screen && `${screen.availWidth}x${screen.availHeight}`,
        winInner: `${window.innerWidth}x${window.innerHeight}`,
        winOuter: `${window.outerWidth}x${window.outerHeight}`,
    }

    ajax({
        method: 'POST',
        url: '/api/admin/auth/record',
        enctype: 'application/json',
        data: {data, message}
    })

    sessionStorage.rc_done = 1
}

