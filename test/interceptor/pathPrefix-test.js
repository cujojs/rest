(function (buster, define) {

	var pathPrefix, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/pathPrefix', {
		setUp: function (done) {
			if (pathPrefix) { return done(); }
			define('rest/interceptor/pathPrefix-test', ['rest/interceptor/pathPrefix'], function (pp) {
				pathPrefix = pp;
				done();
			});
		},

		'should prepend prefix before path': function (done) {
			var client = pathPrefix(
				function (request) { return { request: request }; },
				{ prefix: '/foo' }
			);
			client({ path: '/bar' }).then(
				function (response) {
					assert.equals('/foo/bar', response.request.path);
					done();
				}
			);
		},
		'should prepend prefix before path, adding slash between path segments': function (done) {
			var client = pathPrefix(
				function (request) { return { request: request }; },
				{ prefix: '/foo' }
			);
			client({ path: 'bar' }).then(
				function (response) {
					assert.equals('/foo/bar', response.request.path);
					done();
				}
			);
		},
		'should prepend prefix before path, not adding extra slash between path segments': function (done) {
			var client = pathPrefix(
				function (request) { return { request: request }; },
				{ prefix: '/foo/' }
			);
			client({ path: 'bar' }).then(
				function (response) {
					assert.equals('/foo/bar', response.request.path);
					done();
				}
			);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/pathPrefix'));
	}
	// Boilerplate for AMD and Node
));
