/* jshint esversion: 6 */

const dts = require('dts-bundle');
const name = process.argv[2] || 'miojslibs';

const sourceName = process.argv[3] || 'index.webapp';

const config = {
	name,
	main: `build/types/${sourceName}.d.ts`
};

console.log(config);
dts.bundle(config);