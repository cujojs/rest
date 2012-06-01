(function (define) {

	define(['./_base'], function (base) {
		"use strict";

		/**
		 * Returns the response entity as the response, discarding other response
		 * properties.
		 *
		 * @param {Client} [client] client to wrap
		 *
		 * @returns {Client}
		 */
		return base({
			response: function (response) {
				if ('entity' in response) {
					return response.entity;
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
