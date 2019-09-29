const path = require('path')
// const fs = require('fs')
const postcss2rem = require('postcss-px2rem')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
  // 本地调试-serve模式时，修改.env.development VUE_APP_PUB_PATH为"/"
  publicPath: process.env.VUE_APP_PUB_PATH,
  assetsDir: '',
  outputDir: process.env.NODE_ENV === "development" ? 'devdist':'dist',
  filenameHashing: true,
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@css': path.resolve(__dirname, './src/assets/css'),
        '@img': path.resolve(__dirname, './src/assets/img')
      }
    },
    externals: [{
      moment: 'moment'
    }],
    plugins: process.env.NODE_ENV === "development" ? []: [new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_debugger: true,
          drop_console: true,
        },
      },
      sourceMap: false,
      parallel: true,
    })]
  },

  css: {
    loaderOptions: {
      scss: {
        data: `@import "@css/variables.scss";`
      },
      postcss: {
        plugins: [
          require('autoprefixer')(),
          postcss2rem({remUnit: 75})
        ]
      }
    }
  },
  devServer: {
    host:"0.0.0.0",
    disableHostCheck:true,
    port: 8081,
    open: true,
    https: false,
    overlay: {
      warnings: true,
      errors: true
    }
  },

  lintOnSave: undefined
}
