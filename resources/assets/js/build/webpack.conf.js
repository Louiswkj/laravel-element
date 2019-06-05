const path = require('path')
const config = require('../config')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const hosts = config.hosts
const hostsEnv = Object.keys(hosts).reduce((a, k) => (a[k] = JSON.stringify(hosts[k]), a), {})

const extend = Object.assign

const PROJECT_ROOT = config.PROJECT_ROOT
const SRC_PATH = config.SRC_PATH
const resolvePath = p => path.resolve(PROJECT_ROOT, p)

const isProduction = process.env.NODE_ENV === 'production'
const enableExtractCss = true


module.exports = {
    mode: isProduction ? 'production' : 'development',
    cache: true,
    entry: {
        app: './src/main.js',
    },
    output: {
        path: config.ASSETS_ROOT,
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: 'js/[name].[chunkhash].js',
        publicPath: '/admin/dist/',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            // todo: use external vue js
            // 'vue$': 'vue/dist/vue.esm.js',
            '@': resolvePath('src'),
            'deep-copy$': resolvePath('src/common/deep-copy.js'),
        },
        modules: [
            // resolvePath('src/node_modules'),
            resolvePath('node_modules'),
        ],
    },
    externals: {
        'jquery': 'jQuery',
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'element-ui': 'ELEMENT',
        'echarts': 'echarts',
    },
    devtool: isProduction ? 'cheap-module-source-map' : 'cheap-source-map',
    module: {
        rules: [
            {test: /\.js$/,  use: 'babel-loader'},
            // {test: /\.es$/,  use: 'babel-loader'},
            // {test: /\.ts$/,  use: 'ts-loader'},
            {test: /\.css$/, use: useExtractCss(useCssLoaders())},
            {test: /\.less$/, use: useExtractCss(useLessLoaders())},
            {test: /\.txt$/, use: 'raw-loader'},
            {test: /\.(png|jpg|jpeg|gif|svg)$/, use: [
                {loader: 'url-loader', options: {limit: 8192}},
            ]},
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {loader: 'url-loader', options: {
                        limit: 10000,
                        name: 'fonts/[name].[hash:7].[ext]',
                    }}
                ],
            },
            {test: /\.vue$/, use: [
                {loader: 'vue-loader', options: {
                    loaders: {
                        js: 'babel-loader',
                        css: useCssLoaders(),
                        less: useLessLoaders(),
                        extractCSS: false,
                    }
                }}
            ]},
        ],
        // noParse: /jquery|lodash/,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html.js',
            filename: resolvePath('./public/admin/index.html'),
            inject: true,
            cache: true,
            minify: isProduction ? {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            } : {},
            chunks: ['vendor', 'app', 'manifest'],
            chunksSortMode: 'manual',
            // chunksSortMode: 'dependency',
            // chunksSortMode: function (chunk1, chunk2) {
            //     var order = ['vendor', 'app', 'manifest'];
            //     var order1 = order.indexOf(chunk1.names[0]);
            //     var order2 = order.indexOf(chunk2.names[0]);
            //     return order1 - order2;  
            // }
        }),
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'md4',
            hashDigest: 'hex',
            hashDigestLength: 8,
        }),
        new webpack.ProgressPlugin((function (){
            var prevMsg = null
            return function(percentage, msg) {
                var progressMsg
                if (+percentage < 1) {
                    progressMsg = '\rwebpack: ' + (+percentage * 100).toFixed(0) + '%  ' + msg + '...'
                } else {
                    progressMsg = '\rwebpack: 100%  ' + (msg || 'done') + '.                                         \n'
                }

                if (progressMsg !== prevMsg){
                    process.stderr.write(progressMsg)
                    prevMsg = progressMsg
                }
            }
        })()),
        new webpack.DefinePlugin({
            'process.env': extend({
                NODE_ENV: isProduction ? '"production"' : '"development"',
            }, hostsEnv)
        })
    ],
    optimization: {
        runtimeChunk: {name: 'manifest'},
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }
            }
        },
        minimize: isProduction,
        minimizer: isProduction ? [
            new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ] : undefined
    },
    // use recordsPath to keep chunk IDs between buildings
    // @see https://webpack.js.org/configuration/other-options/#recordspath
    recordsPath: resolvePath('storage/records.json'),
}

// don't parse node_modules
module.exports.module.rules.forEach(x => {
    x.include = x.include || []
    x.include.push(SRC_PATH)
})

// enable extract css plugin if needed
if (enableExtractCss){
    // todo: [hash]
    module.exports.plugins.unshift(new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash].css",
        chunkFilename: "css/[id].[contenthash].css",
    }))
}

function useExtractCss(uses){
    if (!enableExtractCss){
        return uses
    }

    uses.splice(0, 1, MiniCssExtractPlugin.loader)

    return uses
}

function useCssLoaders(){
    return [
        {loader: 'style-loader'},
        {loader: 'css-loader', options: {importLoaders: 1}},
        {loader: 'postcss-loader'},
    ]
}

function useLessLoaders(){
    return [
        {loader: 'style-loader'},
        {loader: 'css-loader', options: {importLoaders: 2}},
        {loader: 'postcss-loader'},
        {loader: 'less-loader', options: {
            strictMath: false,
            noIeCompat: true,
        }},
    ]
}

