const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const TARGET = process.env.TARGET ? process.env.TARGET.tolowerCase() : 'webapp';
const PROD = !!process.env.PROD; // true if defined, false if undefined

module.exports = {
  devtool: 'source-map',
  entry: {
    'miojslibs': `./source/index.${TARGET}.ts`
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader', 
        // the main reason for ts-loader is that awesome-typescript loader misses some declaration files, can not generate typing info with dts-bundle with that loader.
        options: {}
      },
      {
        loader: "ifdef-loader",
        options: {
          TARGET, // can be: ios, web, webapp(default)
          PROD,
          "ifdef-verbose": true, // show matches during build
          "ifdef-triple-slash": true // false: use double slash comment instead of default triple slash
        }
      }
      ],
      exclude: /node_modules/
    }
  ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  mode: 'development',
  target: 'web',
  output: {
    filename: '[name].js',
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'build')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    },
    minimize: true // !PROD // for development it might be more suitable
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        {from: 'build/*.js*', to: '../dist/js', flatten: true}
      ], 
      {
        debug: 'info'
      }
    )
  ]
};