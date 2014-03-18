/*
 * Copyright 2012-2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, process) {
	'use strict';

	var undef;

	define(function (require) {

		/**
		 * Plain JS Object containing properties that represent an HTTP request.
		 *
		 * Depending on the capabilities of the underlying client, a request
		 * may be cancelable. If a request may be canceled, the client will add
		 * a canceled flag and cancel function to the request object. Canceling
		 * the request will put the response into an error state.
		 *
		 * @field {string} [method='GET'] HTTP method, commonly GET, POST, PUT, DELETE or HEAD
		 * @field {string|UrlBuilder} [path=''] path template with optional path variables
		 * @field {Object} [params] parameters for the path template and query string
		 * @field {Object} [headers] custom HTTP headers to send, in addition to the clients default headers
		 * @field [entity] the HTTP entity, common for POST or PUT requests
		 * @field {boolean} [canceled] true if the request has been canceled, set by the client
		 * @field {Function} [cancel] cancels the request if invoked, provided by the client
		 * @field {Client} [originator] the client that first handled this request, provided by the interceptor
		 *
		 * @class Request
		 */

		/**
		 * Plain JS Object containing properties that represent an HTTP response
		 *
		 * @field {Object} [request] the request object as received by the root client
		 * @field {Object} [raw] the underlying request object, like XmlHttpRequest in a browser
		 * @field {number} [status.code] status code of the response (i.e. 200, 404)
		 * @field {string} [status.text] status phrase of the response
		 * @field {Object] [headers] response headers hash of normalized name, value pairs
		 * @field [entity] the response body
		 *
		 * @class Response
		 */

		/**
		 * HTTP client particularly suited for RESTful operations.
		 *
		 * @field {function} chain wraps this client with a new interceptor returning the wrapped client
		 *
		 * @param {Request} the HTTP request
		 * @returns {ResponsePromise<Response>} a promise the resolves to the HTTP response
		 *
		 * @class Client
		 */

		 /**
		  * Extended when.js Promises/A+ promise with HTTP specific helpers
		  *
		  * @method entity promise for the HTTP entity
		  * @method status promise for the HTTP status code
		  * @method headers promise for the HTTP response headers
		  * @method header promise for a specific HTTP response header
		  *
		  * @class ResponsePromise
		  * @extends Promise
		  */

		var client, platformDefault;

		client = platformDefault = (function () {
			if (process && process.versions && process.versions.node) {
				// evade build tools
				var moduleId = './client/node';
				return require(moduleId);
			}

			return require('./client/xhr');
		}());

		/**
		 * Make a request with the default client
		 * @param {Request} the HTTP request
		 * @returns {Promise<Response>} a promise the resolves to the HTTP response
		 */
		function defaultClient() {
			return client.apply(undef, arguments);
		}

		/**
		 * Applies the interceptor behavior to the default client, resulting in
		 * a new client
		 * @param {Inteceptor} interceptor the interceptor behavior to apply to
		 *   the default client
		 * @param {*} [config] optional configuration for the interceptor
		 * @returns {Client} the newly wrapped client
		 */
		defaultClient.chain = function chain(interceptor, config) {
			return interceptor(defaultClient, config);
		};

		/**
		 * Change the default client
		 * @param {Client} client the new default client
		 */
		defaultClient.setDefaultClient = function setDefaultClient(c) {
			client = c;
		};

		/**
		 * Obtain a direct reference to the current default client
		 * @returns {Client} the default client
		 */
		defaultClient.getDefaultClient = function getDefaultClient() {
			return client;
		};

		/**
		 * Reset the default client to the platform default
		 */
		defaultClient.resetDefaultClient = function resetDefaultClient() {
			client = platformDefault;
		};

		return defaultClient;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process === 'undefined' ? undefined : process
	// Boilerplate for AMD and Node
));
