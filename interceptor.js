/*
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (define) {
	'use strict';

	define(function (require) {

		var defaultClient, mixin, when;

		defaultClient = require('./rest');
		mixin = require('./util/mixin');
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
		 * @param {Client} [target] client to wrap
		 * @param {Object} [config] configuration for the interceptor, properties will be specific to the interceptor implementation
		 * @returns {Client} A client wrapped with the interceptor
		 *
		 * @class Interceptor
		 */

		function defaultRequestHandler(request /*, config */) {
			return request;
		}

		function defaultResponseHandler(response /*, config, interceptor */) {
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
		 * Alternate return type for the request handler that allows for more complex interactions.
		 *
		 * @param properties.request the traditional request return object
		 * @param {Promise} [properties.abort] promise that resolves if/when the request is aborted
		 * @param {Client} [properties.client] override the defined client chain with an alternate client
		 */
		function ComplexRequest(properties) {
			if (!(this instanceof ComplexRequest)) {
				// in case users forget the 'new' don't mix into the interceptor
				return new ComplexRequest(properties);
			}
			mixin(this, properties);
		}

		/**
		 * Create a new interceptor for the provided handlers.
		 *
		 * @param {Function} [handlers.request] request handler
		 * @param {Function} [handlers.response] response handler regardless of error state
		 * @param {Function} [handlers.success] response handler when the request is not in error
		 * @param {Function} [handlers.error] response handler when the request is in error, may be used to 'unreject' an error state
		 * @param {Function} [handlers.client] the client to use if otherwise not specified, defaults to platform default client
		 *
		 * @returns {Interceptor}
		 */
		function interceptor(handlers) {

			var requestHandler, successResponseHandler, errorResponseHandler;

			handlers = handlers || {};

			requestHandler         = handlers.request || defaultRequestHandler;
			successResponseHandler = handlers.success || handlers.response || defaultResponseHandler;
			errorResponseHandler   = handlers.error   || function () {
				// Propagate the rejection, with the result of the handler
				return when.reject((handlers.response || defaultResponseHandler).apply(this, arguments));
			};

			return function (target, config) {
				var client;

				if (typeof target === 'object') {
					config = target;
				}
				if (typeof target !== 'function') {
					target = handlers.client || defaultClient;
				}
				config = config || {};

				client = function (request) {
					var context = {};
					request = request || {};
					return when(requestHandler.call(context, request, config)).then(function (request) {
						var response, abort, next;
						next = target;
						if (request instanceof ComplexRequest) {
							// unpack request
							abort = request.abort;
							next = request.client || next;
							request = request.request;
						}
						response = when(request, function (request) {
							return when(
								next(request),
								function (response) {
									return successResponseHandler.call(context, response, config, client);
								},
								function (response) {
									return errorResponseHandler.call(context, response, config, client);
								}
							);
						});
						return abort ? whenFirst([response, abort]) : response;
					});
				};

				/**
				 * @returns {Client} the target client
				 */
				client.skip = function () {
					return target;
				};

				/**
				 * @param {Interceptor} interceptor the interceptor to wrap this client with
				 * @param [config] configuration for the interceptor
				 * @returns {Client} the newly wrapped client
				 */
				client.chain = function (interceptor, config) {
					return interceptor(client, config);
				};

				return client;
			};
		}

		interceptor.ComplexRequest = ComplexRequest;

		return interceptor;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
