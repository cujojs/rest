(function (buster, define) {

	var assert, refute, fail, undef;

	assert = buster.assert;
	refute = buster.refute;
	fail = buster.assertions.fail;

	define('rest/client/jsonp-test', function (require) {

		var jsonp, jsonpInterceptor, rest;

		jsonp = require('rest/client/jsonp');
		jsonpInterceptor = require('rest/interceptor/jsonp');
		rest = require('rest');

		buster.testCase('rest/client/jsonp', {
			'should make a GET by default': function (done) {
				var request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'javascript' } };
				jsonp(request).then(
					function (response) {
						assert(response.entity.responseData);
						assert.same(request, response.request);
						refute(request.canceled);
						refute(response.raw.parentNode);
					}
				).always(done);
			},
			'should use the jsonp client from the jsonp interceptor by default': function (done) {
				var request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'html5' } };
				jsonpInterceptor()(request).then(
					function (response) {
						assert(response.entity.responseData);
						assert.same(request, response.request);
						refute(request.canceled);
						refute(response.raw.parentNode);
					}
				).always(done);
			},
			'should abort the request if canceled': function (done) {
				var request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'html5' } };
				jsonp(request).then(
					fail,
					function (response) {
						assert.same(request, response.request);
						assert(request.canceled);
						refute(response.raw.parentNode);
					}
				).always(done);
				refute(request.canceled);
				request.cancel();
			},
			'should propogate request errors': function (done) {
				var request = { path: 'http://localhost:1234' };
				jsonp(request).then(
					fail,
					function (response) {
						assert(response.error);
					}
				).always(done);
			},
			'should not be the default client': function () {
				refute.same(jsonp, rest);
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
