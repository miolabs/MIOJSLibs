const config = require('../webpack.config.common');

//make sure the properties exist
config.entry = config.entry || {}
config.output = config.output || {}

// update the values
config.entry.index = './Bundle_WebWorker.ts'
config.output.filename = 'Bundle_WebWorker.js'

// console.log(config)
module.exports = config;