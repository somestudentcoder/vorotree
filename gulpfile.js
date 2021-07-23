const gulp = require('gulp');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');
const del = require('del');

// Build/Serve

function build(cb) {
    return new Promise((resolve, reject) => {
        envProd()
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                return reject(err)
            }
            if (stats.hasErrors()) {
                return reject(new Error(stats.compilation.errors.join('\n')))
            }
            resolve()
        })
    })
}


function serve(cb){
    return new Promise((resolve, reject) => {
        envDev();
        new webpackDevServer(webpack(webpackConfig), webpackConfig.devServer).listen(8080, 'localhost', (err) => {
            if(err) throw new gutil.PluginError("webpack-dev-server", err);
          });
    })
}



// Environmental Variables

function envDev(){
    return process.env.NODE_ENV = 'development';
}

function envProd(){
    return process.env.NODE_ENV = 'production';
}



// Cleaning
function cleanDist() {
    return del('src/dist/**', { force: true });
}

function cleanNodeModules() {
    return del('node_modules/**', { force: true });
}


exports.build = build;
exports.serve = serve;
exports.clean = cleanDist;
exports.cleanAll = gulp.series([cleanDist, cleanNodeModules]);