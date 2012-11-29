(function (define, XMLHttpRequest) {

	define(function (require) {
		"use strict";

		var when, UrlBuilder, normalizeHeaderName, headerSplitRE;

		when = require('when');
		UrlBuilder = require('../UrlBuilder');
		normalizeHeaderName = require('../util/normalizeHeaderName');

		// according to the spec, the line break is '\r\n', but doesn't hold true in practice
		headerSplitRE = /[\r|\n]+/;

		function parseHeaders(raw) {
			// Note: Set-Cookie will be removed by the browser
			var headers = {};

			if (!raw) { return headers; }

			raw.trim().split(headerSplitRE).forEach(function (header) {
				var boundary, name, value;
				boundary = header.indexOf(':');
				name = normalizeHeaderName(header.substring(0, boundary).trim());
				value = header.substring(boundary + 1).trim();
				if (headers[name]) {
					if (Array.isArray(headers[name])) {
						// add to an existing array
						headers[name].push(value);
					}
					else {
						// convert single value to array
						headers[name] = [headers[name], value];
					}
				}
				else {
					// new, single value
					headers[name] = value;
				}
			});

			return headers;
		}

		function xhr(request) {
			var d, client, method, url, headers, entity, headerName, response;

			d = when.defer();

			try {
				client = new XMLHttpRequest();

				entity = request.entity;
				request.method = request.method || (entity ? 'POST' : 'GET');
				method = request.method;
				url = new UrlBuilder(request.path || '', request.params).build();
				client.open(method, url, true);

				headers = request.headers;
				for (headerName in headers) {
					client.setRequestHeader(headerName, headers[headerName]);
				}

				response = {};
				response.request = request;
				response.raw = client;

				request.canceled = false;
				request.cancel = function cancel() {
					request.canceled = true;
					client.abort();
					d.reject(response);
				};

				client.onreadystatechange = function (e) {
					if (client.readyState === (XMLHttpRequest.DONE || 4)) {
						response.status = {
							code: client.status,
							text: client.statusText
						};
						response.headers = parseHeaders(client.getAllResponseHeaders());
						response.entity = client.responseText;

						if (!request.canceled) {
							d.resolve(response);
						}
					}
				};

				client.send(entity);
			}
			catch (e) {
				d.reject(e);
			}

			return d.promise;
		}

		return xhr;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this.XMLHttpRequest
	// Boilerplate for AMD and Node
));
