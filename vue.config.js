// vue.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 1. Configuración de la ruta base
  publicPath: '/',

  // 2. Configuración de reglas de carga (chainWebpack)
  chainWebpack: config => {
    // Regla para archivos xlsx
    config.module
      .rule('xlsx')
      .test(/\.(xlsx)$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[ext]',
        outputPath: 'assets/files/'
      })
      .end();

    // Regla para SVG
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },

  // 3. Configuración de Webpack (plugins y optimización)
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      // Copiar assets de TinyMCE
      new CopyWebpackPlugin({
        patterns: [
          { from: 'node_modules/tinymce/icons',   to: 'tinymce/icons'   },
          { from: 'node_modules/tinymce/skins',   to: 'tinymce/skins'   },
          { from: 'node_modules/tinymce/themes',  to: 'tinymce/themes'  },
          { from: 'node_modules/tinymce/plugins', to: 'tinymce/plugins' },
          { from: 'node_modules/tinymce/models',  to: 'tinymce/models'  }
        ]
      }),
      // DefinePlugin
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  }
});
