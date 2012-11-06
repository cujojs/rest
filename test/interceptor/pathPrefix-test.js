(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest/interceptor/pathPrefix-test', function (require) {

		var pathPrefix, rest;

		pathPrefix = require('rest/interceptor/pathPrefix');
		rest = require('rest');

		buster.testCase('rest/interceptor/pathPrefix', {
			'should prepend prefix before path': function (done) {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo' }
				);
				client({ path: '/bar' }).then(function (response) {
					assert.equals('/foo/bar', response.request.path);
				}).always(done);
			},
			'should prepend prefix before path, adding slash between path segments': function (done) {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo' }
				);
				client({ path: 'bar' }).then(function (response) {
					assert.equals('/foo/bar', response.request.path);
				}).always(done);
			},
			'should prepend prefix before path, not adding extra slash between path segments': function (done) {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo/' }
				);
				client({ path: 'bar' }).then(function (response) {
					assert.equals('/foo/bar', response.request.path);
				}).always(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, pathPrefix().skip());
			}
		});

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
