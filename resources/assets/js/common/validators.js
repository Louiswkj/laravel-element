/* 是否是邮箱*/
export function isEmail(rule,value,callback) {
    const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    let res = reg.test(value.trim());
    if (!res) {
        return callback(new Error('输入邮箱式不正确'));
    }
    return callback();
}

/**手机号码验证 */
export function isPhone(rule, value, callback){
    const reg = /^1\d{10}$/;
    let res = reg.test(value.trim());
    if (!res) {
        return callback(new Error('输入手机号格式不正确'));
    }
    return callback();
}

/**判断时间是否小于当前时间*/
export function timeLtNow(rule,value,callback){
    let n = new Date();
    let v = new Date(value);
    if(n>v){
        return callback(new Error('设置时间不能早于当前时间'));
    }
    return callback();
}