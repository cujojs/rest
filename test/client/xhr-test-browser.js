(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	define('rest/client/xhr-test', function (require) {

		var xhr, rest;

		xhr = require('rest/client/xhr');
		rest = require('rest');

		buster.testCase('rest/client/xhr', {
			'should make a GET by default': function (done) {
				var request = { path: '/' };
				xhr(request).then(
					function (response) {
						var xhr, name;
						xhr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						assert.equals(xhr.responseText, response.entity);
						assert.equals(xhr.status, response.status.code);
						assert.equals(xhr.statusText, response.status.text);
						for (name in response.headers) {
							assert.equals(xhr.getResponseHeader(name), response.headers[name]);
						}
					}
				).always(done);
			},
			'should make an explicit GET': function (done) {
				var request = { path: '/', method: 'GET' };
				xhr(request).then(
					function (response) {
						var xhr, name;
						xhr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						assert.equals(xhr.responseText, response.entity);
						assert.equals(xhr.status, response.status.code);
						assert.equals(xhr.statusText, response.status.text);
						for (name in response.headers) {
							assert.equals(xhr.getResponseHeader(name), response.headers[name]);
						}
					}
				).always(done);
			},
			'should make a POST with an entity': function (done) {
				var request = { path: '/', entity: 'hello world' };
				xhr(request).then(
					function (response) {
						var xhr, name;
						xhr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(xhr.responseText, response.entity);
						assert.equals(xhr.status, response.status.code);
						assert.equals(xhr.statusText, response.status.text);
						for (name in response.headers) {
							assert.equals(xhr.getResponseHeader(name), response.headers[name]);
						}
					}
				).always(done);
			},
			'should make an explicit POST with an entity': function (done) {
				var request = { path: '/', entity: 'hello world', method: 'POST' };
				xhr(request).then(
					function (response) {
						var xhr, name;
						xhr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(xhr.responseText, response.entity);
						assert.equals(xhr.status, response.status.code);
						assert.equals(xhr.statusText, response.status.text);
						for (name in response.headers) {
							assert.equals(xhr.getResponseHeader(name), response.headers[name]);
						}
					}
				).always(done);
			},
			'should be the default client': function () {
				assert.same(xhr, rest);
			}
		});
		// TODO spy XmlHttpRequest

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
