(function (buster, define) {

	var pathPrefix, rest, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/pathPrefix', {
		setUp: function (done) {
			if (pathPrefix) { return done(); }
			define('rest/interceptor/pathPrefix-test', ['rest/interceptor/pathPrefix', 'rest'], function (pp, r) {
				pathPrefix = pp;
				rest = r;
				done();
			});
		},

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

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/pathPrefix'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));
