(function (buster, define) {

	var jsonp, jsonpInterceptor, rest, assert, refute;

	assert = buster.assert;
	refute = buster.refute;
	buster.testRunner.timeout = 500;

	function never(done) {
		return function () {
			assert(false, 'this method should never be invoked');
			done();
		};
	}

	buster.testCase('rest/client/jsonp', {
		setUp: function (done) {
			if (jsonp) { return done(); }
			define('rest/client/jsonp-test', ['rest/client/jsonp', 'rest/interceptor/jsonp', 'rest'], function (jpc, jpi, r) {
				jsonp = jpc;
				jsonpInterceptor = jpi;
				rest = r;
				done();
			});
		},

		'should make a GET by default': function (done) {
			var request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'javascript' } };
			jsonp(request).then(
				function (response) {
					assert(response.entity.responseData);
					done();
				},
				never(done)
			);
		},
		'should use the jsonp client from the jsonp interceptor by default': function (done) {
			var request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'html5' } };
			jsonpInterceptor()(request).then(
				function (response) {
					assert(response.entity.responseData);
					done();
				},
				never(done)
			);
		},
		'should not be the default client': function () {
			refute.same(jsonp, rest);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../src/rest/client/jsonp'), require('../../src/rest/interceptor/jsonp'), require('../../src/rest'));
	}
	// Boilerplate for AMD and Node
));
