const path = require('path');
const webpack = require('webpack');
const pjson = require('./package.json');

const TARGET = process.env.TARGET ? process.env.TARGET.toLowerCase() : 'webapp';
const PROD = process.env.NODE_ENV === 'prod';
const ENV = process.env.NODE_ENV || 'dev';


const packageName = `miojslibs${TARGET === 'core' ? '-core' : ''}`;
const buildPath = path.resolve(__dirname, 'packages', packageName, 'build')
const configFile = path.resolve(__dirname, 'packages', packageName, `tsconfig.json`);

console.log(`BUILD MIOJSLibs for '${TARGET}' target to '${ ENV }' environment. from '${configFile}'`);

module.exports = {
  devtool: PROD ? '':'eval-source-map',
  entry: {
    'miojslibs': path.join(__dirname, 'source', `index.${TARGET}.ts`)
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader', 
        // the main reason for ts-loader over awesome-typescript loader misses some declaration files, can not generate typing info with dts-bundle with that loader.
        options: {
          configFile: configFile
        }
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
  mode: PROD ? 'production' : 'development',
  target: 'web',
  output: {
    filename: '[name].js',
    libraryTarget: "umd",
    path: buildPath
  },
  optimization: {
    // // It is possible to split the code for the 
    // splitChunks: {
    //   cacheGroups: {
    //     default: false,
    //     commons: {
    //       // Split code: create a separate "vendor.js" file from the modules imported from "node_modules" folder.
    //       test: /[\\/]node_modules[\\/]/,
    //       name: "vendor",
    //       chunks: "all"
    //     }
    //   }
    // },
    minimize: PROD
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `hash: [hash] date: ${new Date()}, version: ${pjson.version}, target: ${TARGET}`
    })
  ],
  /*
  // You can exclude dependent vendor modules from the bundle.
  // Upon exclusion the library users have to include these libraries themselves (host it themselves, or use a CDN)
  // @see: https://webpack.js.org/configuration/externals/
  externals: {
    "chart.js": 'chart.js',
    "decimal": 'decimal'
  }
  */
};