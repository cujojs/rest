(function (buster, define) {

	var xhr, rest, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/client/xhr', {
		setUp: function (done) {
			if (xhr) { return done(); }
			define('rest/client/xhr-test', ['rest/client/xhr', 'rest'], function (x, r) {
				xhr = x;
				rest = r;
				done();
			});
		},

		'should make a GET by default': function (done) {
			var request = { path: '/' };
			xhr(request).then(
				function (response) {
					var xhr, name;
					xhr = response.raw;
					assert.same(request, response.request);
					assert.equals(xhr.responseText, response.entity);
					assert.equals(xhr.status, response.status.code);
					assert.equals(xhr.statusText, response.status.text);
					for (name in response.headers) {
						assert.equals(xhr.getResponseHeader(name), response.headers[name]);
					}
				}
			).always(done);
		},
		'should make a POST with an entity': function (done) {
			var request = { path: '/', method: 'post', entity: 'hello world' };
			xhr(request).then(
				function (response) {
					var xhr, name;
					xhr = response.raw;
					assert.same(request, response.request);
					assert.equals(xhr.responseText, response.entity);
					assert.equals(xhr.status, response.status.code);
					assert.equals(xhr.statusText, response.status.text);
					for (name in response.headers) {
						assert.equals(xhr.getResponseHeader(name), response.headers[name]);
					}
				}
			).always(done);
		},
		'should be the default client': function () {
			assert.same(xhr, rest);
		}
		// TODO spy XmlHttpRequest
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../client/xhr'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));