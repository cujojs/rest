/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor;

		interceptor = require('../interceptor');

		/**
		 * Follows the Location header in a response, if present. The response
		 * returned is for the subsequent request.
		 *
		 * Most browsers will automatically follow HTTP 3xx redirects, however,
		 * they will not automatically follow 2xx locations.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Client} [config.client=request.originator] client to use for subsequent request
		 *
		 * @returns {Client}
		 */
		return interceptor({
			success: function (response, config, client) {
				if (response.headers && response.headers.Location) {
					return (config.client || (response.request && response.request.originator) || client.skip())({
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
