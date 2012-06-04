(function (buster, define) {

	var mime, rest, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/mime', {
		setUp: function (done) {
			if (mime) { return done(); }
			define('rest/interceptor/mime-test', ['rest/interceptor/mime', 'rest'], function (m, r) {
				mime = m;
				rest = r;
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
		},
		'should encode the request entity from the Content-Type of the request, ignoring the filter config': function (done) {
			var client;

			client = mime(
				function (request) {
					return { request: request, headers: {} };
				},
				{ mime: 'text/plain' }
			);

			client({ entity: {}, headers: { 'Content-Type': 'application/json' } }).then(function (response) {
				assert.equals('{}', response.request.entity);
				assert.equals('application/json', response.request.headers['Content-Type']);
				assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
			}).always(done);
		},
		'should not overwrite the requests Accept header': function (done) {
			var client;

			client = mime(
				function (request) {
					return { request: request, headers: {} };
				},
				{ mime: 'application/json' }
			);

			client({ entity: {}, headers: { Accept: 'foo' } }).then(function (response) {
				assert.equals('{}', response.request.entity);
				assert.equals('application/json', response.request.headers['Content-Type']);
				assert.equals('foo', response.request.headers.Accept);
			}).always(done);
		},
		'should have the default client as the parent by default': function () {
			assert.same(rest, mime().skip());
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/mime'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));
