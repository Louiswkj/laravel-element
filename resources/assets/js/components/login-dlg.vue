<template>
    <el-dialog :title="title" :visible="visible" ref="dlg"
                @close="onClose"
                custom-class="login-dlg"
                modal-class="login-dlg-w"
                :z-index="99999"
                :show-close="false"
                :close-on-press-escape="false"
                :close-on-click-modal="false" >
        <div>
            <LoginForm ref="loginForm" :canSelectCity="canSelectCity" @success="onLoginSuccess" ></LoginForm>
        </div>
    </el-dialog>
</template>

<script>
    import dlg from '../components/ajax-form-dlg'
    import LoginForm from '../components/login-form'

    export default dlg({
        components: {LoginForm},
        data () {
            return {
                title: '登录对话框',
                canSelectCity: false,
                data: {
                },
            }
        },
        methods: {
            beforeShow () {
                console.log('login dlg will show!')
            },
            shown () {
                console.log('login dlg shown!')
                this.$nextTick(() => {
                    this.$refs.loginForm.reset()
                })
            },
            onLoginSuccess(){
                this.hide()
                this.$emit('success')
                this.onSuccess()
            },
            onSuccess () {
                location.reload()
            }
        }
    })
</script>
<style>
    .login-dlg.el-dialog{
        background: transparent;
        border: none;
        box-shadow: none;
        width: 350px;
    }
    .login-dlg.el-dialog .el-dialog__header{
        display: none;
    }
</style>
