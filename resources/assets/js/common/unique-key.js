/**
 * 创建一个独一无二的key
 * @param prefix {String}  前缀
 * @returns {string}
 */
export default function (prefix = '') {
    return prefix + (+new Date()) + (Math.random() + '').replace(/\./g, '')
}
