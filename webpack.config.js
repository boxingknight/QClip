const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this'
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    hot: false,
    liveReload: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    }),
    new DefinePlugin({
      'global': 'globalThis'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    'events': 'commonjs events'
  },
  node: {
    __dirname: false,
    __filename: false,
    global: true,
    globalThis: true
  }
};

