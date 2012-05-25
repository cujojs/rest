(function (buster, pathPrefix) {

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/pathPrefix', {
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
	this.rest_interceptor_pathPrefix || require('../../src/rest/interceptor/pathPrefix')
));
