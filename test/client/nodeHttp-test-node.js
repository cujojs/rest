var buster, client, server, assert, refute;

buster = require('buster');
client = require('../../src/rest/client/nodeHttp');
server = require('http').createServer();
assert = buster.assert;
refute = buster.refute;

server.on('request', function(request, response) {
    var requestBody = "";
    request.on('data', function(chunk) {
        requestBody += chunk;
    });

    request.on('end', function() {
        var responseBody = requestBody ? requestBody : 'hello world';
        response.writeHead(200, 'OK', {
        'Content-Length': responseBody.length,
        'Content-Type': 'text/plain' });
        response.write(responseBody);
        response.end();
    });
});

buster.testCase('rest/client/nodeHttp', {

    setUp: function() {
        server.listen(8080);
    },

    tearDown: function() {
        server.close();
    },

    'should make a GET by default': function(done) {
        var request = { path: 'http://localhost:8080/' };
        client(request).then(
            function(response) {
                var clientResponse = response.raw;
                assert.same(request, response.request);
                assert.equals(response.entity, "hello world");
                assert.equals(response.status.code, 200);
                assert.equals("", response.status.text);
                for (var name in response.headers) {
                    assert.equals(clientResponse.headers[name], response.headers[name]);
                }
                done();
            }
        );
    },
    'should make a POST with an entity': function(done) {
        var request = { path: 'http://localhost:8080/', method: 'POST', entity: 'echo' };
        client(request).then(
            function(response) {
                var clientResponse = response.raw;
                assert.same(request, response.request);
                assert.equals(response.entity, "echo");
                assert.equals(response.status.code, 200);
                assert.equals("", response.status.text);
                for (var name in response.headers) {
                    assert.equals(response.headers[name], clientResponse.headers[name]);
                }
                done();
            }
        );
    }
});