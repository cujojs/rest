/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, XDomainRequest) {
	'use strict';

	define(function (require) {

		var when, UrlBuilder;

		when = require('when');
		UrlBuilder = require('../UrlBuilder');

		function xdr(request) {
			var d, client, method, url, entity, response;

			request = typeof request === 'string' ? { path: request } : request || {};
			response = { request: request };

			if (request.canceled) {
				response.error = 'precanceled';
				return when.reject(response);
			}

			d = when.defer();

			client = response.raw = new XDomainRequest();

			entity = request.entity;
			request.method = request.method || (entity ? 'POST' : 'GET');
			method = request.method;
			url = new UrlBuilder(request.path || '', request.params).build();

			try {
				client.open(method, url);

				request.canceled = false;
				request.cancel = function cancel() {
					request.canceled = true;
					client.abort();
					d.reject(response);
				};

				client.onload = function () {
					if (request.canceled) { return; }
					// this is all we have access to on the XDR object :(
					response.headers = { 'Content-Type': client.contentType };
					response.entity = client.responseText;
					d.resolver.resolve(response);
				};

				client.onerror = function () {
					response.error = 'loaderror';
					d.reject(response);
				};

				// onprogress must be defined
				client.onprogress = function () {};

				client.send(entity);
			}
			catch (e) {
				response.error = 'loaderror';
				d.resolver.reject(response);
			}

			return d.promise;
		}

		xdr.chain = function (interceptor, config) {
			return interceptor(xdr, config);
		};

		return xdr;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this.XDomainRequest
	// Boilerplate for AMD and Node
));
