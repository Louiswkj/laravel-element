let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css')
   .extract(['vue','axios']);

console.log('生成路由开始');

//生成route
require('./resources/assets/js/build/lib/auto-vue-router')
    .generate(require('./resources/assets/js/config').autoGenerateRoutes)

console.log('生成路由结束');