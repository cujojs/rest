(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, jsonpClient;

		interceptor = require('../interceptor');
		jsonpClient = require('../client/jsonp');

		/**
		 * Allows common configuration of JSONP clients.
		 *
		 * Values provided to this interceptor are added to the request, if the
		 * request dose not already contain the property.
		 *
		 * The rest/client/jsonp client is used by default instead of the
		 * common default client for the platform.
		 *
		 * @param {Client} [client=rest/client/jsonp] custom client to wrap
		 * @param {String} [config.callback.param] the parameter name for which the callback function name is the value
		 * @param {String} [config.callback.prefix] prefix for the callback function, as the callback is attached to the window object, a unique, unobtrusive prefix is desired
		 *
		 * @returns {Client}
		 */
		return interceptor({
			client: jsonpClient,
			request: function (request, config) {
				config.callback = config.callback || {};
				request.callback = request.callback || {};
				request.callback.param = request.callback.param || config.callback.param;
				request.callback.prefix = request.callback.prefix || config.callback.prefix;
				return request;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
