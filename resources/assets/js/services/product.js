/**
 * 楼盘相关接口的封装
 */

import Q from '@/common'
import Cache from '@/common/cache'
import toArray from '@/common/to-array'

export function refreshCaches () {
    queryAll({cache: false})
}

/**
 * 查询所有楼盘基本信息
 * @returns {*|Promise}
 */
export function queryAll ({cache = true} = {}) {
    const load = () => (
        Q.get('/api/admin/product/all')
            .then(data => toArray(data))
            .catch(e => { throw new Error('加载楼盘列表失败，' + Q.formatError(e)) })
    )
    return Cache('mem').remember('product/all', load, {cache})
}

/**
 * 查询所有楼盘基本信息, 并转化为[{id,title}]的形式
 * @returns {Promise.<TResult>}
 */
export function queryAllAsOptions () {
    return queryAll()
                .then(list => (
                        list.map(x => ({id: x.id + '', title: x.title + ''}))
                ))
}

/**
 * 根据楼盘ID获取标题
 * @param {*} id
 * @param {*} param1
 */
export function queryTitleById (id, {cache = true} = {}) {
    return queryAll({cache})
        .then(list => {
            for (let item of list) {
                if (item && +item.id === +id) {
                    return item.title
                }
            }

            throw new Error(`未找到楼盘#${id}`)
        })
        .catch(e => { throw new Error(`根据楼盘ID(${id})获取标题失败，详细信息：` + Q.formatError(e)) })
}

/**
 * 根据楼盘ID获取详情
 * @param {*} id
 * @param {*} param1
 */
export function queryDetailById (id, {cache = true} = {}) {
    return Q.get('/api/admin/product/detail',{id:id})
        .then(list => {
            return list.basic
        })
        .catch(e => { throw new Error(`根据楼盘ID(${id})获取标题失败，详细信息：` + Q.formatError(e)) })
}

/**
 * @return {Promise<Array<{id:number,title:string}>>}
 */
export function queryDailiProducts(){
    return Q.get('/api/mainaeross/vservice/daili/product/list')
            .then(list => Q.toArray(list))
}
