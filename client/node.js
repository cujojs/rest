/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

(function (define, envRequire) {
	'use strict';

	define(function (require) {

		var parser, http, https, when, UrlBuilder, stream, buffer, normalizeHeaderName, httpsExp;

		parser = envRequire('url');
		http = envRequire('http');
		https = envRequire('https');
		when = require('when');
		UrlBuilder = require('../UrlBuilder');
		stream = require('../util/stream');
		buffer = require('../util/buffer');
		normalizeHeaderName = require('../util/normalizeHeaderName');

		httpsExp = /^https/i;

		function node(request) {

			var d, options, clientRequest, client, url, headers, entity, response;

			request = typeof request === 'string' ? { path: request } : request || {};
			response = { request: request };

			if (request.canceled) {
				response.error = 'precanceled';
				return when.reject(response);
			}

			d = when.defer();

			url = new UrlBuilder(request.path || '', request.params).build();
			client = url.match(httpsExp) ? https : http;

			options = parser.parse(url);
			entity = request.entity;
			request.method = request.method || (entity ? 'POST' : 'GET');
			options.method = request.method;
			headers = options.headers = {};
			Object.keys(request.headers || {}).forEach(function (name) {
				headers[normalizeHeaderName(name)] = request.headers[name];
			});
			if (!headers['Content-Length']) {
				headers['Content-Length'] = entity ? buffer.Buffer.byteLength(entity, 'utf8') : 0;
			}

			request.canceled = false;
			request.cancel = function cancel() {
				request.canceled = true;
				clientRequest.abort();
			};

			clientRequest = client.request(options, function (clientResponse) {
				response.raw = {
					request: clientRequest,
					response: clientResponse
				};
				response.status = {
					code: clientResponse.statusCode
					// node doesn't provide access to the status text
				};
				response.headers = {};
				Object.keys(clientResponse.headers).forEach(function (name) {
					response.headers[normalizeHeaderName(name)] = clientResponse.headers[name];
				});

				response.entity = new stream.PassThrough();
				if (clientResponse instanceof stream.Readable) {
					clientResponse.pipe(response.entity);
				}
				else {
					response.entity.end(clientResponse);
				}

				d.resolve(response);
			});

			clientRequest.on('error', function (e) {
				response.error = e;
				d.reject(response);
			});

			if (entity) {
				if (entity instanceof stream.Readable) {
					entity.pipe(clientRequest);
				} else {
					clientRequest.end(entity);
				}
			}
			else {
				clientRequest.end();
			}

			return d.promise;
		}

		node.chain = function (interceptor, config) {
			return interceptor(node, config);
		};

		return node;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof require === 'function' && require
	// Boilerplate for AMD and Node
));
