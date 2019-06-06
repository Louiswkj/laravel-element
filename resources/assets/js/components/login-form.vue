<template>
    <div class="login-form" v-loading.lock="isSubmitting" element-loading-text="正在登录..."  >
        <form action="/admin/login" method="post" @submit="onSubmit">
            <h3 class="welcome">
                <img class="login-logo" src="../assets/login_logo.png" alt="[LOGO]" /> 买哪儿管理平台
            </h3>
            <div class="item-box">
                <div class="item">
                    <i class="icon-login-user"></i>
                    <input type="text" name="username" placeholder="请填写工号或手机号" autocomplete="off" autofocus="autofocus" v-model="username" />
                </div>
    
                <div class="item b0">
                    <i class="icon-login-pwd"></i>
                    <input type="password" name="password" placeholder="请填写密码" autocomplete="off" v-model="password" />
                </div>
    
                <label class="city-select" style="" v-if="canSelectCity">
                    <span class="label">管理城市：</span>
                    <span class="current-city-name" style="display: none;">南京</span>
                    <select name="city_id" class="select" v-model="city_id">
                        <option value="2">南京</option>
                        <option value="60">盐城</option>
                    </select>
                </label>
            </div>
            <div class="login_btn_panel">
                <button class="login-btn" type="submit" :disabled="isSubmitting">
                    登 录
                </button>
                <div class="check-tips">{{checkTips}}</div>
            </div>
        </form>
    </div>
</template>


<script>
    import Q from '@/common'
    import bus from '@/services/bus'
    import { login } from '@/services/auth'
    import {currentCity} from '@/services/city'
    import Spinning from '@/components/spinning'

    export default {
        components: {
            Spinning
        },
        props: {
            initialTips: String,
            canSelectCity: {
                type: Boolean,
                default: true,
            }
        },
        data () {
            return {
                isSubmitting: false,
                checkTips: this.initialTips || '',
                username: '',
                password: '',
                city_id: currentCity.id || 2,
            }
        },
        methods: {
            onSubmit (e) {
                e.preventDefault()
                e.stopPropagation()

                console.log('Submitting form...', e)
                if (this.isSubmitting) {
                    return
                }

                let data = {
                    username: this.username,
                    password: this.password,
                    city_id: this.city_id
                }

                console.log('login form data: ', data)

                this.isSubmitting = true
                this.checkTips = ''

                login(data)
                    .then(res => {
                        this.isSubmitting = false
                        bus.$emit('login', res)
                        this.$emit('success')
                    })
                    .catch(err => {
                        this.checkTips = Q.formatError(err)
                        this.isSubmitting = false
                    })
            },
            reset () {
                // this.username = ''
                this.password = ''
                this.checkTips = ''
            }
        }
    }

</script>


<style scoped>
    .login-form {
        position: relative;
        display: block;
        width: 290px;
        height: auto;
        padding: 25px 30px 13px;
        background-color: #fff;
        box-shadow: 0 0 26px #041a36;
        border-top: 8px solid #42ec00;
    }
    
    .login-form h3 {
        font-size: 26px;
        font-weight: 400;
        margin: 0 0 20px;
        padding: 0;
        line-height: 44px;
        text-align: center;
        color: #8d9caa;
    }
    
    .login-logo {
        display: inline-block;
        margin-right: 12px;
        width: 44px;
        height: 44px;
    }
    
    .item-box {
        position: relative;
    }
    
    .item {
        border-radius: 5px;
        padding: 3px 10px 3px 12px;
        border: 1px solid #ececec;
        margin-bottom: 10px;
    }
    
    .icon-login-user,
    .icon-login-pwd,
    .icon-login-verifycode {
        display: inline-block;
        margin-right: 6px;
        width: 24px;
        height: 24px;
        vertical-align: middle;
        background: url(/admin/img/login/icon24_login.png) no-repeat;
    }
    
    .icon-login-user {
        background-position: 0 0;
    }
    
    .icon-login-pwd {
        background-position: -48px 0;
    }
    
    .login-form input {
        padding: 8px 0;
        width: 220px;
        height: 22px;
        line-height: 22px;
        font-size: 16px;
        font-family: Microsoft Yahei, arial, sans-serif;
        vertical-align: middle;
        border: 0 none;
        background-color: #fff;
        outline: 0;
        resize: none;
        color: #686868;
    }
    
    .city-select {
        display: block;
        margin: -6px 0 -10px;
        text-align: left;
    }
    
    
    .city-select,
    .city-select .select {
        font-size: 16px;
    }
    
    select {
        border-color: #ccc;
    }
    
    .login-form .login_btn_panel {
        margin: 20px 0 10px;
    }
    
    .login-form .login-btn {
        padding: 3px 0;
        width: 100%;
        height: 48px;
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        border: 0;
        background-color: #40c402;
    }
    
    .login-form .login-btn[disabled] {
        background: #aaa;
        color: #eee;
    }
    
    .login-form .check-tips {
        color: red;
        margin-top: 10px;
        overflow: auto;
        max-height: 5em;
        word-break: break-all;
    }
</style>
