const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
       filename: 'app.js',
       path: path.resolve(__dirname, 'public')
    },
    devServer: {
      static: path.join(__dirname, 'public'),
      port: 3000
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
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
      ]
    }
};
