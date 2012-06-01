var config = exports;

config['rest:node'] = {
	environment: 'node',
	rootPath: '../',
	tests: [
		'test/**/*-test.js',
		'test/**/*-test-node.js'
	]
};

config['rest:browser'] = {
	environment: 'browser',
	rootPath: '../',
	resources: [
		'node_modules/curl/**',
		'node_modules/dojo/**',
		'node_modules/poly/**',
		'node_modules/when/**',
		'node_modules/wire/**',
		'lib/**',
		'src/**',
		'test/**'
	],
	libs: [
		'lib/curl-config.js',
		'node_modules/curl/src/curl.js'
	],
	sources: [
		// loaded as resources
	],
	tests: [
		'test/**/*-test.js',
		'test/**/*-test-browser.js'
	]
};
