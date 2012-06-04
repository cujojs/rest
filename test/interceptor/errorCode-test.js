(function (buster, define) {

	var errorCode, rest, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/errorCode', {
		setUp: function (done) {
			if (errorCode) { return done(); }
			define('rest/interceptor/errorCode-test', ['rest/interceptor/errorCode', 'rest'], function (ec, r) {
				errorCode = ec;
				rest = r;
				done();
			});
		},

		'should resolve for less than 400 by default': function (done) {
			var client = errorCode(
				function () { return { status: { code: 399 } }; }
			);
			client({}).then(
				function (response) {
					assert.equals(399, response.status.code);
				}
			).always(done);
		},
		'should reject for 400 or greater by default': function (done) {
			var client = errorCode(
				function () { return { status: { code: 400 } }; }
			);
			client({}).then(
				undefined,
				function (response) {
					assert.equals(400, response.status.code);
				}
			).always(done);
		},
		'should reject lower then 400 with a custom code': function (done) {
			var client = errorCode(
				function () { return { status: { code: 300 } }; },
				{ code: 300 }
			);
			client({}).then(
				undefined,
				function (response) {
					assert.equals(300, response.status.code);
				}
			).always(done);
		},
		'should have the default client as the parent by default': function () {
			assert.same(rest, errorCode().skip());
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/errorCode'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));
