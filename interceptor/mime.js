(function (define) {

	define(['./_base', '../mime/registry', 'when'], function (base, registry, when) {
		"use strict";

		/**
		 * MIME type support for request and response entities.  Entities are
		 * (de)serialized using the converter for the MIME type.
		 *
		 * Request entities are converted using the desired converter and the 'Accept' request header prefers this MIME.
		 *
		 * Response entities are converted based on the Content-Type response header.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {String} [config.mime='text/plain'] MIME type to encode the request entity
		 * @param {String} [config.accept] Accept header for the request
		 *
		 * @returns {Client}
		 */
		return base({
			request: function (request, config) {
				var mime, headers, serializer, requestReady;

				headers = request.headers || (request.headers = {});
				mime = headers['Content-Type'] || config.mime || 'text/plain';
				headers.Accept = headers.Accept || config.accept || mime + ", application/json;q=0.8, text/plain;q=0.5, */*;q=0.2";

				if (!('entity' in request)) {
					return request;
				}

				serializer = registry.lookup(mime);
				requestReady = when.defer();

				when(serializer, function (serializer) {
					request.entity = serializer.write(request.entity);
					headers['Content-Type'] = mime;

					requestReady.resolve(request);
				});

				return requestReady.promise;
			},
			response: function (response) {
				if (!(response.headers && response.headers['Content-Type'] && response.entity)) {
					return response;
				}

				var mime, serializer, responseReady;

				mime = response.headers['Content-Type'];

				responseReady = when.defer();
				serializer = registry.lookup(mime);

				when(serializer, function (serializer) {
					response.entity = serializer.read(response.entity);
					responseReady.resolve(response);
				});

				return responseReady.promise;
			}
		});

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
