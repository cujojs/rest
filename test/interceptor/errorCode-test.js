(function (buster, define) {

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest/interceptor/errorCode-test', function (require) {

		var errorCode, rest;

		errorCode = require('rest/interceptor/errorCode');
		rest = require('rest');

		buster.testCase('rest/interceptor/errorCode', {
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

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
