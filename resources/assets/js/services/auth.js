/**
 * （后台）认证模块
 */

import bus from './bus'
import Q from '@/common'
import cached from '@/common/cached'
import {LocalCache as Cache} from '@/common/cache'
import {normalizePath, isPublicPage} from '@/router'
import {currentCity} from './city'
import extend from 'extend'
import forEach from 'lodash/each'
import spyFunc from '@/common/spy-func'
import dataGet from '@/common/data-get'
import * as pollAdminMsg from './poll-admin-msg'

const AUTH_INFO_CACHE_KEY = 'mainaer_admin_auth_info'
const E_NO_AUTHORIZED = 104

const getAuthInfo = (options) => {
    return Cache.remember(AUTH_INFO_CACHE_KEY, () => Q.get('/api/admin/auth/info', {city_id: ''}), options)
                .then(data => {
                    authInfo = data

                    extend(currentCity, getCurrentCity())

                    return data
                })
}

let authInfo = {}

pollAdminMsg.setMsgHandler('auth-updated', () => {
    console.warn("Auth updated, so do get auth info again.")
    getAuthInfo({cache: false})
        .then(() => {
            bus.$emit('nav-nodes-reload', {reason: 'auth-updated'})
            loadNavNodesTree({cache: false})
                        .then(nodesTree => {
                            bus.$emit('nav-nodes-changed', nodesTree)
                        })
        })
})

export function init (options) {
    return getAuthInfo(options)
                .catch(err => {
                    if (err && +err.status === E_NO_AUTHORIZED) {
                        if (/login$/.test(location.pathname)) {
                            authInfo.current_city = err.data.current_city
                            authInfo.all_cities = err.data.all_cities
                            extend(currentCity, getCurrentCity())

                            return Promise.resolve({})
                        } else {
                            return Q.reportError(err)
                        }
                    } else {
                        throw err
                    }
                })
}

export function login (data) {
    return Q.post('/admin/login', extend({_isAjax: 1}, data))
                .then(res => {
                    authInfo.current_admin_token = res.admin_token
                    // document.cookie = `admin_token=${res.admin_token};path=/`
                })
                .then(() => getAuthInfo({cache: false}))
}

export function logout () {
    return Q.post('/api/admin/logout', {admin_token: authInfo.current_admin_token})
                .then(() => {
                    Cache.set(AUTH_INFO_CACHE_KEY, null)
                    location.href = '/admin/login'
                })
}

export function isLogin () {
    return authInfo.current_admin_user && authInfo.current_admin_user.id
}

export function isNewPage (path) {
    path = path.replace(/^(\/admin\/)/g, '')
    if (path === '') {
        path = 'product/lists'
    }

    return !isOldPage(path)
}

export function isOldPage (path) {
    const oldPages = authInfo.old_pages
    if (!oldPages){
        return false
    }

    for (let pattern of oldPages){
        if (doesPathMatchPattern(path, pattern)){
            return true
        }
    }

    return false
}

function doesPathMatchPattern(path, pattern){
    if (path === pattern){
        return true
    }

    const re = compilePathPatternToRegex(pattern)
    return re.test(path)
}

const pathPatternRegexCache = {}
function compilePathPatternToRegex(pattern) {
    let re = pathPatternRegexCache[pattern]
    if (!re){
        re = new RegExp('^' + escapeRegexpText(pattern).replace(/\\\*/g, '.*') + '$')
        pathPatternRegexCache[pattern] = re
    }

    return re
}

function escapeRegexpText(s){
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


export const loadNavNodesTree = cached(() => {
    return init().then(data => {
        let menuTree = data.menu_tree
        let nodes = []

        // 转换数据格式
        let _convertNodes = (tree, nodes) => {
            if (!tree) {
                return
            }

            forEach(tree, (x) => {
                if (!x || !x.title) {
                    return
                }

                let node = {
                    id: x.id + '',
                    title: x.title + '',
                    link: x.url ? '/admin' + normalizePath(x.url) : '',
                    module: x.module + '',
                    children: []
                }

                nodes.push(node)

                _convertNodes(x.child, node.children)
            })
        }

        _convertNodes(menuTree, nodes)

        return nodes
    })
})

export function getToken () {
    return authInfo.current_admin_token
}

export function getCurrentUser () {
    return authInfo.current_admin_user
}

export function getUserName () {
    return authInfo.current_admin_user && authInfo.current_admin_user.nickname
}

export function getCurrentCity () {
    return authInfo.current_city
}

export function getAllCities () {
    return authInfo.all_cities
}

/**
 * 判断当前用户是否可以做某件事情
 */
export let canDo = spyFunc(function canDo (operation) {
    if (authInfo && authInfo.is_super_admin) {
        return true
    }

    operation = sanitizeName(operation)
    if (!operation ||
        operation === '/' ||
        operation === 'login' ||
        operation === 'logout' ||
        operation.substr(0, 2) === 'p_' || 
        /\/p_/.test(operation)) {
        return true
    }

    return !!(authInfo &&
                        authInfo.current_admin_user &&
                        authInfo.current_admin_user.operations_map &&
                        authInfo.current_admin_user.operations_map[operation])
}, 'canDo')

/**
 * 判断当前用户是否可以访问某某
 */
export let canVisit = spyFunc(function canVisit (path) {
    if (isPublicPage(path)) {
        return true
    }

    path = sanitizeName(path)

    let operation = (path + '').toLowerCase().replace(/^\/admin\/|^\/+|\/+$/g, '')
    if (canDo(operation)) {
        return true
    }

    // 特殊处理：如果是编辑页面，则替换成详情的权限
    let detailOp = operation.replace(/edit$/, 'detail')
    if (detailOp !== operation && canDo(detailOp)) {
        return true
    }

    // 此外，特殊的页面会有特殊的权限：
    let specialOpArr = getRequiredOperationsByPage(path)
    if (specialOpArr && specialOpArr.length){
        for (let specialOp of specialOpArr){
            if (specialOp &&
                    specialOp !== operation &&
                    specialOp !== detailOp &&
                    canDo(specialOp)) {
                return true
            }
        }
    }

    return false
}, 'canVisit')

/**
 * 根据页面路径获取所需要的操作权限
 */
function getRequiredOperationsByPage (path) {
    const map = authInfo && authInfo.urls
    const objPath = sanitizeName(path).replace(/^\/|\/$/g, '').split('/').filter(x => !!x).concat(['@'])
    const op = dataGet(map, objPath)
    if (!op) {
        return null
    }

    if (Array.isArray(op)){
        return op
    }

    if (typeof op === 'string'){
        return [op]
    }

    console.warn(`Invalid type of op for "${pat}": %o`, op)

    return null
}

/**
 * 根据页面路径来查找页面标题
 * @param {string} path 
 * @return {string}
 */
export function getPageTitleByPath(path){
    path = sanitizeName(path)
    if (!path) {
        return ''
    }

    if (!authInfo) {
        return ''
    }

    let foundTitle = ''

    let _find = (nodes, level=1, parent=null) => {
        if (!nodes || !nodes.length) {
            return
        }

        for (let i = 0, n = nodes.length; i < n; i++){
            let x = nodes[i]
            if (x.url && sanitizeName(x.url) === path) {
                if (level >= 3 && parent){
                    foundTitle = x.title + parent.title || ''
                } else {
                    foundTitle = x.title
                }
                return false
            }

            if (x.child && _find(x.child, level + 1, x) === false){
                return false
            }
        }

    }

    _find(authInfo.menu_tree)

    return foundTitle
}

/**
 * 净化名称
 */
function sanitizeName (name) {
    return (name + '').replace(/-/g, '').toLowerCase()
}

bus.$on('login', () => {
    bus.$emit('nav-nodes-reload', {reason: 'login'})

    loadNavNodesTree({cache: false})
                .then(nodesTree => {
                    bus.$emit('nav-nodes-changed', nodesTree)
                })
})

export function getFirstAccessibleMenuPageUrl(){
    return loadNavNodesTree()
        .then(tree => {
            const find = (nodes) => {
                return nodes[0] && (find(nodes[0].children || []) || nodes[0].link)
            }

            return find(tree)
        })
}
