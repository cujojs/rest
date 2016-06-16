/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/*globals XDomainRequest */

var responsePromise, client;

responsePromise = require('../util/responsePromise');
client = require('../client');

module.exports = client(function xdr(request) {
	return responsePromise.promise(function (resolve, reject) {

		var client, method, url, entity, response;

		request = typeof request === 'string' ? { path: request } : request || {};
		response = { request: request };

		if (request.canceled) {
			response.error = 'precanceled';
			reject(response);
			return;
		}

		client = response.raw = new XDomainRequest();

		entity = request.entity;
		request.method = request.method || (entity ? 'POST' : 'GET');
		method = request.method;
		url = response.url = request.path || '';

		try {
			client.open(method, url);

			request.canceled = false;
			request.cancel = function cancel() {
				request.canceled = true;
				client.abort();
				reject(response);
			};

			client.onload = function () {
				if (request.canceled) { return; }
				// this is all we have access to on the XDR object :(
				response.headers = { 'Content-Type': client.contentType };
				response.entity = client.responseText;
				resolve(response);
			};

			client.onerror = function () {
				response.error = 'loaderror';
				reject(response);
			};

			// onprogress must be defined
			client.onprogress = function () {};

			client.send(entity);
		}
		catch (e) {
			response.error = 'loaderror';
			reject(response);
		}

	});
});
