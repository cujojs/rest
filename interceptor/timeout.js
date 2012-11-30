(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, when, delay;

		interceptor = require('../interceptor');
		when = require('when');
		delay = require('when/delay');

		/**
		 * Cancels a request if it takes longer then the timeout value.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Number} [config.timeout=0] duration in milliseconds before canceling the request. Non-positive values disable the timeout
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function (request, config) {
				var timeout, abortTrigger;
				timeout = 'timeout' in request ? request.timeout : 'timeout' in config ? config.timeout : 0;
				if (timeout <= 0) {
					return request;
				}
				abortTrigger = when.defer();
				delay(timeout).then(function () {
					abortTrigger.resolver.reject({ request: request, error: 'timeout' });
					if (request.cancel) {
						request.cancel();
					}
				});
				return [request, abortTrigger.promise];
			}
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
