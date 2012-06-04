(function (define) {

	define(['../rest', 'when'], function (defaultClient, when) {
		"use strict";

		/**
		 * Interceptors have the ability to intercept the request and/org response
		 * objects.  They may augment, prune, transform or replace the
		 * request/response as needed.  Clients may be composed by chaining
		 * together multiple interceptors.
		 *
		 * Configured interceptors are functional in nature.  Wrapping a client in
		 * an interceptor will not affect the client, merely the data that flows in
		 * and out of that client.  A common configuration can be created once and
		 * shared; specialization can be created by further wrapping that client
		 * with custom interceptors.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Object} [config] configuration for the interceptor, properties will be specific to the interceptor implementation
		 * @returns {Client} A client wrapped with the interceptor
		 *
		 * @class Interceptor
		 */

		function defaultRequestHandler(request, config) {
			return request;
		}

		function defaultResponseHandler(response, config) {
			return response;
		}

		return function (handlers) {

			var requestHandler, successResponseHandler, errorResponseHandler;

			requestHandler         = handlers.request || defaultRequestHandler;
			successResponseHandler = handlers.success || handlers.response || defaultResponseHandler;
			errorResponseHandler   = handlers.error   || handlers.response || defaultResponseHandler;

			return function (client, config) {
				var interceptor;

				if (typeof client === 'object') {
					config = client;
				}
				if (typeof client !== 'function') {
					client = defaultClient;
				}
				config = config || {};

				interceptor = function (request) {
					return when(requestHandler(request, config)).then(function (request) {
						return when(client(request)).then(
							function (response) {
								return successResponseHandler(response, config);
							},
							function (response) {
								// Propagate the rejection, but with the result of the
								// registered error response handler
								return when.reject(errorResponseHandler(response, config));
							}
						);
					});
				};
				interceptor.skip = function () {
					return client;
				};

				return interceptor;
			};
		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
