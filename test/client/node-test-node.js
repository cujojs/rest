var buster, rest, client, server, assert, refute;

buster = require('buster');
rest = require('../../rest');
client = require('../../client/node');
server = require('http').createServer();
assert = buster.assert;
refute = buster.refute;

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

buster.testCase('rest/client/node', {

	setUp: function () {
		// TODO check that port is free
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
				assert.equals(response.entity, 'hello world');
				assert.equals(response.status.code, 200);
				assert.equals('text/plain', response.headers['Content-Type']);
				assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
			}
		).always(done);
	},

	'should make a POST with an entity': function (done) {
		var request = { path: 'http://localhost:8080/', method: 'POST', entity: 'echo' };
		client(request).then(
			function (response) {
				assert(response.raw);
				assert.same(request, response.request);
				assert.equals(response.entity, 'echo');
				assert.equals(response.status.code, 200);
				assert.equals('text/plain', response.headers['Content-Type']);
				assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
			}
		).always(done);
	},

	'should be the default client': function () {
		assert.same(client, rest);
	}

});
