(function (define, global, document) {

	define(function (require) {
		"use strict";

		var when, UrlBuilder;

		when = require('when');
		UrlBuilder = require('../UrlBuilder');

		// consider abstracting this into a util module
		function clearProperty(scope, propertyName) {
			try {
				delete scope[propertyName];
			}
			catch (e) {
				// IE doesn't like to delete properties on the window object
				if (propertyName in scope) {
					scope[propertyName] = undefined;
				}
			}
		}

		function cleanupScriptNode(response) {
			if (response.raw && response.raw.parentNode) {
				response.raw.parentNode.removeChild(response.raw);
			}
		}

		function registerCallback(prefix, resolver, response) {
			var name;

			do {
				name = prefix + Math.floor(new Date().getTime() * Math.random());
			}
			while (name in global);

			global[name] = function jsonpCallback(data) {
				response.entity = data;
				clearProperty(global, name);
				cleanupScriptNode(response);
				if (!response.request.canceled) {
					resolver.resolve(response);
				}
			};

			return name;
		}

		/**
		 * Executes the request as JSONP.
		 *
		 * @param {String} request.path the URL to load
		 * @param {Object} [request.params] parameters to bind to the path
		 * @param {String} [request.callback.param='callback'] the parameter name for which the callback function name is the value
		 * @param {String} [request.callback.prefix='jsonp'] prefix for the callback function, as the callback is attached to the window object, a unique, unobtrusive prefix is desired
		 *
		 * @returns {Promise<Response>}
		 */
		function jsonp(request) {
			var d, callbackParams, script, firstScript, response;

			response = {
				request: request
			};

			if (request.canceled) {
				response.error = 'precanceled';
				return when.reject(response);
			}

			d = when.defer();
			request.callback = request.callback || {};
			callbackParams = {};
			callbackParams[request.callback.param || 'callback'] = registerCallback(request.callback.prefix || 'jsonp', d.resolver, response);

			request.canceled = false;
			request.cancel = function cancel() {
				request.canceled = true;
				cleanupScriptNode(response);
				d.reject(response);
			};

			script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = new UrlBuilder(request.path, request.params).build(callbackParams);

			script.onerror = function (e) {
				response.error = e;
				d.reject(response);
			};

			response.raw = script;
			firstScript = document.getElementsByTagName('script')[0];
			firstScript.parentNode.insertBefore(script, firstScript);

			return d.promise;
		}

		return jsonp;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this,
	this.document
	// Boilerplate for AMD and Node
));
