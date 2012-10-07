(function (define) {

	define(['./_base', 'when'], function (base, when) {
		"use strict";

		/**
		 * Follows the Location header in a response, if present. The response
		 * returned is for the subsequent request.
		 *
		 * Most browsers will automatically follow HTTP 3xx redirects, however,
		 * they will not automatically follow 2xx locations.
		 *
		 * Note: this interceptor will only follow the Location header for the
		 * originating request. If nested redirects should be followed, install
		 * this interceptor twice. There is no infinite redirect detection
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Client} [config.client] client to use for subsequent request
		 *
		 * @returns {Client}
		 */
		return base({
			success: function (response, config, client) {
				if (response.headers && response.headers.Location) {
					return (config.client || client)({
						method: 'GET',
						path: response.headers.Location
					});
				}
				return response;
			}
		});

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
