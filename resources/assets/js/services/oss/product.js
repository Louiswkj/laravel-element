/**
 * 楼盘相关接口的封装
 */

import Q from '@/common'
import Cache from '@/common/cache'
import toArray from '@/common/to-array'

/**
 * 查询所有楼盘基本信息
 * @returns {*|Promise}
 */
export function queryAll () {
    return Cache.remember('oss/product/all', () => (
                Q.post('/api/mainaeross/vservice/product/list')
                        .then(data => toArray(data))
                        .catch(e => { throw new Error('加载楼盘列表失败，' + Q.formatError(e)) })
        ))
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
