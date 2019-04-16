const path = require('path')
const fs = require('fs')
const postcss = require('postcss-px2rem')
module.exports = {
  publicPath: "/",
  outputDir: process.env.NODE_ENV === "development" ? 'devdist':'dist',

  filenameHashing: true,
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@css': path.resolve(__dirname, './src/assets/css')
      }
    }
  },

  css: {
    loaderOptions: {
      sass: {
        data: fs.readFileSync('./src/assets/css/variables.scss','utf-8')
      },
      postcss: {
        plugins: [postcss({
          remUnit: 75
        })]
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
