/* jshint esversion: 6 */

const dts = require('dts-bundle');
const name = process.argv[2] || 'miojslibs';

const sourceName = process.argv[3] || 'index.webapp';

const config = {
	name,
	main: `build/types/${sourceName}.d.ts`
};

console.log(`INFO: Start type_deifinition bundling with the following data: ${JSON.stringify(config)}`);
try {
	dts.bundle(config);
	console.log("INFO: Typing files bundled successfully");
} catch (error) {
	console.error("ERROR: Could not generate the bundle, the files might not be ready yet: ", error.name);
}