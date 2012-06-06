var parser, http, https, when, UrlBuilder, normalizeHeaderName, httpsExp;

parser = require('url');
http = require('http');
https = require('https');
when = require('when');
UrlBuilder = require('../UrlBuilder');
normalizeHeaderName = require('../util/normalizeHeaderName');
httpsExp = /^https/i;

function node(request) {
	"use strict";

	var d, options, clientRequest, client, url, headers, entity;

	d = when.defer();

	url = new UrlBuilder(request.path || '', request.params).build();
	client = url.match(httpsExp) ? https : http;

	options = parser.parse(url);
	options.method = request.method || 'GET';
	headers = options.headers = {};
	Object.keys(request.headers || {}).forEach(function (name) {
		headers[normalizeHeaderName(name)] = request.headers[name];
	});
	entity = request.entity;
	if (!headers['Content-Length']) {
		headers['Content-Length'] = entity ? Buffer.byteLength(entity, 'utf8') : 0;
	}

	try {
		clientRequest = client.request(options, function (clientResponse) {
			var response;

			response = {};
			response.request = request;
			response.raw = clientResponse;
			response.status = {
				code: clientResponse.statusCode
				// node doesn't provide access to the status text
			};
			response.headers = {};
			Object.keys(clientResponse.headers).forEach(function (name) {
				response.headers[normalizeHeaderName(name)] = clientResponse.headers[name];
			});

			clientResponse.on('data', function (data) {
				if (!('entity' in response)) {
					response.entity = '';
				}
				// normalize Buffer to a String
				response.entity += data.toString();
			});
			clientResponse.on('end', function () {
				d.resolve(response);
			});
		});

		if (entity) {
			clientRequest.write(entity);
		}
		clientRequest.end();
	}
	catch (e) {
		d.reject(e);
	}

	return d.promise;
}

module.exports = node;
