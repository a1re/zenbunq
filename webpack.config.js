const DIST_PATH = 'public_html';
const SOURCE_PATH = 'src';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: [
      path.resolve(__dirname, SOURCE_PATH, 'app.js'),
      path.resolve(__dirname, SOURCE_PATH, 'style.scss'),
    ],
    output: {
       filename: 'bundle.js',
       path: path.resolve(__dirname, DIST_PATH),
       assetModuleFilename: 'assets/[name][ext]',
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
        filename: "style.css",
      }),
      new CopyPlugin({
        patterns: [
          path.resolve(__dirname, SOURCE_PATH, "api.php")
        ]
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(png|jpg|jpeg|svg|gif|woff)$/i,
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
          test: /\.js$/i,
          exclude: /(node_modules)/i,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: "defaults" }]
              ]
            }
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
