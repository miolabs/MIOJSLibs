/* jshint esversion: 6 */

const dts = require('dts-bundle');
const name = process.argv[2] || 'miojslibs';

const target = process.argv[3] || 'webapp';

const config = {
	name,
	main: `build/types/index.${target}.d.ts`
};

console.log(`INFO: Start type_definition bundling with the following data: ${JSON.stringify(config)}`);
try {
	dts.bundle(config);
	console.log("INFO: Typing files bundled successfully");
} catch (error) {
	console.error("ERROR: Could not generate the bundle, the files might not be ready yet: ", error.name);
}