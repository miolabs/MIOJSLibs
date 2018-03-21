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
        loader: 'awesome-typescript-loader',
        options: {
          // forceIsolatedModules: true
        }
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