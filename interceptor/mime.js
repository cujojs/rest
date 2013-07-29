/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var interceptor, registry, plainText, when;

		interceptor = require('../interceptor');
		registry = require('../mime/registry');
		when = require('when');

		plainText = registry.lookup('text/plain');

		/**
		 * MIME type support for request and response entities.  Entities are
		 * (de)serialized using the converter for the MIME type.
		 *
		 * Request entities are converted using the desired converter and the
		 * 'Accept' request header prefers this MIME.
		 *
		 * Response entities are converted based on the Content-Type response header.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {string} [config.mime='text/plain'] MIME type to encode the request
		 *   entity
		 * @param {string} [config.accept] Accept header for the request
		 * @param {Client} [config.client=<request.originator>] client passed to the
		 *   serializer, defaults to the client originating the request
		 * @param {Registry} [config.registry] MIME registry, defaults to the root
		 *   registry
		 *
		 * @returns {Client}
		 */
		return interceptor({
			init: function (config) {
				config.registry = config.registry || registry;
				return config;
			},
			request: function (request, config) {
				var mime, headers, requestReady;

				headers = request.headers || (request.headers = {});
				mime = headers['Content-Type'] = headers['Content-Type'] || config.mime || 'text/plain';
				headers.Accept = headers.Accept || config.accept || mime + ', application/json;q=0.8, text/plain;q=0.5, */*;q=0.2';

				if (!('entity' in request)) {
					return request;
				}

				requestReady = when.defer();

				config.registry.lookup(mime).then(
					function (serializer) {
						var client = config.client || request.originator;
						request.entity = serializer.write(request.entity, { client: client, request: request });
						requestReady.resolve(request);
					},
					function () {
						requestReady.reject('unknown-mime');
					}
				);

				return requestReady.promise;
			},
			response: function (response, config) {
				if (!(response.headers && response.headers['Content-Type'] && response.entity)) {
					return response;
				}

				var mime, responseReady;

				mime = response.headers['Content-Type'];

				responseReady = when.defer();

				config.registry.lookup(mime).otherwise(function () { return plainText; }).then(function (serializer) {
					var client = config.client || response.request && response.request.originator;
					response.entity = serializer.read(response.entity, { client: client, response: response });
					responseReady.resolve(response);
				});

				return responseReady.promise;
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
