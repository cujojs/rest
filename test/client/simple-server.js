var util = require('util'),
    http = require('http'),
    server = http.createServer();

server.on('request', function(request, response) {
    var body = "";
    request.on('data', function(chunk) {
        body += chunk;
    });

    request.on('end', function() {
        var responseBody = body ? body: 'hello world';
        response.writeHead(200, 'OK', {
        'Content-Length': responseBody.length,
        'Content-Type': 'text/plain' });
        response.write(responseBody);
        response.end();
    });
});

exports.start = function() {
    server.listen(8080);
};

exports.stop = function() {
    server.close();
};