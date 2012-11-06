(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, when;

		interceptor = require('../interceptor');
		when = require('when');

		/**
		 * Rejects the response promise based on the status code.
		 *
		 * Codes greater than or equal to the provided value are rejected.  Default
		 * value 400.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Number} [config.code=400] code to indicate a rejection
		 *
		 * @returns {Client}
		 */
		return interceptor({
			response: function (response, config) {
				var code = config.code || 400;
				if (response.status && response.status.code >= code) {
					return when.reject(response);
				}
				return response;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
