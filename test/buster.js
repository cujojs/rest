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
		'**'
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
