const path = require('path');
const globEntry = require('webpack-glob-entry');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  stats: {
    colors: true,
    preset: 'minimal'
  },
  performance: { hints: isProduction ? 'warning' : false },
  entry: globEntry('./src/asset/js/*.js'),
  output: {
    filename: '[name].js',
    // filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist/asset/js/'),
    publicPath: '/asset/js/'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
    // new ESLintPlugin(/*options*/),
  ],
  ...(!isProduction && {
    devtool: 'inline-source-map'
  }),
  ...(isProduction && {
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
          // cache: true,
          extractComments: true,
          terserOptions: {
            ecma: 5,
            ie8: false,
            compress: true,
            warnings: true
          }
        })
      ]
    }
  }),
  module: {
    rules: [
      {
        test: /\.js$/,
        // node_modules 내의 모듈들은 Babel 처리하지 않음.
        // 단, IE 11에서 swiper를 사용하려면 swiper와 dom7도 Babel 처리가 필요하므로
        // exclude 되지 않도록 처리.
        // Windows는 디렉토리 구분자가 `\`이므로 정규식 사용 시 `path.sep`을 사용하여
        // 플랫폼 별로 적합한 구분자 사용하도록 해주어야 함.
        // include: filePath => new RegExp(`src\\${sep}asset\\${sep}).*`).test(filePath),
        exclude: (filePath) =>
          new RegExp(
            `node_modules\\${path.sep}(?!(dom7|swiper)\\${path.sep}).*`
          ).test(filePath),
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        // use: ['style-loader', 'css-loader', 'sass-loader']
        use: [ 
          "style-loader", 
          {
            loader: "css-loader", 
            options: { modules: { compileType: "icss" }}
          }, 
          "sass-loader"
        ],
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      // Helpful alias for importing assets
      assets: path.resolve(__dirname, 'src/asset')
    }
  }
};
