import Q from '@/common'
import Cache from '@/common/cache'
import forEach from 'lodash/each'

/**
 * 加载用户列表
 * @param params
 */
export function queryUserList (params) {
    return Q.get('/api/mainaeross/vservice/user/list', params)
}

/**
 * 加载用户资料选项列表
 * @returns {*|Promise}
 */
export function queryUserParams() {
    return Cache.remember('user/params', () => (
            Q.get('/api/mainaeross/vservice/userparam')
                .catch(e => {
                    throw new Error('加载用户资料选项列表失败，' + Q.formatError(e))
                })
        ))
}

export function queryUserParamsWithNoData() {
    return queryUserParams().then(data => {
        const options = {}
        forEach(data, (items, field) => {
            switch (field){
                case 'purchaseregion':
                case 'buylist':
                case 'demandlist':
                case 'knowwaylist':
                case 'nolookreason':
                case 'nofixreason':
                    items = (items || []).map(x => x.title).concat(['无数据'])
                    if (field === 'knowwaylist'){
                        items = sortSourceOptions(items)
                    }
                    break
                case 'level':
                case 'daililevel':
                    items = (items || []).map(x => ({val: x.key, label: x.val}))
                    break
                default:
                    break
            }
            
            options[field] = items
        })
        return options
    })
}

const PreservedSourceOptions = [
    '线上直约',
    // '转介绍',
    // '社开',
    '400电话',
    // '线上咨询',
    '自拓',
    '其他',
]

/**
 * @param {Array<string|{val:string,label:string}>} options 
 * @return {Array<string|{val:string,label:string}>}
 */
export function sortSourceOptions(options){
    const r = PreservedSourceOptions.slice(0)

    for (let x of options){
        switch (typeof x){
            case 'string':
                if (!x){
                    r.splice(0, 0, '')
                } else if (r.indexOf(x) < 0){
                    r.push(x)
                }
                break
            case 'object':
                if (x && !x.val){
                    r.splice(0, 0, x)
                } else if (x && r.indexOf(x.label) < 0){
                    r.push(x)
                }
                break
            default:
                break
        }
    }

    return r
}
