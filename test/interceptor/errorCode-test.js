(function (buster, define) {

	var errorCode, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/errorCode', {
		setUp: function (done) {
			if (errorCode) { return done(); }
			define('rest/interceptor/errorCode-test', ['rest/interceptor/errorCode'], function (ec) {
				errorCode = ec;
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
					done();
				},
				function (response) {
					assert.fail('error handler should not be involved');
					done();
				}
			);
		},
		'should reject for 400 or greater by default': function (done) {
			var client = errorCode(
				function () { return { status: { code: 400 } }; }
			);
			client({}).then(
				function (response) {
					assert.fail('success handler should not be involved');
					done();
				},
				function (response) {
					assert.equals(400, response.status.code);
					done();
				}
			);
		},
		'should reject lower then 400 with a custom code': function (done) {
			var client = errorCode(
				function () { return { status: { code: 300 } }; },
				{ code: 300 }
			);
			client({}).then(
				function (response) {
					assert.fail('success handler should not be involved');
					done();
				},
				function (response) {
					assert.equals(300, response.status.code);
					done();
				}
			);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../src/rest/interceptor/errorCode'));
	}
	// Boilerplate for AMD and Node
));
