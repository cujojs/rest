(function (define) {

	define(function (require) {
		"use strict";

		var interceptor;

		interceptor = require('../interceptor');

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
		return interceptor({
			success: function (response, config, client) {
				if (response.headers && response.headers.Location) {
					return (config.client || client.skip())({
						method: 'GET',
						path: response.headers.Location
					});
				}
				return response;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
