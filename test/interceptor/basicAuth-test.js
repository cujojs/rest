(function (buster, define) {

	var basicAuth, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/basicAuth', {
		setUp: function (done) {
			if (basicAuth) { return done(); }
			define('rest/interceptor/basicAuth-test', ['rest/interceptor/basicAuth'], function (ba) {
				basicAuth = ba;
				done();
			});
		},

		'should authenticate the requst from the config': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; },
				{ username: 'user', password: 'pass'}
			);
			client({}).then(
				function (response) {
					assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
					done();
				}
			);
		},
		'should authenticate the requst from the request': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; }
			);
			client({ username: 'user', password: 'pass'}).then(
				function (response) {
					assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
					done();
				}
			);
		},
		'should not authenticate without a username': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; }
			);
			client({}).then(
				function (response) {
					refute.defined(response.request.headers.Authorization);
					done();
				}
			);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../src/rest/interceptor/basicAuth'));
	}
	// Boilerplate for AMD and Node
));
