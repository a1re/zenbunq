const DIST_PATH = 'public_html';
const SOURCE_PATH = 'src';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
       filename: 'bundle.js',
       path: path.resolve(__dirname, DIST_PATH),
       assetModuleFilename: 'assets/[name][ext]'
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
      }),
      new MiniCssExtractPlugin({
        filename: "style.css",
      })
    ],
    module: {
      rules: [
        {
          test: /\.(phg|jpg|jpeg|svg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
//            minimize: true,
          }
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.html$/i,
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
