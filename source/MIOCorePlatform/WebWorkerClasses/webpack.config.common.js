const path = require('path');

module.exports = {
    //devtool: 'inline-source-map',
    target: 'webworker', // The libraries webpack uses for target, in this case it must be webworker
    mode: (!!process.env.PROD)?'production': 'development', // development is the default if PROD environmetal variable is not defined ,
    output: {
        libraryTarget: "umd",
        path: path.resolve(__dirname, '..', '..', '..', 'build', 'ww')
    },
    resolve: {
        extensions: ['.ts', '.js']
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
                            // ifdef loader excludes the unnecessary barrel exports (MIOCorePlatform/index.ts) from ts compilation
                            // For more information see the README in this folder
                        ]
                    }
                },
                //'tee-loader', //very simple plugin to print the contents that pass through. npm install tee-loader
                {
                    loader: "ifdef-loader",
                    options: {
                        TARGET: 'webworker', // Target info for preprocessing condition checks
                        "ifdef-verbose": true, // show matches during build
                        "ifdef-triple-slash": true // false: use double slash comment instead of default triple slash
                    }
                }
            ],
            exclude: /node_modules/
        }]
    }
}