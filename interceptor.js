(function (define) {

	define(function (require) {
		"use strict";

		var defaultClient, when;

		defaultClient = require('../rest');
		when = require('when');

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

		function defaultResponseHandler(response, config, interceptor) {
			return response;
		}

		function whenFirst(promisesOrValues) {
			// TODO this concept is likely to be added to when in the near future
			var d = when.defer();
			promisesOrValues.forEach(function (promiseOrValue) {
				when.chain(promiseOrValue, d.resolver);
			});
			return d.promise;
		}

		/**
		 * Create a new interceptor for the provided handlers.
		 *
		 * @param {Function} [handlers.request] request handler
		 * @param {Function} [handlers.response] response handler regardless of error state
		 * @param {Function} [handlers.success] response handler when the request is not in error
		 * @param {Function} [handlers.error] response handler when the request is in error
		 * @param {Function} [handlers.client] the client to use if otherwise not specified, defaults to platform default client
		 *
		 * @returns {Interceptor}
		 */
		return function (handlers) {

			var requestHandler, successResponseHandler, errorResponseHandler;

			handlers = handlers || {};

			requestHandler         = handlers.request || defaultRequestHandler;
			successResponseHandler = handlers.success || handlers.response || defaultResponseHandler;
			errorResponseHandler   = handlers.error   || handlers.response || defaultResponseHandler;

			return function (client, config) {
				var interceptor;

				if (typeof client === 'object') {
					config = client;
				}
				if (typeof client !== 'function') {
					client = handlers.client || defaultClient;
				}
				config = config || {};

				interceptor = function (request) {
					request = request || {};
					return when(requestHandler(request, config)).then(function (request) {
						var response, abort, d;
						if (request instanceof Array) {
							// unpack compound value
							abort = request[1];
							request = request[0];
						}
						response = when(request, function (request) {
							return when(
								client(request),
								function (response) {
									return successResponseHandler(response, config, interceptor);
								},
								function (response) {
									// Propagate the rejection, but with the result of the registered error response handler
									return when.reject(errorResponseHandler(response, config, interceptor));
								}
							);
						});
						return abort ? whenFirst([response, abort]) : response;
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
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
