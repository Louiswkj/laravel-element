import ajax from '../common/ajax'
import reportError from '../common/report-error'
import noop from '../common/noop'
import alert from '../common/alert'
import deepCopy from 'deep-copy'

// Ajax提交的表单
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
            type: String
        },
        // ajax的URL (url和acton务必提供一个)
        action: {
            type: String
        },
        // 要提交的主要数据
        model: {
            type: Object,
            default: () => ({})
        },
        // 要提交的(额外的)数据，会覆盖model
        data: {
            type: Object,
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
            default: 'el-form'
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

        submittingAnimationFullscreen: {
            type: Boolean,
            default: false,
        },

        // 表单数据的编码方式，可选值：
        // - default
        // - application/x-www-form-urlencoded
        // - application/json
        // - text/json
        // - multipart/form-data
        enctype: {
            type: String,
            default: ''
        },

        // 执行的ajax函数(无this，请自行绑定this)
        ajax: {
            type: Function,
            default: ajax
        },

        // 集成el-form的属性
        type: String,
        disabled: Boolean,
        plain: Boolean,
        rules: Object,
        inline: Boolean,
    },
    data () {
        return {
            isSubmitting: false
        }
    },
    render (h) {
        // console.log("!!!!isSubmitting: %o, loading: %o", this.isSubmitting, this.isSubmitting && this.submittingAnimation)
        return (
            h(this.tagName,
                // props:
                {
                    props: {
                        ...this.$props,
                        tagName: null,
                        method: null,
                        url: null,
                        confirm: null,
                        data: null
                    },
                    attrs: {
                        'element-loading-text': this.submittingStatusText
                    },
                    domProps: {
                    },
                    nativeOn: {
                        submit: this.onSubmit
                    },
                    directives: [
                        {
                            name: 'loading',
                            value: this.isSubmitting && this.submittingAnimation,
                            modifiers: { 
                                body: false,
                                lock: true,
                                fullscreen: this.submittingAnimationFullscreen,
                            }
                        }
                    ],
                    ref: 'form'
                },
                // children
                this.$slots.default
            )
        )
    },
    methods: {
        onSubmit (e) {
            e.preventDefault()
            e.stopPropagation()

            try {
                this.submit()
            } catch (e) {
                console.error(e)
            }

            return false
        },
        submit () {
            if (this.isSubmitting) {
                console.warn('Form is already in submitting process. Do not repeate yourself!')
                return
            }

            let data = { ...deepCopy(this.model), ...deepCopy(this.data) }
            let ajaxUrl = this.url || this.action
            let ajaxMethod = this.method

            console.log(`submit ${ajaxMethod} ${ajaxUrl} `, data)

            let _submit = () => {
                try {
                    if (this.isSubmitting) {
                        console.warn('Form is already in submitting process. Do not repeate yourself!')
                        return
                    }

                    let isCanceled = false
                    let preventDefault = () => { isCanceled = true }
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
                        this.isSubmitting = false
                        return
                    }

                    let runAjax = this.ajax || ajax
                    runAjax({
                        type: ajaxMethod,
                        url: ajaxUrl,
                        data: data,
                        dataType: 'json',
                        enctype: this.enctype
                    })
                        .then(response => {
                            this.isSubmitting = false
                            isCanceled = false

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
                            this.isSubmitting = false
                            isCanceled = false

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
                } catch (e) {
                    this.isSubmitting = false
                    throw e
                }
            }

            let _confirmAndSubmit = () => {
                if (this.confirm) {
                    this.$confirm(this.confirm, '请确认').then(_submit, noop)
                } else {
                    _submit()
                }
            }

            // 如果有验证规则，则验证后再提交
            if (this.rules) {
                this.validate(valid => {
                    if (!valid) {
                        alert('请检查红色报错字段，查正后再提交。', '出错啦')
                        console.log('Form validation failed.')
                        setTimeout(() => {
                            try {
                                let errorFormItem = this.$el.querySelector('.el-form-item.is-error')
                                if (errorFormItem) {
                                    errorFormItem.scrollIntoViewIfNeeded()
                                }
                            } catch (e) {
                                console.warn('failed to focus on error field.')
                            }
                        }, 20)
                        return false
                    }

                    _confirmAndSubmit()
                })
            } else {
                _confirmAndSubmit()
            }
        },
        validate (cb) {
            return this.$refs.form.validate(cb)
        },
        validateField (prop, cb) {
            return this.$refs.form.validateField(prop, cb)
        },
        resetFields () {
            this.isSubmitting = false
            return this.$refs.form.resetFields()
        }
    }

}
