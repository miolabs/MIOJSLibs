const path = require('path');

const TARGET = 'webworker';
const DEV = !!process.env.DEV; // true if defined, false if undefined

module.exports = {
    //devtool: 'inline-source-map',
    entry: {
        'index': './Bundle_WebWorker.ts'
    },
    output: {
        filename: 'Bundle_WebWorker.js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, '..', '..', '..', '..', 'build', 'ww')
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                {
                    loader: 'awesome-typescript-loader',
                    options: {
                        errorsAsWarnings: true,
                        reportFiles: [
                            '!../../(Web|iOS)/*.ts',
                            // ifdef loader excludes the unnecessary barrel exports (MIOCorePlatform/index.ts) from ts compilation, 
                            // but awesome-typescript-loader still reports errors from the excluded files probably due to es6 module static analysis
                            // in order to turn off these reports, you can add the other platform names as a minimatch glob pattern.
                            // More info: https://github.com/isaacs/minimatch
                        ]
                    }
                },
                //'tee-loader', //very simple plugin for debug purposes. npm install tee-loader
                {
                    loader: "ifdef-loader",
                    options: {
                        TARGET, // can be: ios, web, webapp(default), webworker
                        DEV,
                        "ifdef-verbose": true, // show matches during build
                        "ifdef-triple-slash": true // false: use double slash comment instead of default triple slash
                    }
                }
            ],
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    mode: 'development',
    target: 'web'
};