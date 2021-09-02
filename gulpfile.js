const gulp = require('gulp');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');
const del = require('del');

var exec = require ('child_process').exec;

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

function runElectron(cb){
    exec('electron .', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}

function buildElectron(cb){
    exec('electron-packager . --out ./standalone --overwrite', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}

function buildElectronWin(cb){
    exec('electron-packager . --out ./standalone --overwrite --platform "win32"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}

function buildElectronMac(cb){
    exec('electron-packager . --out ./standalone --overwrite --platform "darwin"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}

function buildElectronLinux(cb){
    exec('electron-packager . --out ./standalone --overwrite --platform "linux"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
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

// Deploy
function deployVoroTree(cb)
{
    exec('npx copyfiles -u 2 src/dist/* src/dist/data/* src/dist/css/* docs/', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}


exports.build = build;
exports.serve = serve;
exports.electron = gulp.series([build, runElectron]);
exports.buildElectronApp = gulp.series([build, buildElectron]);
exports.buildElectronWinApp = gulp.series([build, buildElectronWin]);
exports.buildElectronMacApp = gulp.series([build, buildElectronMac]);
exports.buildElectronLinuxApp = gulp.series([build, buildElectronLinux]);
exports.buildElectronAllApps = gulp.series([build, buildElectronWin, buildElectronMac, buildElectronLinux]);
exports.clean = cleanDist;
exports.cleanAll = gulp.series([cleanDist, cleanNodeModules]);
exports.deploy = gulp.series([build, deployVoroTree]);