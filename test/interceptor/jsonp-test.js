(function (buster, define) {

	var jsonp, jsonpClient, when, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/jsonp', {
		setUp: function (done) {
			if (jsonp) { return done(); }
			define('rest/interceptor/jsonp-test', ['rest/interceptor/jsonp', 'rest/client/jsonp', 'when'], function (jpi, jpc, w) {
				jsonp = jpi;
				jsonpClient = jpc;
				when = w;
				done();
			});
		},

		'should include callback info from config in request by default': function (done) {
			var client = jsonp(
				function (request) { return when({ request: request }); },
				{ callback: { param: 'callback', prefix: 'jsonp' } }
			);
			client({}).then(
				function (response) {
					assert.equals('callback', response.request.callback.param);
					assert.equals('jsonp', response.request.callback.prefix);
				}
			).always(done);
		},
		'should include callback info from request overridding config values': function (done) {
			var client = jsonp(
				function (request) { return when({ request: request }); },
				{ callback: { param: 'callback', prefix: 'jsonp' } }
			);
			client({ callback: { param: 'customCallback', prefix: 'customPrefix' } }).then(
				function (response) {
					assert.equals('customCallback', response.request.callback.param);
					assert.equals('customPrefix', response.request.callback.prefix);
				}
			).always(done);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/jsonp'), require('../../client/jsonp'), require('when'));
	}
	// Boilerplate for AMD and Node
));
