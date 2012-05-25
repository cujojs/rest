(function (define) {

	define([], function () {
		"use strict";

		/**
		 * Normalize HTTP header names using the pseudo camel case.
		 *
		 * For example:
		 *   content-type         -> Content-Type
		 *   accepts              -> Accepts
		 *   x-custom-header-name -> X-Custom-Header-Name
		 *
		 * @param {String} name the raw header name
		 * @return {String} the normalized header name
		 */
		function normalizeHeaderName(name) {
			return name.toLowerCase()
				.split('-')
				.map(function (chunk) { return chunk.charAt(0).toUpperCase() + chunk.slice(1); })
				.join('-');
		}

		return normalizeHeaderName;

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		return typeof module !== 'undefined' ?
			(module.exports = factory.apply(this, deps.map(require))) :
			(this.rest_util_normalizeHeaderName = factory());
	}
	// Boilerplate for AMD, Node, and browser global
));
