(function (buster, define) {

	var location, rest, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/location', {
		setUp: function (done) {
			if (location) { return done(); }
			define('rest/interceptor/location-test', ['rest/interceptor/location', 'rest'], function (l, r) {
				location = l;
				rest = r;
				done();
			});
		},

		'should follow the location header, once': function (done) {
			var client, spy;
			spy = this.spy(function (request) { return { headers: { Location: '/foo/' + spy.callCount } }; });
			client = location(spy);
			client({}).then(
				function (response) {
					assert.equals('/foo/2', response.headers.Location);
					assert.same(2, spy.callCount);
				}
			).always(done);
		},
		'should return the response if there is no location header': function (done) {
			var client, spy;
			spy = this.spy(function () { return { status: { code: 200 } }; });
			client = location(spy);
			client({}).then(
				function (response) {
					assert.equals(200, response.status.code);
					assert.same(1, spy.callCount);
				}
			).always(done);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/location'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));
