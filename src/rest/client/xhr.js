(function (XMLHttpRequest, define) {

	define(["when", "../UrlBuilder", "../util/normalizeHeaderName"], function (when, UrlBuilder, normalizeHeaderName) {
		"use strict";

		var headerSplitRE;

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
			var d, client, method, url, headers, entity, headerName;

			d = when.defer();

			try {
				client = new XMLHttpRequest();

				method = request.method || 'GET';
				url = new UrlBuilder(request.path || '', request.params).build();
				client.open(method, url, true);

				headers = request.headers;
				for (headerName in headers) {
					client.setRequestHeader(headerName, headers[headerName]);
				}

				client.onreadystatechange = function (e) {
					var response;

					if (client.readyState === (XMLHttpRequest.DONE || 4)) {
						response = {};
						response.request = request;
						response.raw = client;
						response.status = {
							code: client.status,
							text: client.statusText
						};
						response.headers = parseHeaders(client.getAllResponseHeaders());
						response.entity = client.responseText;

						d.resolve(response);
					}
				};

				entity = request.entity;
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
	this.XMLHttpRequest,
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
