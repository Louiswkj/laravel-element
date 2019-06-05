<template>
    <div :class="{'image-input': 1, multiple: multiple, 'fixed-width': width !== 'auto', 'reverse': reverseMode}">
        <div class="avatar-uploader"
             v-show="isUploaderVisible"
             :style="uploaderStyle">
            <label class="select-file"
                 @drop.prevent.stop="onDropFile"
                 @dragleave.prevent.stop="noop"
                 @dragenter.prevent.stop="noop"
                 @dragover.prevent.stop="noop"
                 style="display: block;width: auto;text-align: center;overflow:hidden">
                <div class="select-file-i" :style="{height: height}">
                    <div>
                        <slot>
                            <template v-if="drag">
                                <div class="el-upload-dragger" style="line-height: 1em;border:none;">
                                    <i class="el-icon-upload"></i>
                                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                    <div class="el-upload__tip" slot="tip">只能上传jpg/gif/png文件，且不超过{{maxSizeDesc}}</div>
                                </div>
                            </template>
                            <template v-else>
                                <i class="el-icon-plus avatar-uploader-icon"></i>
                            </template>
                        </slot>
                    </div>
                </div>
                <input type="file" class="file" ref="file" :multiple="multiple"
                     @change="onFileChange"/>
            </label>
        </div>

        <div class="previews" v-show="isPreviewsVisible" >
            <input type="file" class="file" ref="previewFile"
                 @change="onPreviewFileChange"/>
            <div v-for="preview in previews" :key="preview.id"
                 :class="{preview: true, uploading: !!preview.uploading, error: !!preview.error}" 
                 :style="uploaderStyle" >
                <template v-if="extractUrl(preview.value)">
                    <img class="avatar" :src="extractUrl(preview.value)"
                         :title="getPreviewTip(preview)"
                         @click="allowReplacePreview ? doReplacePreview($event, preview) : onClickPreview($event, preview)"
                         @load="onPreviewImageLoaded($event, preview)" />
                    <button type="button" class="btn-reset" title="删除"
                            @click="doRemovePreview($event, preview)" >&times;</button>
                    <div class="status" v-if="+!!preview.isUploaded | (+!!showRawSize & +!!preview.rawSize)">
                        <template v-if="preview.isUploaded">
                            上传成功
                        </template>
                        <template v-if="+!!showRawSize & +!!preview.rawSize">
                            <span class="raw-size">原始尺寸：{{preview.rawSize}}</span>
                        </template>
                    </div>
                </template>

                <template v-else-if="preview.uploading">
                    <div class="uploading-i" v-loading="true">
                        <img class="avatar" :src="preview.url" @load="onPreviewImageLoaded($event, preview)"/>
                    </div>
                    <div class="uploading-op">
                        <div>
                            正在上传...
                            <button type="button" class="btn-cancel"
                                    title="取消上传"
                                    @click="doCancelUpload($event, preview)">取消
                            </button>
                        </div>
                        <el-progress :stroke-width="4"
                                     :show-text="false"
                                     :percentage="preview.progress"></el-progress>
                    </div>
                </template>

                <template v-else>
                    <img class="avatar" :src="preview.url" @load="onPreviewImageLoaded($event, preview)"/>
                    <div class="error-w">
                        <div class="msg">{{preview.error || '上传失败'}}</div>
                        <div class="btns">
                            <div>
                                <button type="button" class="btn-upload"
                                        title="重新上传"
                                        @click="doRetryUpload($event, preview)">重试
                                </button>
                                <button type="button" class="btn-cancel"
                                        title="取消上传"
                                        @click="doCancelUpload($event, preview)">取消
                                </button>
                            </div>
                            <el-progress v-if="preview.progress > 0"
                                         :stroke-width="4"
                                         :show-text="false"
                                         :percentage="preview.progress"
                                         status="exception"></el-progress>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import env from '../common/env'
    import ajax from '../common/ajax'
    import formatError from '../common/format-error'
    import noop from '../common/noop'
    import deepEqual from 'deep-equal'
    import {parsePathOfUrl} from '../common/url-utils'
    import popEmit from '../mixins/pop-emit'
    import hosts from  '../config/hosts'

    // 分配previewId，防止key冲突
    const allocPreviewId = ((id) => () => ++id)(0)

    const DEFAULT_IMG_HOST = hosts.HOST_IMG_MAINAER

    // events:
    //
    // input(value) - 绑定v-model的输入事件，value是图片URL
    //
    // change(value) - 同input
    //
    // upload(e)  - 上传前触发
    //    参数：
    //    e.data  {FormData} 上传的表单内容
    //    e.file  {File}     上传的file对象
    //    e.preventDefault {Function} 取消上传
    //
    // success(e) - 上传成功的时候触发
    //    参数：
    //    e.data  {FormData} 上传的表单内容
    //    e.file  {File}     上传的file对象
    //    e.response {Object} 服务端返回的响应内容
    //    e.value {String}    服务端返回的图片URL
    //    e.preventDefault {Function} 取消采纳value，取消input与change事件
    //
    //
    // fail(e) - 上传失败的时候触发
    //    参数：
    //    e.data  {FormData} 上传的表单内容
    //    e.file  {File}     上传的file对象
    //    e.response {Object} 服务端返回的响应内容
    //    e.preventDefault {Function} 取消报错，同reset
    export default {
        mixins: [popEmit],
        props: {
            action: {
                type: String,
                default: `//${DEFAULT_IMG_HOST}/upload`
            },
            imageHost: {
                type: String,
                default: DEFAULT_IMG_HOST
            },
            value: {}, // multiple: Array<string>,  else: String
            maxSize: {
                type: Number,
                default: 512000 // 500k
            },
            acceptFileExts: {
                type: Array,
                default: () => ['.jpg', '.jpeg', '.gif', '.png']
            },
            height: {
                type: String,
                default: '200px'
            },
            width: {
                type: String,
                default: 'auto'
            },
            maxWidth: {
                type: String,
                default: '100%'
            },
            showRawSize: Boolean,
            allowReplacePreview: Boolean,
            drag: {
                type: Boolean,
                default: true,
            },
            //图片的尺寸
            acceptRawSize:{
                type:Array,
                default: () => ['auto']
            },

            //图片的比例
            acceptRawRatio:{
                type:Array,
                default: () => ['auto']
            },

            // 是否可以多个文件
            multiple: Boolean,

            // 是否上传
            autoUpload: {
                type: Boolean,
                default: true
            },

            // 最多多少个文件:
            maxFiles: {
                type: Number,
                default: 1000
            },

            // 是否反向排列 -- 默认是【上传】按钮在前，预览在后；reverse模式下相反
            reverseMode: {
                type: Boolean,
                default: false
            },

            // 是否使用完整URL -- 默认是【否】，即value只保留path部分
            fullUrlMode: {
                type: Boolean,
                default: false
            },

            // 从value中解析出URL
            extractUrl: {
                type: Function,
                default: function (value) {
                    if (!value) {
                        return ''
                    } else if (typeof value !== 'string') {
                        return value.url || ''
                    } else if (this.fullUrlMode) {
                        return value
                    } else {
                        let path = getPathOfUrl(value)
                        return `//${this.imageHost || DEFAULT_IMG_HOST}/${path}`
                    }
                }
            },

            // 从URL和文件中创建value
            compactUrl: {
                type: Function,
                default: function (url, file) {
                    if (this.autoUpload) {
                        if (this.fullUrlMode) {
                            return url
                        } else {
                            return getPathOfUrl(url)
                        }
                    } else {
                        file.url = url
                        return file
                    }
                }
            },

            // 预览图片的tip
            previewTip: {type: [Function, String], default: ''}
        },
        data () {
            return {
                // 所有的预览图片
                previews: [], // createPreviewObject {error, uploading, cancelUpload, url, value, uploaded, rawSize}
                replacingPreview: null // 正在替换文件的preview
            }
        },
        computed: {
            uploaderStyle () {
                if (this.width === 'auto') {
                    return {
                        height: this.height,
                        width: this.width,
                        'min-height': this.height,
                        'max-width': this.maxWidth
                    }
                } else {
                    return {
                        height: this.height,
                        width: this.width,
                        'min-height': '5em',
                        'max-width': this.maxWidth
                    }
                }
            },
            isUploaderVisible () {
                let {multiple, previews, maxFiles} = this
                return (multiple && (previews.length < maxFiles)) || (previews.length <= 0)
            },
            isPreviewsVisible () {
                let {previews} = this
                return previews && previews.length > 0
            },
            files () {
                return this.getFiles()
            },
            maxSizeDesc(){
                return humanizeSize(this.maxSize)
            }
        },
        methods: {
            /**
            * 当文件修改的时候...
            */
            onFileChange (e) {
//                console.log('file changed: ', e)
                let fileInput = e.target
                let files = fileInput.files

                for (let i = 0, n = files.length; i < n; i++) {
                    let preview = createPreviewObject({file: files[i]})
                    this.previews.push(preview)
                    preview.value = this.compactUrl('', preview.file)

                    this.uploadPreview(preview)

                    emitInputAndChangeEvent(this, this.calcPreviewedValue())
                }

                fileInput.value = '' // 清除掉input:file的值，防止change事件不再触发
            },
            /**
            * 当预览的文件修改的时候...
            */
            onPreviewFileChange (e) {
//                console.log('preview file changed: ', e)
                if (!this.replacingPreview) {
                    console.warn('No preview is replacing')
                    return
                }

                let fileInput = e.target
                this.replacingPreview.file = fileInput.files[0]

                this.replacingPreview.value = this.compactUrl('', null)

                this.uploadPreview(this.replacingPreview)

                emitInputAndChangeEvent(this, this.calcPreviewedValue())

                fileInput.value = ''  // 清除掉input:file的值，防止change事件不再触发
            },
            /**
            * 替换preview的文件
            */
            doReplacePreview (e, preview) {
                            // 模拟file输入框的click事件，重新选择文件
                this.replacingPreview = preview

                let fileInput = this.$refs.previewFile
                fileInput.click()
                fileInput.dispatchEvent(new window.Event('click'))
            },
            /**
             * 点击preview的事件
             */
            onClickPreview (e, preview){
                this.$emit('clickPreview', e, preview)
            },
            /**
            * 预览的图片加载的时候，记录原始尺寸
            */
            onPreviewImageLoaded (e, preview) {
                let target = e.target
                preview.rawSize = target.naturalWidth + 'x' + target.naturalHeight
                preview.naturalWidth = target.naturalWidth
                preview.naturalHeight = target.naturalHeight
                this.$emit('previewImageLoaded', e, preview)
            },
            /**
            * 移除某个preview
            */
            doRemovePreview (e, preview) {
                let found = this.previews.indexOf(preview)
                if (found < 0) {
                    console.error('What? preview not found!', preview, this)
                    return
                }

                this.previews.splice(found, 1)

                emitInputAndChangeEvent(this, this.calcPreviewedValue())
            },
            /**
            * 取消上传
            */
            doCancelUpload (e, preview) {
                if (preview) {
                    preview.cancelUpload()
                } else {
                    console.warn('No upload process exists!')
                }

                this.doRemovePreview(e, preview)
            },
            /**
            * 重试上传
            */
            doRetryUpload (e, preview) {
                this.uploadPreview(preview)
            },
            /**
            * 拖拽入文件
            */
            onDropFile (e) {
                e.preventDefault()

                let files = e.dataTransfer.files

                if (files.length <= 0) {
                    return false
                }

                for (let i = 0, n = files.length; i < n; i++) {
                    let preview = createPreviewObject({file: files[i]})
                    this.previews.push(preview)

                    preview.value = this.compactUrl('', preview.file)
                    emitInputAndChangeEvent(this, this.calcPreviewedValue())

                    this.uploadPreview(preview)
                }
            },
            /**
            * 上传文件 todo: 限制并发数量
            */
            uploadPreview (preview, next = noop) {
                let file = preview.file

                if (!file) {
                    console.warn('No file selected yet!')
                    return next()
                }

                preview.url = URL.createObjectURL(file)

                // 检查文件类型
                preview.error = this.checkFileExt(file)
                if (preview.error) {
                    return next()
                }

                // 检查文件大小
                preview.error = this.checkFileSize(file)
                if (preview.error) {
                    return next()
                }

                // 如果不用上传，则不上传
                if (!this.autoUpload) {
                    preview.value = this.compactUrl(preview.url, file)
                    emitInputAndChangeEvent(this, this.calcPreviewedValue())
                    return next()
                }

                // 按说是不会出现的： 居然还在上传？
                if (preview.uploading) {
                    preview.cancelUpload() // 先取消前一个上传
                }

                preview.uploading = true

                preview.cancelUpload = noop
                preview.remove = () => {
                    preview.cancelUpload()
    
                    let found = this.previews.indexOf(preview)
                    if (found < 0) {
                        console.error('What? preview not found!', preview, this)
                        return
                    }

                    this.previews.splice(found, 1)
                    emitInputAndChangeEvent(this, this.calcPreviewedValue())
                }

                let formData = new FormData()
                formData.append('file', file)

                let isCanceled = false
                let preventDefault = () => { isCanceled = true }

                this.$emit('upload', {
                    data: formData,
                    file: file,
                    preview: preview,
                    preventDefault
                })

                if (isCanceled) {
                    preview.uploading = false
                    return next()
                }

                let options = {
                    type: 'POST',
                    url: this.action,
                    data: formData,
                    onCreated: xhr => {
                        preview.cancelUpload = () => {
                            isCanceled = true
                            if (preview.uploading) {
                                preview.uploading = false
                                xhr.abort()
                            }
                        }
                    },
                    onUploadProgress: e => {
                        if (e.lengthComputable) {
                            preview.progress = +Math.max(0, Math.min(100, 100 * e.loaded / e.total)).toFixed(0)
                        }
                    }
                }

                ajax(options)
                    .then(res => {
                        preview.uploading = false

                        if (isCanceled) {
                            return next()
                        }
                        //检测图片高宽
                        preview.error  = this.checkFileRawSize(preview.rawSize)
                        if(preview.error ){
                            return next()
                        }

                        //检测图片尺寸
                        preview.error  = this.checkFileRawRatio(preview.naturalWidth,preview.naturalHeight)
                        if(preview.error ){
                            return next()
                        }


                        let value = res.fullUrl
                        this.$emit('success', {
                            data: formData,
                            file: file,
                            preview: preview,
                            response: res,
                            get value () {
                                return value
                            },
                            set value (v) {
                                value = v
                            },
                            preventDefault
                        })

                        if (isCanceled) {
                            return next()
                        }

                        preview.value = this.compactUrl(value, file)
                        preview.uploaded = true

                        emitInputAndChangeEvent(this, this.calcPreviewedValue())
                        return next()
                    })
                    .catch(err => {
                        preview.uploading = false

                        if (isCanceled) {
                            return next()
                        }

                        if (err && err.type === 'abort') {
                            return next()
                        }

                        this.$emit('fail', {
                            data: formData,
                            file: file,
                            preview: preview,
                            response: err,
                            preventDefault
                        })

                        if (isCanceled) {
                            return next()
                        }

                        preview.error = formatError(err)
                        return next()
                    })
            },
            /**
            * 检查文件大小
            * @param file {File}
            * @returns {string|null} 错误提示，没错返回null
            */
            checkFileSize (file) {
                if (file && file.size > this.maxSize) {
                    return `文件太大，请不要超过${humanizeSize(this.maxSize)}`
                }
            },
            /**
            * 检查文件后缀名
            * @param file {File}
            * @returns {string|null} 错误提示，没错返回null
            */
            checkFileExt (file) {
                if (!file || !file.name) {
                    return null
                }

                let acceptFileExts = this.acceptFileExts
                if (!acceptFileExts || acceptFileExts.length <= 0) {
                    return null
                }

                let error = '上传的文件类型不支持！支持的文件类型：' + acceptFileExts.join(', ')

                let fileExtPos = file.name.lastIndexOf('.')
                if (fileExtPos < 0) {
                    return error
                }

                let fileExt = file.name.substring(fileExtPos).toLowerCase()

                for (let i = 0, n = acceptFileExts.length; i < n; i++) {
                    if (acceptFileExts[i].toLowerCase() === fileExt) {
                        return null
                    }
                }

                return error
            },
            /**
             * 检查文件尺寸大小
             * @param size {string}
             * @returns {string|null} 错误提示，没错返回null
             */
            checkFileRawSize (size) {
                if (!size ) {
                    return null
                }

                let acceptFileRawSize = this.acceptRawSize

                if (!acceptFileRawSize || acceptFileRawSize.length <= 0 || acceptFileRawSize[0] === 'auto') {
                    return null
                }

                let error = '上传的图片尺寸不支持！支持的图片尺寸：' + acceptFileRawSize.join(', ')

                for (let i = 0, n = acceptFileRawSize.length; i < n; i++) {
                    if (acceptFileRawSize[i] == size) {
                        return null ;
                    }
                }
                return error
            },
            /**
             * 检查文件尺寸大小
             * @param size {string}
             * @returns {string|null} 错误提示，没错返回null
             */
            checkFileRawRatio (width,height) {
                if (!width || !height ) {
                    return null
                }

                let size =  (width / height).toFixed(2);

                let acceptFileRawRatio = this.acceptRawRatio

                if (!acceptFileRawRatio || acceptFileRawRatio.length <= 0 || acceptFileRawRatio[0] === 'auto') {
                    return null
                }

                let error = '上传的图片尺寸不支持！支持的图片比例：' + acceptFileRawRatio.join(', ')

                for (let i = 0, n = acceptFileRawRatio.length; i < n; i++) {
                    let ratio = acceptFileRawRatio[i].split(':');
                    let ratios = (ratio[0] /ratio[1]).toFixed(2);
                    if (ratios == size) {
                        return null ;
                    }
                }
                return error
            },
            /**
            * 计算预览的图片的值
            * @returns {Array<String>}
            */
            calcPreviewedValue () {
                let previews = this.previews
                if (this.multiple) {
                    return previews.map(x => x.error ? '' : x.value)
                } else {
                    const p0 = previews[0]
                    return (p0 && !p0.error && p0.value) || ''
                }
            },
            /**
            * 从value反推preview的值
            */
            updatePreviewsFromValue (val) {
                let curValue = (typeof val === 'undefined' ? this.value : val)
                let previewedValue = this.calcPreviewedValue()
//                console.log("Value updated to: %o   -- original: %o  this: %o", curValue, previewedValue, this)

                if (!deepEqual(curValue, previewedValue)) {
                    if (!curValue) {
                        this.previews.forEach(x => x.cancelUpload())
                        this.previews = []
                    } else if (this.multiple) {
                        if (!Array.isArray(curValue)) {
                            throw new TypeError('Value of multiple ImageInput must be an Array!')
                        }

                        this.previews = curValue.map(x => createPreviewObject({value: x}))
                    } else {
                        if (typeof this.extractUrl(curValue) !== 'string') {
                            throw new TypeError('Value of non-multiple ImageInput must be a String!')
                        }

                        this.previews = [createPreviewObject({value: curValue})]
                    }

//                    console.log("After update, this: %o, previews: %o", this, this.previews)
                    return true
                }
            },
            getFiles () {
                return this.previews.map(x => x.file)
            },
            noop () {
            },
            getPreviewTip(preview) {
                const previewTip = this.previewTip
                if (!previewTip){
                    return ''
                } else if (typeof previewTip === 'function'){
                    return previewTip.call(this, preview)
                } else {
                    return previewTip + ''
                }
            }
        },
        watch: {
            value (val) {
                this.updatePreviewsFromValue(val)
            }
        },
        mounted () {
            this.updatePreviewsFromValue()
        }

    }

    /**
     * 创建一个Preview的对象
     */
    function createPreviewObject (attributes = {}) {
        return {
            id: allocPreviewId(),
            file: null,
            error: null,
            uploading: false,
            cancelUpload: noop,
            url: '',
            value: '',
            uploaded: false,
            rawSize: '',
            progress: 0,
            ...attributes
        }
    }

    /**
     * 将大小转
     * @param size {Number}
     * @returns {string}
     */
    function humanizeSize (size) {
        if (size < 1024) {
            return size + 'B'
        } else if (size < 1024 * 1024) {
            return ((size / 1024).toFixed(1) + 'KB').replace('.0','')
        } else {
            return ((size / (1024 * 1024)).toFixed(1) + 'MB').replace('.0','')
        }
    }

    function getPathOfUrl (url) {
        return parsePathOfUrl(url)
    }

    /**
     * @param {ImageInput} $this 
     * @param {*} value
     */
    function emitInputAndChangeEvent($this, value) {
        $this.$emit('input', value)
        $this.$emit('change', value)
        $this.popEmit('ElFormItem', 'el.form.change', [value])
    }
</script>

<style scoped>
    .reverse {
        display: flex;
        flex-direction: column-reverse;
    }
    
    .avatar-uploader,
    .preview {
        display: block;
        border: 1px dashed;
        position: relative;
        min-width: 200px;
    }
    
    .avatar-uploader:hover {
        border-color: #42b983;
    }
    
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    
    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }
    
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100%;
        height: 200px;
        line-height: 200px;
        text-align: center;
    }
    
    .avatar {
        width: auto;
        max-width: 100%;
        height: 100%;
        display: block;
        margin: 0 auto;
    }
    
    .fixed-width .avatar {
        width: 100%;
        height: auto;
    }
    
    .select-file {
        cursor: pointer;
        display: block;
        border: none;
        padding: 0;
        margin: 0;
    }
    
    .select-file-i {
        display: flex;
        align-content: center;
        justify-content: center;
    }
    
    .file {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        background: transparent;
        color: transparent;
        width: 1px;
        height: 1px;
        border: none;
        z-index: 0;
        overflow: hidden;
        outline: none;
    }
    
    .btn-reset {
        position: absolute;
        top: -0.5em;
        right: -0.5em;
        color: #f00;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 1;
        width: 1em;
        height: 1em;
        line-height: 1em;
        text-align: center;
        padding: 0;
        margin: 0;
        font-size: 28px;
        border-radius: 1em;
    }
    
    .uploading-i {
        display: inline-block;
        height: 100%;
    }
    
    .uploading-op {
        position: absolute;
        width: 100%;
        bottom: 5px;
        z-index: 99999;
        text-align: center;
        font-size: 80%;
    }
    
    .error-w {
        color: #f00;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
    }
    
    .error-w .msg {
        position: absolute;
        max-width: 100%;
        word-break: break-word;
        overflow: hidden;
        text-align: center;
    }
    
    .error-w .btns {
        display: none;
    }
    
    .error-w:hover .btns {
        display: block;
    }
    
    .btns {
        position: absolute;
        bottom: 5px;
        width: 100%;
        text-align: center;
    }
    
    .btn-upload {
        color: #6eb62b;
    }
    
    .btn-upload,
    .btn-cancel {
        display: inline-block;
        width: 4em;
        text-align: center;
        padding: 5px 0;
        margin: 0;
        text-decoration: none;
        cursor: pointer;
        background: #fff;
        border: 1px solid;
    }
    
    .btn-cancel {
        color: #f05e08;
    }
    
    button:active {
        box-shadow: 1px 1px 5px #aaa inset;
    }
    
    .status {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        text-align: center;
    }


</style>
