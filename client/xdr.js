/*
 * Copyright (c) 2013 VMware, Inc. All Rights Reserved.
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

(function (define, XDomainRequest) {
	'use strict';

	define(function (require) {

		var when, UrlBuilder;

		when = require('when');
		UrlBuilder = require('../UrlBuilder');

		function xdr(request) {
			var d, client, method, url, entity, response;

			response = {};
			response.request = request;

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
