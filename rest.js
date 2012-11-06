(function (define, process) {

	define(function (require) {
		"use strict";

		var moduleId;

		/**
		 * Plain JS Object containing properties that represent an HTTP request
		 *
		 * @field {String} [method='GET'] HTTP method, commonly GET, POST, PUT, DELETE or HEAD
		 * @field {String|UrlBuilder} [path=''] path template with optional path variables
		 * @field {Object} [params] parameters for the path template and query string
		 * @field {Object} [headers] custom HTTP headers to send, in addition to the clients default headers
		 * @field {*} [entity] the HTTP entity, common for POST or PUT requests
		 *
		 * @class Request
		 */

		/**
		 * Plain JS Object containing properties that represent an HTTP response
		 *
		 * @field {Object} [request] the request object as received by the root client
		 * @field {Object} [raw] the underlying request object, like XmlHttpRequest in a browser
		 * @field {Number} [status.code] status code of the response (i.e. 200, 404)
		 * @field {String} [status.text] status phrase of the response
		 * @field {Object] [headers] response headers hash of normalized name, value pairs
		 * @field {*} [entity] the response body
		 *
		 * @class Response
		 */

		/**
		 * HTTP client particularly suited for RESTful operations.
		 *
		 * @param {Request} the HTTP request
		 * @returns {Promise<Response>} a promise the resolves to the HTTP response
		 *
		 * @class Client
		 */

		if (process && process.versions && process.versions.node) {
			// avaid build tools
			moduleId = './client/node';
			return require(moduleId);
		}

		return require('./client/xhr');
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process === 'undefined' ? undefined : process
	// Boilerplate for AMD and Node
));
