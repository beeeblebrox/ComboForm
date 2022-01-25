/* Vars */
const srcFolder = 'app'
const buildFolder = 'dist'

/* Modules */
const { series, parallel, src, dest, watch } = require('gulp');
const browserSync   = require('browser-sync').create();
const devip         = require('dev-ip');
const rsync         = require('gulp-rsync');
const postcss       = require('gulp-postcss');
const sass          = require('gulp-sass')(require('sass'));
const autoprefixer  = require('autoprefixer');
const cssnano       = require('cssnano');
const webpack       = require('webpack');
const webpackStream = require('webpack-stream');
const TerserPlugin  = require('terser-webpack-plugin');
const image         = require('gulp-image');
const sourcemaps    = require('gulp-sourcemaps');
const rename        = require('gulp-rename');
const del           = require('del');

/* Tasks */

// Get external link for BrowserSync
function getHostIP() {
  let ipList = devip();
  let ip = ipList[ipList.length - 1]; // get last available ip
  return ip;
}

// Create Server
function createServer() {
  browserSync.init({
    server: { baseDir: srcFolder },
    notify: false,
    host: getHostIP(), // If default external link doesn't work
    // tunnel: 'someproject-v1', // URL: https://someproject-v1.loca.lt
  });
}

// Build Styles
function buildStyles() {
  return src(`${srcFolder}/sass/*.sass`)
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  .pipe(postcss([
    autoprefixer({ cascade: false, grid: "autoplace" }),
    cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
  ]))
  .pipe(rename({ suffix: ".min" }))
  .pipe(sourcemaps.write())
  .pipe(dest(`${srcFolder}/css`))
  .pipe(browserSync.stream())
};

// Javascript
function buildScripts() {
  return src(`${srcFolder}/js/main.js`)
  .pipe(webpackStream({
    mode: 'production',
    performance: { hints: false },
    stats: 'minimal',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: { format: { comments: false } },
          extractComments: false
        }),
      ]
    },
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['babel-plugin-root-import']
            }
          }
        }
      ]
    },
  }, webpack)).on('error', function handleError() {
    this.emit('end')
  })
  .pipe(rename({ 
    basename: "app",
    suffix: ".min" 
  }))
  .pipe(dest(`${srcFolder}/js`))
  .pipe(browserSync.stream())
}

// Images
function optimizationImages() {
  return src([
    `${buildFolder}/img/**/*`,
    `!${buildFolder}/img/**/favicons/**/*`,
  ])
  .pipe(image())
  .pipe(dest(buildFolder+'/img'))
}

// Start Watch
function startWatch(){
  watch(`${srcFolder}/{sass, scss}/**/*.{sass, scss}`, buildStyles);
  watch([`${srcFolder}/js/**/*.js`, `!${srcFolder}/js/**/*.min.js`], buildScripts);
  watch(`${srcFolder}/img/**/*`).on('change', browserSync.reload);
  watch(`${srcFolder}/**/*.{html, twig, tpl, php, json, txt, md, woff, woff2, ttf}`).on('change', browserSync.reload);
}

// Build Project
function transferToDist() {
  return src([
    srcFolder + '/css/*.css',
    srcFolder + '/css/*.min.css',
    srcFolder + '/js/*.js',
    srcFolder + '/js/*.min.js',
    srcFolder + '/fonts/**/*',
    srcFolder + '/img/**/*',
    srcFolder + '/**/*.{html, twig, tpl, php, json, md}',
    // srcFolder + '/.txt',
    // srcFolder + '/.htaccess',
  ], { base: srcFolder+'/' })
  .pipe(dest(buildFolder))
}

function buildClear() {
  return del(buildFolder, { force: true })
}

function enterNotices() {
  console.error('Готово. Не забудь удалить sourcemaps! :)');
}

// Deploy
function deploy() {
  return src(buildFolder)
  .pipe(rsync({
    root: buildFolder,
    hostname: 'username@hostname.com',
    destination: 'yousite/public_html/',
    recursive: true,
    archive: true,
    silent: false,
    compress: true
  }))
}

// Exports
exports.buildStyles  = buildStyles;
exports.buildScripts = buildScripts;
exports.enterNotices = enterNotices;
exports.build        = series(buildClear, parallel(buildStyles, buildScripts), transferToDist, optimizationImages, enterNotices);
exports.buildClear   = buildClear;
exports.deploy       = series(buildClear, parallel(buildStyles, buildScripts), transferToDist, optimizationImages, deploy);
exports.default      = series(parallel(buildStyles, buildScripts), parallel(createServer, startWatch));

