(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, when, delay;

		interceptor = require('../interceptor');
		when = require('when');
		delay = require('when/delay');

		/**
		 * Retries a rejected request using an exponential backoff.
		 *
		 * Defaults to an initial interval of 100ms, a multiplier of 2, and no max interval.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {Number} [config.intial=100] initial interval in ms
		 * @param {Number} [config.multiplier=2] interval multiplier
		 * @param {Number} [config.max] max interval in ms
		 *
		 * @returns {Client}
		 */
		return interceptor({
			request: function (request, config) {
				request.retry = request.retry || config.initial || 100;
				return request;
			},
			error: function (response, config, client) {
				var request, multiplier, max, sleep;

				request = response.request;
				multiplier = config.multiplier || 2;
				max = config.max || Infinity;
				sleep = Math.min(request.retry, request.retry *= multiplier, max);

				return delay(request, sleep).then(function (request) {
					if (request.canceled) {
						// cancel here in case client doesn't check canceled flag
						return when.reject({ request: request, error: 'precanceled' });
					}
					return client(request);
				});
			}
		});
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));