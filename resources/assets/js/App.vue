<template>
    <div>
        <el-container v-if="isLogin">
            <el-header :style="'height: 55px;padding:0;background-color:' + defaultThemeColor" class="main-header">
                <a href="/" class="logo" :style="logoStyle">
                    <span class="logo-lg">后台管理系统</span>
                </a>

                <nav class="navbar navbar-static-top" :style="navbarStyle">
                    <el-row>
                        <el-col :span="2">
                            <a type="text" class="sidebar-toggle" data-toggle="offcanvas" @click="switchNav">&nbsp;</a>
                        </el-col>
                        <el-col :span="22" style="float:right">
                            <div style="float:left">
                                <el-menu
                                        :default-active="defaultTopIndex"
                                        class="top-header-nav"
                                        mode="horizontal"
                                        @select="handleSelectTopMenu"
                                        :background-color="defaultThemeColor"
                                        :height="55"
                                        text-color="#fff"
                                        active-text-color="#ffd04b">
                                    <el-menu-item :index="row.id + ''" v-for="row in menus" :key="row.id">
                                        {{row.label}}
                                    </el-menu-item>
                                </el-menu>
                            </div>

                            <el-row style="float: right">
                                <div style="float:left;line-height:55px;color:#FFF;cursor:pointer"
                                     @click="showThemeModal=true">更改主题色&nbsp;&nbsp;&nbsp;&nbsp;|
                                </div>
                                <el-dropdown trigger="click" class="user-info-menu">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                        <img :src="userInfo.avatar || '/img/avatar.jpg'" class="user-image"
                                             alt="User Image">
                                        <span class="hidden-xs">{{userInfo.username}}</span>
                                    </a>
                                    <el-dropdown-menu slot="dropdown" class="dropdown-menu">
                                        <el-dropdown-item class="user-header">
                                            <img :src="userInfo.avatar || '/img/avatar.jpg'" class="img-circle"
                                                 alt="User Image">

                                            <p>
                                                {{userInfo.username}} - {{userInfo.realname}}<br/>
                                                {{userInfo.position}}<br/>
                                                <small>Member since {{toDate(userInfo.create_time)}}</small>
                                            </p>
                                        </el-dropdown-item>

                                        <el-dropdown-item class="user-footer" :divided="true">
                                            <div class="pull-left">
                                                <router-link :to="'/admin/system/profile'">
                                                    <el-button type="text" @click="">设置</el-button>
                                                </router-link>

                                            </div>
                                            <div class="pull-right">
                                                <el-button type="text" @click="logout">退出</el-button>
                                            </div>
                                        </el-dropdown-item>

                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-row>

                        </el-col>
                    </el-row>
                </nav>
            </el-header>

            <el-container class="main-container">
                <el-aside :width="asideWidth" :style="'background-color:' + defaultLeftColor">
                    <el-menu
                            :default-active="active"
                            class="el-menu-custom"
                            :collapse="isCollapse"
                            :router="true"
                            text-color="#fff"
                            active-text-color="#ffd04b"
                            :background-color="defaultLeftColor"
                            style="border-right: 0">

                        <el-submenu :index="menu.id + ''" v-for="menu in leftMenus" :key="menu.id">
                            <template slot="title">
                                <a class="menu-icon" v-html="menu.icon"></a>
                                <span slot="title">{{menu.label}}</span>
                            </template>
                            <el-menu-item :index="menu.id + '-' + child.id" @click="toRoute(child.path)"
                                          v-for="child in menu.children" :key="child.id">{{child.label}}
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
                <el-container>
                    <el-main class="main-content" v-if="!isLanding">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item v-for="item in navBre" :key="item.id">{{item.title}}
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                        <hr style="color:#ccc;"/>
                        <router-view></router-view>
                    </el-main>
                    <el-main class="main-content" v-if="isLanding">
                        <div class="menu__catagory gaptop-lg" v-for="(menu, outIndex) in leftMenus" :key="menu.name">
                            <div class="menu__catagory_title">
                                <span>{{ menu.label }}</span>
                            </div>
                            <div class="menu__catagory_list gaptop-lg">
                                <el-row class="link__group" :gutter="30">
                                    <el-col class="link__group_item gaptop-lg" :xs="12" :sm="12" :md="6" :lg="6"
                                            v-for="(link, index) in menu.children" :key="index">
                                        <div @click="toRoute(link.path)" class="link__group_item_div"
                                             style="hover:#000">{{ link.label }}
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </el-main>
                    <el-footer class="main-footer" style="padding:15px;height: 50px"><strong>Copyright © 2018
                        <a href="https://github.com/jack15083/laravel-admin">Laravel-Admin</a>.</strong> All rights
                        reserved.
                    </el-footer>
                </el-container>
            </el-container>
        </el-container>

        <!-- 登录 --->
        <div v-if="!isLogin" class="login_background">
            <div  class="login-panel">
                <div class="login-show"></div>
                <el-card class="login-form">
                    <div style="padding-bottom:1.5em">
                        <span style="font-size:18px;">密码登录</span>
                    </div>
                    <el-alert
                            :title="error"
                            type="error" v-if="error">
                    </el-alert>
                    <el-form label-position="top" label-width="80px" :model="form" ref="form" :rules="ruleForm">
                        <el-form-item prop="username">
                            <el-input v-model="form.username" autocomplete="on" name="username">
                                <template slot="prepend">用户名</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input type="password" v-model="form.password" autocomplete="on" name="password">
                                <template slot="prepend">密 码&nbsp;&nbsp;&nbsp;</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item >
                            <el-button type="primary" @click="login('form')"  @keyup.enter.native="login('form')"  style="width:100%;">登录</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>
        </div>


        <el-dialog  title="设置主题颜色" :visible.sync="showThemeModal" width="30%">
            <el-row class="theme__group" :gutter="30">
                <el-col :xs="12" :sm="12" :md="6" :lg="6" v-for="(color, index) in themeColor" :key="index">
                    <div class="theme-block" :style="'background-color:'+ color" @click="setTheme(color)">
                        <i class="fa fa-check" aria-hidden="true" v-if="color === defaultThemeColor"></i>
                        <span v-else>&nbsp</span>
                    </div>
                </el-col>
            </el-row>

            <span slot="footer" class="dialog-footer">
                <el-button @click="showThemeModal = false">取 消</el-button>
                <el-button type="primary" @click="saveThemeColor">保 存</el-button>
              </span>
        </el-dialog>

    </div>
</template>

<script>
    const g_dd_appid = 'dingding_appid';
    const g_redirect_uri = 'https://' + document.domain + '/login/ddlogin';
    export default {
        name: 'app',
        mounted() {
            this.userInfo = JSON.parse(window.sessionStorage.getItem('userInfo'));
            this.isLogin = this.userInfo !== null;
            //定位默认菜单
            if (this.isLogin) {
                this.menus = this.userInfo.menus;
                this.defaultTopIndex = this.menus[0].id + '';
                for (let index in this.menus) {
                    if (this.menus[index].id === Number(this.defaultTopIndex)) {
                        this.leftMenus = this.menus[index].children;
                    }
                }
            }
            this.initPage();
        },
        data() {
            return {
                isCollapse: sessionStorage.getItem('isCollapse') === '1',
                asideWidth: '230px',
                logoStyle: '',
                navbarStyle: '',
                isLogin: false,
                form: {},
                ruleForm: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                },
                userInfo: {},
                error: '',
                menus: [],
                leftMenus: [],
                active: '',
                hash: location.hash,
                navBre: [],
                defaultTopIndex: '1',
                isLanding: false,
                isDDLogin: false,
                intervalId: '',
                showThemeModal: false,
                defaultThemeColor: '#0050b3',
                defaultLeftColor: '#222D32',
                themeColor: [
                    '#8c8c8c',
                    '#d46b08',
                    '#7cb305',
                    '#389e0d',
                    '#08979c',
                    '#0050b3',
                    '#531dab',
                    '#c41d7f'
                ]
            }
        },
        watch: {
            $route: function (route) {
                if (!this.isLogin) {
                    return;
                }
                this.isLanding = false;
                this.routeChange(route.path);
            },
        },
        methods: {
            switchNav() {
                this.isCollapse = !this.isCollapse;
                sessionStorage.setItem('isCollapse', Number(this.isCollapse));
                this.initPage();
            },
            initPage() {
                if (this.isCollapse) {
                    this.asideWidth = '64px';
                } else {
                    this.asideWidth = '230px';
                }
                if (!this.isLogin) {
                    //document.body.style.background = '';
                    if (typeof window.addEventListener != 'undefined') {
                        window.addEventListener('message', this.handleMessage, false);
                    } else if (typeof window.attachEvent != 'undefined') {
                        window.attachEvent('onmessage', this.handleMessage);
                    }
                } else {
                    //document.body.style.background = '';
                    let themeColor = localStorage.getItem('t_c');
                    if (themeColor) {
                        this.defaultThemeColor = themeColor;
                    }
                }
            },
            routeChange(path) {
                this.$http.post('/api/rule/get-path-info', {path: path}).then(res => {
                    if (res.status === 100) {
                        this.navBre = res.data;
                        this.defaultTopIndex = this.navBre[0].id + '';
                        for (let index in this.menus) {
                            if (this.menus[index].id === Number(this.defaultTopIndex)) {
                                this.leftMenus = this.menus[index].children;
                                break;
                            }
                        }
                        this.active = this.navBre[1].id + '-' + this.navBre[2].id;
                    }
                });
            },
            login(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$http.post('/api/login/login', this.form).then(res => {
                            if (res.status === 100) {
                                window.sessionStorage.setItem('userInfo', JSON.stringify(res.data));
                                window.location.href='/#/admin/system/profile';
                                location.reload();
                            } else {
                                this.error = res.message;
                            }
                        });
                    }
                });
            },
            toDate(times) {
                let date = new Date(times * 1000);
                let Y = date.getFullYear() + '/';
                let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
                let D = date.getDate() + ' ';
                return Y + M + D;
            },

            logout() {
                this.$http.post('/api/login/logout', this.form).then(res => {
                    if (res.status === 100) {
                        window.sessionStorage.removeItem('userInfo');
                        window.location.href='/';
                    } else {
                        this.error = res.msg;
                    }
                });
            },

            handleSelectTopMenu(active) {
                for (let index in this.menus) {
                    if (this.menus[index].id === Number(active)) {
                        this.leftMenus = this.menus[index].children;
                        break;
                    }
                }
                this.active = '';
                this.isLanding = true;
            },
            toRoute(path) {
                this.$router.push(path);
                this.isLanding = false;
            },
            ddLogin(a) {
                var e, c = document.createElement("iframe"),
                    d = "https://login.dingtalk.com/login/qrcode.htm?goto=" + a.goto;
                d += a.style ? "&style=" + encodeURIComponent(a.style) : "",
                    d += a.href ? "&href=" + a.href : "",
                    c.src = d,
                    c.frameBorder = "0",
                    c.allowTransparency = "true",
                    c.scrolling = "no",
                    c.width = a.width ? a.width + 'px' : "365px",
                    c.height = a.height ? a.height + 'px' : "400px",
                    e = document.getElementById(a.id),
                    e.innerHTML = "",
                    e.appendChild(c);
            },
            initDDLogin() {
                let ddGotoUrl = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + g_dd_appid +
                    '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' + g_redirect_uri;
                let params = {
                    id: "dd_login",
                    goto: encodeURIComponent(ddGotoUrl),
                    width: "350",
                    height: "320"
                };
                if (this.isDDLogin) {
                    document.getElementById(params.id).style.display = 'block';
                    this.ddLogin(params);
                } else {
                    document.getElementById(params.id).style.display = 'none';
                }

            },
            handleMessage(event) {
                let origin = event.origin;
                if (origin === "https://login.dingtalk.com") { //判断是否来自ddLogin扫码事件。
                    let loginTmpCode = event.data; //拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
                    let gotoUrl = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + g_dd_appid +
                        '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' + g_redirect_uri +
                        '&loginTmpCode=' + loginTmpCode
                    let iframe = document.getElementById('dd_login_iframe');
                    iframe.src = gotoUrl;
                }
            },
            switchLogin() {
                this.isDDLogin = !this.isDDLogin;
                this.initDDLogin();
                if (this.isDDLogin) {
                    let that = this;
                    this.intervalId = setInterval(function () {
                        that.getDDLoginData();
                    }, 50);
                } else {
                    clearInterval(this.intervalId);
                }

            },
            getDDLoginData() {
                try {
                    let data = document.getElementById('dd_login_iframe').document.body.innerHTML;
                    let res = JSON.parse(data);
                    if (res.status === 0) {
                        window.sessionStorage.setItem('userInfo', JSON.stringify(res.data));
                        location.reload();
                    } else {
                        this.error = res.msg;
                    }
                } catch (e) {

                }
            },
            saveThemeColor() {
                localStorage.setItem('t_c', this.defaultThemeColor);
                this.showThemeModal = false;
            },
            setTheme(color) {
                this.defaultThemeColor = color;
            }
        }
    }
</script>

<style>
    body {
        background-color: #F1F1F1;
    }

    .login_background{
        height:1000px;
        background: url('/image/login/login_background.jpg');
        background-size:cover;
        background-repeat:no-repeat;
    }

    .login-form {
        position: relative;
        top: 100px;
        left: 0;
        background-color: #f9f9f9;
        width: 420px;
        margin-left: auto;
        margin-right: auto;
        box-shadow: #1b1919 0px 0px 50px
    }

    .top-header-nav {
        height: 55px;
    }

    .top-header-nav .el-menu-item {
        height: 55px;
        line-height: 55px;
        font-size: 16px;
        font-weight: 700;
    }

    #dd_login {
        display: none;
        padding: 0;
        width: 350px;
    }

    .theme-block {
        line-height: 40px;
        text-align: center;
        color: white;
        cursor: pointer
    }

    .theme__group .el-col {
        padding: 10px;
    }

    .menu__catagory_title {
        color: #35495e;
        font-size: 26px;
        height: 46px;
        line-height: 46px;
        border-bottom: 3px solid #ddd;
    }

    .menu__catagory_title > span {
        padding: 5px;
        border-bottom: 3px solid #41b883;
    }
</style>
