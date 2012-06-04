(function (buster, define) {

	var mime, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/mime', {
		setUp: function (done) {
			if (mime) { return done(); }
			define('rest/interceptor/mime-test', ['rest/interceptor/mime'], function (m) {
				mime = m;
				done();
			});
		},

		'should return the response entity decoded': function (done) {
			var client;

			client = mime(function () {
				return { entity: '{}', headers: { 'Content-Type': 'application/json' } };
			});

			client({}).then(function (response) {
				assert.equals({}, response.entity);
			}).always(done);
		},
		'should encode the request entity': function (done) {
			var client;

			client = mime(
				function (request) {
					return { request: request, headers: {} };
				},
				{ mime: 'application/json' }
			);

			client({ entity: {} }).then(function (response) {
				assert.equals('{}', response.request.entity);
			}).always(done);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/mime'));
	}
	// Boilerplate for AMD and Node
));
