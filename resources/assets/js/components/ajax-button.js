import {request} from '../common/ajax'
import reportError from '../common/report-error'
import noop from '../common/noop'
import deepCopy from './deep-copy'
import deleteKeys from '../common/delete-keys'

// Ajax提交按钮
// events:
//
// @submit({target, data, preventDefault()})
// - 提交ajax前触发
// - target是本VUE组件实例
// - data是提交的数据（可以修改）
// - preventDefault()可以用来阻止提交
//
// @success({target, data, response, preventDefault()})
// - ajax成功后触发
// - target是本VUE组件实例
// - data是提交的数据
// - response是ajax响应的data字段
// - preventDefault()可以用来阻止默认行为（默认是刷新页面或导航到下一个页面）
//
// @fail({target, data, response, preventDefault()})
// - ajax失败后触发
// - target是本VUE组件实例
// - data是提交的数据
// - response是ajax响应的内容（JSON）
// - preventDefault()可以用来阻止默认行为（默认是通用的reportError）
//
export default {
    props: {
                // ajax的方法，默认POST
        method: {
            type: String,
            default: 'POST'
        },
                // ajax的URL
        url: {
            type: String,
            isRequired: true
        },
                // 要提交的数据
        data: {
            type: [Object, String],
            default: () => ({})
        },
                // 提交前的确认对话框内容（如果没有则没有确认对话框）
        confirm: {
            type: String,
            default: ''
        },
                // 使用什么tag，默认使用el-button
        tagName: {
            type: String,
            default: 'el-button'
        },

                // 是否在提交的时候显示加载动画
        submittingAnimation: {
            type: Boolean,
            default: true
        },

                // 提交的时候的加载文本
        submittingStatusText: {
            type: String,
            default: '正在提交...'
        },

                // 集成el-button的属性
        type: String,
        disabled: Boolean,
        plain: Boolean
    },
    data () {
        return {
            isSubmitting: false
        }
    },
    render (h) {
        return (
            h(this.tagName,
                // props:
                {
                    props: {
                        ...deleteKeys(deepCopy(this.$props), ['tagName', 'method', 'url', 'confirm', 'submittingAnimation', 'submittingStatusText'])
                    },
                    attrs: {
                        'element-loading-text': this.submittingStatusText
                    },
                    on: {
                        click: this.onClick
                    },
                    directives: [
                        {
                            name: 'loading',
                            value: this.isSubmitting && this.submittingAnimation,
                            modifiers: {body: true, fullscreen: true, lock: true}
                        }
                    ]
                },
                // children
                this.$slots.default
            )
        )
    },
    methods: {
        onClick (e) {
            this.submit()

            e.preventDefault()
            e.stopPropagation()
            return false
        },
        submit () {
            let data = deepCopy(this.data)
            let submit = () => {
                let isCanceled = false
                let preventDefault = () => {
                    isCanceled = true
                    this.isSubmitting = false
                }

                let target = this

                this.isSubmitting = true
                this.$emit('submit', {
                    target,
                    get data () {
                        return data
                    },
                    set data (val) {
                        data = val
                    },
                    preventDefault
                })

                if (isCanceled) {
                    return
                }

                request(this.method, this.url, data)
                    .then(response => {
                        isCanceled = false
                        this.isSubmitting = false

                        this.$emit('success', {
                            target,
                            data,
                            preventDefault,
                            response
                        })

                        if (isCanceled) {
                            return
                        }

                        if (response && response.nextUrl) {
                            window.location.href = response.nextUrl
                        } else {
                            window.location.reload()
                        }
                    })
                    .catch(err => {
                        isCanceled = false
                        this.isSubmitting = false

                        this.$emit('fail', {
                            target,
                            data,
                            preventDefault,
                            response: err
                        })

                        if (isCanceled) {
                            return
                        }

                        reportError(err)
                    })
            }

            if (this.confirm) {
                this.$confirm(this.confirm, '请确认').then(submit, noop)
            } else {
                submit()
            }
        }
    }

}
