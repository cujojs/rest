/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var parser, http, https, when, UrlBuilder, normalizeHeaderName, httpsExp;

		parser = require('url');
		http = require('http');
		https = require('https');
		when = require('when');
		UrlBuilder = require('../UrlBuilder');
		normalizeHeaderName = require('../util/normalizeHeaderName');

		httpsExp = /^https/i;

		// TODO remove once Node 0.6 is no longer supported
		Buffer.concat = Buffer.concat || function (list, length) {
			/*jshint plusplus:false, shadow:true */
			// from https://github.com/joyent/node/blob/v0.8.21/lib/buffer.js
			if (!Array.isArray(list)) {
				throw new Error('Usage: Buffer.concat(list, [length])');
			}

			if (list.length === 0) {
				return new Buffer(0);
			} else if (list.length === 1) {
				return list[0];
			}

			if (typeof length !== 'number') {
				length = 0;
				for (var i = 0; i < list.length; i++) {
					var buf = list[i];
					length += buf.length;
				}
			}

			var buffer = new Buffer(length);
			var pos = 0;
			for (var i = 0; i < list.length; i++) {
				var buf = list[i];
				buf.copy(buffer, pos);
				pos += buf.length;
			}
			return buffer;
		};

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
				headers['Content-Length'] = entity ? Buffer.byteLength(entity, 'utf8') : 0;
			}

			request.canceled = false;
			request.cancel = function cancel() {
				request.canceled = true;
				clientRequest.abort();
			};

			clientRequest = client.request(options, function (clientResponse) {
				// Array of Buffers to collect response chunks
				var buffers = [];

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

				clientResponse.on('data', function (data) {
					// Collect the next Buffer chunk
					buffers.push(data);
				});

				clientResponse.on('end', function () {
					// Create the final response entity
					response.entity = buffers.length > 0 ? Buffer.concat(buffers).toString() : '';
					buffers = null;

					d.resolve(response);
				});
			});

			clientRequest.on('error', function (e) {
				response.error = e;
				d.reject(response);
			});

			if (entity) {
				clientRequest.write(entity);
			}
			clientRequest.end();

			return d.promise;
		}

		node.chain = function (interceptor, config) {
			return interceptor(node, config);
		};

		return node;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
