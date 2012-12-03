(function (buster, define) {

	var assert, refute, fail, undef;

	assert = buster.assert;
	refute = buster.refute;

	fail = function () {
		buster.assertions.fail('should never be called');
	};

	define('rest/client/xhr-test', function (require) {

		var client, rest;

		client = require('rest/client/xhr');
		rest = require('rest');

		buster.testCase('rest/client/xhr', {
			'should make a GET by default': function (done) {
				var request = { path: '/' };
				client(request).then(
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
						refute(request.canceled);
					}
				).always(done);
			},
			'should make an explicit GET': function (done) {
				var request = { path: '/', method: 'GET' };
				client(request).then(
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
						refute(request.canceled);
					}
				).always(done);
			},
			'should make a POST with an entity': function (done) {
				var request = { path: '/', entity: 'hello world' };
				client(request).then(
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
						refute(request.canceled);
					}
				).always(done);
			},
			'should make an explicit POST with an entity': function (done) {
				var request = { path: '/', entity: 'hello world', method: 'POST' };
				client(request).then(
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
						refute(request.canceled);
					}
				).always(done);
			},
			'should abort the request if canceled': function (done) {
				// TDOO find an endpoint that takes a bit to respond, cached files may return synchronously
				var request = { path: '/wait/' + new Date().getTime() };
				client(request).then(
					fail,
					function (response) {
						assert(request.canceled);
						assert.same(0, response.raw.status);

						// this assertion is true in every browser except for IE 6
						// assert.same(XMLHttpRequest.UNSENT || 0, response.raw.readyState);
						assert(response.raw.readyState <= 3);
					}
				).always(done);
				refute(request.canceled);
				request.cancel();
			},
			'should propogate request errors': function (done) {
				var request = { path: 'http://localhost:1234' };
				client(request).then(
					fail,
					function (response) {
						assert.same('loaderror', response.error);
					}
				).always(done);
			},
			'should not make a request that has already been canceled': function (done) {
				var request = { canceled: true, path: '/' };
				client(request).then(
					fail,
					function (response) {
						assert.same(request, response.request);
						assert(request.canceled);
						assert.same('precanceled', response.error);
					}
				).always(done);
			},
			'should be the default client': function () {
				assert.same(client, rest);
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
