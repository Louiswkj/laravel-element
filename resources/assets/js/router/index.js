import Vue from 'vue';
import VueRouter from 'vue-router';
import generateIndex from '../router/generated/index.js' //系统管理
import normalize from './normalize'

Vue.use(VueRouter);

export function getCurrentPath () {
    return normalize(window.location.pathname)
}

let vueRoutes = {
    saveScrollPosition: true,
    routes: [
        {
            name: 'hello',
            path: '/',
            component: resolve => void(require(['../components/Hello.vue'], resolve))
        }
    ]
};

const RE_PUBLIC_PAGES = /^\/admin\/(login|logout|test|403|404|error|dev)/i
export function isPublicPage (pagePath) {
    return RE_PUBLIC_PAGES.test(pagePath)
}

vueRoutes.routes = vueRoutes.routes.concat(generateIndex);

export default new VueRouter(vueRoutes);