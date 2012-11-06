(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest/interceptor/location-test', function (require) {

		var location, rest;

		location = require('rest/interceptor/location');
		rest = require('rest');

		buster.testCase('rest/interceptor/location', {
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
