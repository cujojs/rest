(function (define) {

	define(['./_base', '../util/base64'], function (base, base64) {
		"use strict";

		/**
		 * Authenticates the request using HTTP Basic Authentication (rfc2617)
		 *
		 * @param {Client} [client] client to wrap
		 * @param {String} config.username username
		 * @param {String} [config.password=''] password for the user
		 *
		 * @returns {Client}
		 */
		return base({
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
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
