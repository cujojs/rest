(function (define) {

	define(['../client/jsonp'], function (defaultClient) {
		"use strict";

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
		return function (client, config) {
			var interceptor;

			if (typeof client === 'object') {
				config = client;
			}
			if (typeof client !== 'function') {
				client = defaultClient;
			}
			config = config || {};
			config.callback = config.callback || {};

			interceptor = function (request) {
				request.callback = request.callback || {};
				request.callback.param = request.callback.param || config.callback.param;
				request.callback.prefix = request.callback.prefix || config.callback.prefix;
				return client(request);
			};
			interceptor.skip = function () {
				return client;
			};

			return interceptor;
		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
