/**
 * 分析师相关接口的封装
 */
import Q from '@/common'
import Cache from '@/common/cache'
import toArray from '@/common/to-array'

// const TYPE_ZHIXIAO = '0'
const TYPE_FENXIAO = '8'

/**
 * 查询所有分析师信息
 * @returns {*|Promise}
 */
export function queryAll () {
    return Cache.remember('assistant/all', () => (
                Q.post('/api/mainaeross/vservice/assis/all')
                        .then(data => toArray(data))
                        .catch(e => {
                            throw new Error('加载分析师列表失败，' + Q.formatError(e))
                        })
        ))
}
/**
 * 查询所有分析师信息，并转化为[{id,title}]的形式
 * @returns {Promise.<TResult>}
 */
export function queryAllAsOptions () {
    return queryAll().then(list => (
                list.map(x => ({id: x.aid + '', title: x.vchEmpname, type: x.vchJobtype + ''}))
        ))
}

/**
 * 查询所有分销分析师信息，并转化为[{id,title}]的形式
 * @returns {Promise.<TResult>}
 */
export function queryAllFenxiaoAsOptions () {
    return queryAllAsOptions().then(list => (
                list.filter(x => x.type === TYPE_FENXIAO)
        ))
}

/**
 * 查询所有直销分析师信息，并转化为[{id,title}]的形式
 * @returns {Promise.<TResult>}
 */
export function queryAllZhixiaoAsOptions () {
    return queryAllAsOptions().then(list => (
                list.filter(x => x.type !== TYPE_FENXIAO)
        ))
}

/**
 * 根据分析师查询经济公司信息，并转化为[{id,title}]的形式
 * @returns {Promise.<TResult>}
 */
export function queryDistributionsOptionsByAid (aid) {
    return Q.ajax({method: 'POST', url: '/api/mainaeross/vservice/fenxiao/listbyaid', data: {aid: aid}, cache: true})
                .then(data => (
                        toArray(data).map(x => ({
                            id: x.id + '',
                            title: x.distributionname + ''
                        }))
                ))
                .catch(e => {
                    throw new Error('加载经济公司列表失败，' + Q.formatError(e))
                })
}

export async function queryDailiAssAsOptions({pid}){
    return Q.ajax({method: 'GET', url: '/api/mainaeross/vservice/daili/assis/all', data: {prefix: pid}, cache: true})
            .then(data => (
                toArray(data).map(x => ({ id: x.aid + '', title: x.vchEmpname + '' }))
            ))
            .catch(e => {
                throw new Error('加载代理楼盘的分析师列表失败，详细原因：' + Q.formatError(e))
            })
}

/**
 * 加载直销、分销或代理楼盘的顾问列表
 * @returns {Promise<Array<{id,title}>>}
 */
export async function loadDlpAssOptions({dlp}){
    if (dlp === 'zx') {
        return queryAllZhixiaoAsOptions()
    } else if (dlp === 'fx') {
        return queryAllFenxiaoAsOptions()
    } else if (dlp && dlp[0] === 'p') {
        return queryDailiAssAsOptions({pid: dlp.substring(1)})
    } else {
        return []
    }
}
