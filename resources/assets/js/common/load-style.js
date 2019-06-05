/**
 * 加载一个CSS文件
 * @param cssUrl {string} css文件的URL
 * @param options {{}}
 *  - atHead {bool} 是否在开头插入，默认是false
 * @returns {Element}
 */
export default function (cssUrl, options) {
    let {atHead = false} = options || {}

        // 创建link元素
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = cssUrl

        // 插入到DOM中
    var head = document.getElementsByTagName('head')[0]
    if (atHead) {
        head.insertAdjacentElement('afterbegin', link)
    } else {
        head.appendChild(link)
    }

    return link
}
