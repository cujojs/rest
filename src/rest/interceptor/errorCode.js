(function (define) {

	define(['./_base', 'when'], function (base, when) {
		"use strict";

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
		return base({
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
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
