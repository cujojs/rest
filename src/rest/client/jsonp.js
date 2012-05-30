(function (global, document, define) {

	define(['when', '../UrlBuilder'], function (when, UrlBuilder) {
		"use strict";

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

		function registerCallback(prefix, resolver) {
			var name;

			do {
				name = prefix + Math.floor(new Date().getTime() * Math.random());
			}
			while (name in global);

			global[name] = function jsonpCallback(data) {
				resolver.resolve({ entity: data });
				clearProperty(global, name);
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
			var d, callbackParams, script, firstScript;

			d = when.defer();

			try {
				request.callback = request.callback || {};
				callbackParams = {};
				callbackParams[request.callback.param || 'callback'] = registerCallback(request.callback.prefix || 'jsonp', d.resolver);

				script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.src = new UrlBuilder(request.path, request.params).build(callbackParams);
				firstScript = document.getElementsByTagName('script')[0];
				firstScript.parentNode.insertBefore(script, firstScript);
			}
			catch (e) {
				d.reject(e);
			}

			return d.promise;
		}

		return jsonp;

	});

}(
	this,
	this.document,
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
