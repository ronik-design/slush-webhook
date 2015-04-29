var path = require('path');
var webpack = require('webpack');
var PARAMS = require('./params');

var DEST = PARAMS.buildDir;

var ENTRY = { 'main.js': './scripts/main.js' };

var providePlugins = {};

if (PARAMS.jsFramework === 'simple' || PARAMS.jsFramework === 'backbone') {
    providePlugins.$ = 'jquery';
    providePlugins._ = 'lodash';
}

if (PARAMS.jsFramework === 'backbone') {
    providePlugins.Backbone = 'backbone';
}

var aliases = {};

if (PARAMS.cssFramework === 'bootstrap') {
    aliases.bootstrap = path.resolve(__dirname, 'node_modules/bootstrap-styl/js');
}

var LOADERS = [{
    test: /scripts\/vendor\/.+\.js$/,
    loaders: ['imports?this=>window']
}, {
    test: /\.jsx?$/,
    exclude: /node_modules|scripts\/vendor/,
    loaders: [
        'babel?stage=0&optional=runtime',
        'eslint'
        ]
}];

module.exports = {
    entry: ENTRY,

    output: {
        filename: 'main.js',
        path: DEST + '/javascript/',
        publicPath: '/javascript/'
    },

    stats: {
        colors: true,
        reasons: false
    },

    plugins: [
        new webpack.ProvidePlugin(providePlugins)
    ],

    resolve: {
        aliases: aliases,
        modulesDirectories: ['local_modules', 'node_modules'],
        extensions: ['', '.js', '.jsx']
    },

    eslint: {
        configFile: './scripts/.eslintrc'
    },

    module: {
        loaders: LOADERS
    }
};
