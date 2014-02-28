/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var defaultClient, beget, mixin, stream, buffer, collectStream, when;

		defaultClient = require('./rest');
		beget = require('./util/beget');
		mixin = require('./util/mixin');
		stream = require('./util/stream');
		buffer = require('./util/buffer');
		collectStream = require('./util/collectStream');
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

		function defaultInitHandler(config) {
			return config;
		}

		function defaultRequestHandler(request /*, config, meta */) {
			return request;
		}

		function defaultResponseHandler(response /*, config, meta */) {
			return response;
		}

		function race(promisesOrValues) {
			var d = when.defer();
			promisesOrValues.forEach(function (promiseOrValue) {
				when(promiseOrValue, d.resolve, d.reject);
			});
			return d.promise;
		}

		function adaptBufferedHandler(handler) {
			return function (resresp) {
				var args, ctx, d;
				args = arguments;
				ctx = this;
				d = when.defer();
				if (resresp && resresp.entity instanceof stream.Readable) {
					collectStream(resresp.entity).then(function (entity) {
						resresp.entity = entity;
						d.resolve(resresp);
					}, function (err) {
						resresp.error = err;
						d.reject(resresp);
					});
				}
				else {
					d.resolve(resresp);
				}

				return d.promise.then(function () {
					return handler.apply(ctx, args);
				});
			};
		}

		function adaptStreamHandler(handler) {
			return function (resresp) {
				var args, ctx, str;
				args = arguments;
				ctx = this;
				if (resresp && 'entity' in resresp && (typeof resresp.entity === 'string' || resresp.entity instanceof buffer.Buffer)) {
					str = new stream.Transform();
					str.push(resresp.entity);
					str.push(null);
					resresp.entity = str;
				}
				return handler.apply(ctx, args);
			};
		}

		/**
		 * Alternate return type for the request handler that allows for more complex interactions.
		 *
		 * @param properties.request the traditional request return object
		 * @param {Promise} [properties.abort] promise that resolves if/when the request is aborted
		 * @param {Client} [properties.client] override the defined client chain with an alternate client
		 * @param [properties.response] response for the request, short circuit the request
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
		 * @param {Function} [handlers.init] one time intialization, must return the config object
		 * @param {Function} [handlers.request] request handler
		 * @param {Function} [handlers.response] response handler regardless of error state
		 * @param {Function} [handlers.success] response handler when the request is not in error
		 * @param {Function} [handlers.error] response handler when the request is in error, may be used to 'unreject' an error state
		 * @param {Function} [handlers.client] the client to use if otherwise not specified, defaults to platform default client
		 *
		 * @returns {Interceptor}
		 */
		function interceptor(handlers) {

			var initHandler, requestHandler, responseHandler, successResponseHandler, errorResponseHandler;

			handlers = handlers || {};

			initHandler            = handlers.init || defaultInitHandler;
			requestHandler         = (handlers.requestStream && adaptStreamHandler(handlers.requestStream)) ||
			                         (handlers.request && adaptBufferedHandler(handlers.request)) ||
			                         defaultRequestHandler;
			responseHandler        = (handlers.responseStream && adaptStreamHandler(handlers.responseStream)) ||
			                         (handlers.response && adaptBufferedHandler(handlers.response)) ||
			                         defaultResponseHandler;
			successResponseHandler = (handlers.successStream && adaptStreamHandler(handlers.successStream)) ||
			                         (handlers.success && adaptBufferedHandler(handlers.success)) ||
			                         responseHandler;
			errorResponseHandler   = (handlers.errorStream && adaptStreamHandler(handlers.errorStream)) ||
			                         (handlers.error && adaptBufferedHandler(handlers.error)) ||
			                         function defaultErrorHandler(/* response, config, meta */) {
				// Propagate the rejection, with the result of the handler
				return when((responseHandler).apply(this, arguments), when.reject, when.reject);
			};

			return function (target, config) {
				var client;

				if (typeof target === 'object') {
					config = target;
				}
				if (typeof target !== 'function') {
					target = handlers.client || defaultClient;
				}

				config = initHandler(beget(config));

				client = function (request) {
					var context, meta;
					context = {};
					meta = { 'arguments': Array.prototype.slice.call(arguments), client: client };
					request = typeof request === 'string' ? { path: request } : request || {};
					request.originator = request.originator || client;
					return when(
						requestHandler.call(context, request, config, meta),
						function (request) {
							var response, abort, next;
							next = target;
							if (request instanceof ComplexRequest) {
								// unpack request
								abort = request.abort;
								next = request.client || next;
								response = request.response;
								// normalize request, must be last
								request = request.request;
							}
							response = response || when(request, function (request) {
								return when(
									next(request),
									function (response) {
										return successResponseHandler.call(context, response, config, meta);
									},
									function (response) {
										return errorResponseHandler.call(context, response, config, meta);
									}
								);
							});
							return abort ? race([response, abort]) : response;
						},
						function (error) {
							return when.reject({ request: request, error: error });
						}
					);
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
