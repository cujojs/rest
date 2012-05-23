(function(XMLHttpRequest, define) {

define(["when", "../UrlBuilder", "../util/normalizeHeaderName"], function(when, UrlBuilder, normalizeHeaderName) {

	var headerSplitRE;

	// according to the spec, the line break is '\r\n', but doesn't hold true in practice
	headerSplitRE = /[\r|\n]+/;

	function parseResponse(request, xhr) {
		var response;

		response = {};
		response.request = request;
		response.raw = xhr;
		response.status = {};
		response.status.code = xhr.status;
		response.status.text = xhr.statusText;
		response.headers = parseHeaders(xhr.getAllResponseHeaders());
		response.entity = xhr.responseText;

		return response;
	}

	function parseHeaders(raw) {
		// Note: Set-Cookie will be removed by the browser
		if (!raw) { return; }
		var headers = {}
		raw.trim().split(headerSplitRE).forEach(function(header) {
			var boundry, name, value;
			boundry = header.indexOf(":");
			name = normalizeHeaderName(header.substring(0, boundry).trim());
			value = header.substring(boundry + 1).trim();
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
		xhr = new XMLHttpRequest();

		method = request.method || 'GET';
		url = new UrlBuilder(request.path || "", request.params).build();
		xhr.open(method, url, true);

		headers = request.headers;
		for (var header in headers) {
			xhr.setRequestHeader(header, headers[header]);
		}

		xhr.onreadystatechange = function (e) {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				d.resolve(parseResponse(request, xhr));
			}
		};

		entity = request.entity;
		response = {};
		xhr.send(entity);

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
