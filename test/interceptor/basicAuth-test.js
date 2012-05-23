(function(buster, basicAuth) {

var assert, refute;

assert = buster.assertions.assert;
refute = buster.assertions.refute;

buster.testCase('rest/interceptor/basicAuth', {
	'should authenticate the requst from the config': function(done) {
		var client = basicAuth(
			function(request) { return { request: request }; },
			{ username: 'user', password: 'pass'}
		);
		client({}).then(
			function(response) {
				assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
				done();
			}
		);
	},
	'should authenticate the requst from the request': function(done) {
		var client = basicAuth(
			function(request) { return { request: request }; }
		);
		client({ username: 'user', password: 'pass'}).then(
			function(response) {
				assert.equals('dXNlcjpwYXNz', response.request.headers.Authorization);
				done();
			}
		);
	},
	'should not authenticate without a username': function(done) {
		var client = basicAuth(
			function(request) { return { request: request }; }
		);
		client({}).then(
			function(response) {
				refute.defined(response.request.headers.Authorization);
				done();
			}
		);
	}
});

})(
	this.buster || require('buster'),
	this.rest_interceptor_basicAuth || require('../../src/rest/interceptor/basicAuth')
);
