(function (define) {

	define(function (require) {
		"use strict";

		var interceptor;

		interceptor = require('../interceptor');

		/**
		 * Returns the response entity as the response, discarding other response
		 * properties.
		 *
		 * @param {Client} [client] client to wrap
		 *
		 * @returns {Client}
		 */
		return interceptor({
			response: function (response) {
				if ('entity' in response) {
					return response.entity;
				}
				return response;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
