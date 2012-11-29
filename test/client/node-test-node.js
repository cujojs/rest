(function (buster, define) {

	var assert, refute, fail, undef;

	assert = buster.assert;
	refute = buster.refute;
	fail = buster.assertions.fail;

	define('rest/client/jsonp-test', function (require) {

		var rest, client, server;

		rest = require('rest');
		client = require('rest/client/node');
		server = require('http').createServer();

		buster.testCase('rest/client/node', {
			setUp: function () {
				server.on('request', function (request, response) {
					var requestBody = '';
					request.on('data', function (chunk) {
						requestBody += chunk;
					});
					request.on('end', function () {
						var responseBody = requestBody ? requestBody : 'hello world';
						response.writeHead(200, 'OK', {
							'content-length': responseBody.length,
							'content-type': 'text/plain'
						});
						response.write(responseBody);
						response.end();
					});
				});

				// TODO handle port conflicts
				server.listen(8080);
			},
			tearDown: function () {
				server.close();
			},
			
			'should make a GET by default': function (done) {
				var request = { path: 'http://localhost:8080/' };
				client(request).then(
					function (response) {
						assert(response.raw);
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						assert.equals(response.entity, 'hello world');
						assert.equals(response.status.code, 200);
						assert.equals('text/plain', response.headers['Content-Type']);
						assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					}
				).always(done);
			},
			'should make an explicit GET': function (done) {
				var request = { path: 'http://localhost:8080/', method: 'GET' };
				client(request).then(
					function (response) {
						assert(response.raw);
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						assert.equals(response.entity, 'hello world');
						assert.equals(response.status.code, 200);
						assert.equals('text/plain', response.headers['Content-Type']);
						assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					}
				).always(done);
			},
			'should make a POST with an entity': function (done) {
				var request = { path: 'http://localhost:8080/', entity: 'echo' };
				client(request).then(
					function (response) {
						assert(response.raw);
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(response.entity, 'echo');
						assert.equals(response.status.code, 200);
						assert.equals('text/plain', response.headers['Content-Type']);
						assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					}
				).always(done);
			},
			'should make an explicit POST with an entity': function (done) {
				var request = { path: 'http://localhost:8080/', entity: 'echo', method: 'POST' };
				client(request).then(
					function (response) {
						assert(response.raw);
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(response.entity, 'echo');
						assert.equals(response.status.code, 200);
						assert.equals('text/plain', response.headers['Content-Type']);
						assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					}
				).always(done);
			},
			'should propogate request errors': function (done) {
				var request = { path: 'http://localhost:1234' };
				client(request).then(
					fail,
					function (error) {
						assert(error);
					}
				).always(done);
			},
			'should be the default client': function () {
				assert.same(client, rest);
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
