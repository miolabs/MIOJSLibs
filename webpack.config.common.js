const path = require('path');

const TARGET = process.env.TARGET ? process.env.TARGET.tolowerCase() : 'webapp';
const DEV = !!process.env.DEV; // true if defined, false if undefined

module.exports = {
  devtool: 'source-map',
  entry: {
    'index': `./source/index.${TARGET}.ts`
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader', 
        // awesome-typescript loader misses some declaration files, can not generate typing info with dts-bundle with that loader.
        options: {}
      },
      {
        loader: "ifdef-loader",
        options: {
          TARGET, // can be: ios, web, webapp(default)
          DEV,
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
    filename: 'miojslibs.js',
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'build')
  }
};