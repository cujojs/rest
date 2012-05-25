(function (define) {

	define(['./_base'], function (base) {
		"use strict";

		function startsWith(str, prefix) {
			return str.indexOf(prefix) === 0;
		}

		function endsWith(str, suffix) {
			return str.lastIndexOf(suffix) + suffix.length === str.length;
		}

		/**
		 * Prefixes the request path with a common value.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Number} [config.prefix] path prefix
		 *
		 * @returns {Client}
		 */
		return base({
			request: function (request, config) {
				var path;

				if (config.prefix) {
					path = config.prefix;
					if (request.path) {
						if (!endsWith(path, '/') && !startsWith(request.path, '/')) {
							// add missing '/' between path sections
							path += '/';
						}
						path += request.path;
					}
					request.path = path;
				}

				return request;
			}
		});

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		return typeof module !== 'undefined' ?
			(module.exports = factory.apply(this, deps.map(require))) :
			(this.rest_interceptor_pathPrefix = factory(this.rest_interceptor_base));
	}
	// Boilerplate for AMD, Node, and browser global
));
