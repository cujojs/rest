(function (buster, define) {

	var basicAuth, rest, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/basicAuth', {
		setUp: function (done) {
			if (basicAuth) { return done(); }
			define('rest/interceptor/basicAuth-test', ['rest/interceptor/basicAuth', 'rest'], function (ba, r) {
				basicAuth = ba;
				rest = r;
				done();
			});
		},

		'should authenticate the requst from the config': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; },
				{ username: 'user', password: 'pass'}
			);
			client({}).then(function (response) {
				assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
			}).always(done);
		},
		'should authenticate the requst from the request': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; }
			);
			client({ username: 'user', password: 'pass'}).then(function (response) {
				assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
			}).always(done);
		},
		'should not authenticate without a username': function (done) {
			var client = basicAuth(
				function (request) { return { request: request }; }
			);
			client({}).then(function (response) {
				refute.defined(response.request.headers.Authorization);
			}).always(done);
		},
		'should have the default client as the parent by default': function () {
			assert.same(rest, basicAuth().skip());
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/basicAuth'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));
