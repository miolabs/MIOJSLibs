const path = require('path');
// const webpack = require('webpack');
// const pjson = require('./package.json');

const TARGET = process.env.TARGET ? process.env.TARGET.toLowerCase() : 'web';
const PROD = process.env.NODE_ENV === 'prod';
const ENV = process.env.NODE_ENV || 'dev';


const packageName = `miojslibs${TARGET === 'node' ? '-core' : ''}`;
const buildPath = path.resolve(__dirname, 'packages', packageName, 'build')
const buildTarget = (TARGET === 'webapp') ? 'web' : 'node';

// In order to name the resulting file as the package name, and to have the correct module name for the typeingbundle
const config_file = path.resolve(__dirname, `tsconfig.${TARGET}.json`);
let entry = path.join(__dirname, 'source', `index.${TARGET}.ts`);

console.log(`BUILD MIOJSLibs for '${TARGET}' target to '${ ENV }' environment. from '${config_file}'`);
console.log(`Entry point from compilation: '${entry}'`);

module.exports = {  
  mode: PROD ? 'production' : 'development',  
  // devtool: PROD ? '':'eval-source-map',
  devtool: PROD ? '':'source-map',
  entry: entry,
  // target: buildTarget,
  module: {
    rules: [{      
      test: /\.ts$/,
      exclude: /node_modules/,
      // loader: "ts-loader",      
      use: [{
      loader: 'ts-loader', 
      // the main reason for ts-loader over awesome-typescript loader misses some declaration files, can not generate typing info with dts-bundle with that loader.
      options: {
        configFile: config_file,
        onlyCompileBundledFiles: true
      }
    }]
  }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    // path: buildPath,
    // filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    filename:  TARGET != "webworker" ? 'miojslibs.js' : "miojslibs.webworker.js",
    globalObject: 'this',
    library: {
      // name: "miojslibs",
      type: "umd",
    },
  },
  // module: {
  //   rules: [{
  //     // use: [{
  //     //   loader: 'ts-loader', 
  //     //   // the main reason for ts-loader over awesome-typescript loader misses some declaration files, can not generate typing info with dts-bundle with that loader.
  //     //   options: {
  //     //     configFile: configFile
  //     //   }
  //     // },
  //     // {
  //     //   loader: "ifdef-loader",
  //     //   options: {
  //     //     TARGET, // can be: ios, web, webapp(default)
  //     //     PROD,
  //     //     "ifdef-verbose": true, // show matches during build
  //     //     "ifdef-triple-slash": true // false: use double slash comment instead of default triple slash
  //     //   }
  //     // }
  //   // ],
  //   // exclude: /node_modules/
  //   }
  // ]
  // },
  // resolve: {
  //   extensions: ['.ts', '.js']
  // },
      
    // devtoolModuleFilenameTemplate (info) {
    //   // The project is built from packages/${target}/webpack.config.js file.
    //   // It uses '../../sources' folder in tsconfig.json file -> it makes the module names use absolute paths, instead of relative as normally.
    //   //   That is a problem during debugging, since the project can not use general sourcemapPath overrides, it would need the current user's path.
    //   // In order to be able to use general sourcemapPathOverrides, so everyone in the team can use the same configs,
    //   //   I create relative paths from the sources.
    //   const rel = path.relative(__dirname, info.absoluteResourcePath)
    //   return `webpack:///./${rel}`
    // }  
  
    // optimization: {
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
    // minimize: PROD
  // },
  // plugins: [
  //   new webpack.BannerPlugin({
  //     banner: `hash: [hash] date: ${new Date()}, version: ${pjson.version}, target: ${TARGET}`
  //   })
  // ],
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