(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, base64;

		interceptor = require('../interceptor');
		base64 = require('../util/base64');

		/**
		 * Authenticates the request using HTTP Basic Authentication (rfc2617)
		 *
		 * @param {Client} [client] client to wrap
		 * @param {String} config.username username
		 * @param {String} [config.password=''] password for the user
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function handleRequest(request, config) {
				var headers, username, password;

				headers = request.headers || (request.headers = {});
				username = request.username || config.username;
				password = request.password || config.password || '';

				if (username) {
					headers.Authorization = base64.encode(username + ":" + password);
				}

				return request;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
