(function(XMLHttpRequest, define) {

define(["when", "../UrlBuilder", "../util/normalizeHeaderName"], function(when, UrlBuilder, normalizeHeaderName) {
	"use strict";

	var headerSplitRE;

	// according to the spec, the line break is '\r\n', but doesn't hold true in practice
	headerSplitRE = /[\r|\n]+/;

	function parseHeaders(raw) {
		// Note: Set-Cookie will be removed by the browser
		var headers = {};

		if (!raw) { return headers; }

		raw.trim().split(headerSplitRE).forEach(function(header) {
			var boundary, name, value;
			boundary = header.indexOf(":");
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
		var d, xhr, method, url, headers, entity;

		d = when.defer();

		try {
			xhr = new XMLHttpRequest();

			method = request.method || 'GET';
			url = new UrlBuilder(request.path || "", request.params).build();
			xhr.open(method, url, true);

			headers = request.headers;
			for (var header in headers) {
				xhr.setRequestHeader(header, headers[header]);
			}

			xhr.onreadystatechange = function (e) {
				var response;

				if (xhr.readyState == XMLHttpRequest.DONE) {
					response = {};
					response.request = request;
					response.raw = xhr;
					response.status = {
						code: xhr.status,
						text: xhr.statusText
					};
					response.headers = parseHeaders(xhr.getAllResponseHeaders());
					response.entity = xhr.responseText;

					d.resolve(response);
				}
			};

			entity = request.entity;
			xhr.send(entity);
		}
		catch (e) {
			d.reject(e);
		}

		return d.promise;
	}

	return xhr;

});

})(this.XMLHttpRequest, typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_client_xhr = factory(this.when, this.rest_UrlBuilder, this.rest_util_normalizeHeaderName));
	}
	// Boilerplate for AMD, Node, and browser global
);
