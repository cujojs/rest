var config = exports;

config['rest:node'] = {
	environment: 'node',
	rootPath: '../',
	tests: [
		'test/**/*-test.js',
		'test/**/*-test-node.js'
	],

};

config['rest:browser'] = {
	environment: 'browser',
	rootPath: '../',
	sources: [
		'node_modules/when/when.js',
		'src/rest/util/base64.js',
		'src/rest/util/mixin.js',
		'src/rest/util/beget.js',
		'src/rest/util/pubsub.js',
		'src/rest/util/normalizeHeaderName.js',
		'src/rest/UrlBuilder.js',
		'src/rest/mime/registry.js',
		'src/rest/mime/type/application/json.js',
		'src/rest/mime/type/text/plain.js',
		'src/rest/client/xhr.js',
		'src/rest.js',
		'src/rest/interceptor/_base.js',
		'src/rest/interceptor/basicAuth.js',
		'src/rest/interceptor/entity.js',
		'src/rest/interceptor/errorCode.js',
		'src/rest/interceptor/mime.js',
		'src/rest/interceptor/pathPrefix.js',
		'src/rest/interceptor/oAuth.js'
	],
	tests: [
		'test/**/*-test.js',
		'test/**/*-test-browser.js'
	]
};
