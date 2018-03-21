const path = require('path');

const TARGET = 'webworker';
const DEV = !!process.env.DEV; // true if defined, false if undefined

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'index': './Bundle_WebWorker.ts'
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            use: [
                {
                    loader: 'awesome-typescript-loader',
                    options: {
                        forceIsolatedModules: false,
                        useCache: false,
                        errorsAsWarnings: true,
                        transpileOnly: false
                    }
                },
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
    target: 'web',
    output: {
        filename: 'Bundle_WebWorker.js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, 'build')
    }
};