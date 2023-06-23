const DIST_PATH = 'public_html';
const SOURCE_PATH = 'src';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
       filename: 'app.js',
       path: path.resolve(__dirname, DIST_PATH)
    },
    devServer: {
      static: path.join(__dirname, DIST_PATH),
      port: 3000
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: SOURCE_PATH + '/index.html',
        filename: 'index.html',
        inject: 'body',
        scriptLoading: 'defer'
      })
    ],
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
            minimize: true,
          }
        },
        {
          loader: 'posthtml-loader',
          options: {
            plugins: [
              require('posthtml-include')({ root: SOURCE_PATH })
            ]
          }
        }
      ]
    }
};
