const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    },
  };

  if (isProd) {
    config.minimizer = [
      new UglifyJsPlugin()
    ]
  }

  return config;
};

const plugins = () => [
  new CleanWebpackPlugin(),

  new HtmlWebpackPlugin({
    template: './index.html',
    cache: isProd,
  }),

  new MiniCssExtractPlugin({
    filename: './assets/css/[name].[contenthash].css',
  }),

  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src/assets/fonts'),
        to: path.resolve(__dirname, 'dist/assets/fonts')
      },
      {
        from: path.resolve(__dirname, 'src/assets/favicon'),
        to: path.resolve(__dirname, 'dist/assets/favicon')
      },
      {
        from: path.resolve(__dirname, 'src/assets/styles/_fonts.css'),
        to: path.resolve(__dirname, 'dist/assets/css/_fonts.css')
      }
    ]
  }),
];


let conf = {
  context: path.resolve(__dirname, 'src'),
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  optimization: optimization(),
  plugins: plugins(),
  performance: {hints: false,},
  devServer: {
    port: 4200,
    overlay: true,
    historyApiFallback: true,
    hot: isDev,
  },
  resolve: {
    extensions: [".js", ".css", ".scss", ".jpg", ".png", ".jpeg"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      icons: path.resolve(__dirname, 'src/assets/icons/'),
      styles: path.resolve(__dirname, 'src/assets/styles/'),
    },
  },
  entry: {
    index: ['@babel/polyfill', './index.js'],
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'assets/js/[name].[contenthash].js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      },
      {
        test: /\.css$/,
        exclude: /src/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      },
      {
        test: /^((?!\.module).)*(scss|css)$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            }
          },
          'postcss-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.module\.(scss|css)$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[local]__[sha1:hash:hex:7]'
              }
            }
          },
          'postcss-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: path.resolve(__dirname, 'src/assets/styles/_scssVars.scss'),
            },
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            emitFile: false,
            //publicPath: '../../',
            outputPath: ''
          },
        }
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]'
          }
        }
      }
    ]
  },
};

module.exports = (env, argv) => conf;