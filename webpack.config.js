const DIST_PATH = 'public_html';
const SOURCE_PATH = 'src';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    entry: [
      path.resolve(__dirname, SOURCE_PATH, 'app.js'),
      path.resolve(__dirname, SOURCE_PATH, 'style.scss'),
    ],
    output: {
       filename: 'bundle.[hash].js',
       path: path.resolve(__dirname, DIST_PATH),
       assetModuleFilename: 'assets/[name].[hash][ext]',
       clean:true
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
        filename: "style.[hash].css",
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
            minimize: false,
          }
        },
        {
          test: /\.(s?)css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
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
