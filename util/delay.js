/*
 * Copyright 2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var Promise = require('./Promise');

		/**
		 * Delay the resolution of a promise
		 *
		 * Note: if the value is a promise, the delay starts once the promise
		 * resolves.
		 *
		 * @param {number} wait miliseconds to wait
		 * @param {Promise|*} [promiseOrValue] value to resolve with
		 * @returns {Promise} delayed Promise containing the value
		 */
		function delay(wait, promiseOrValue) {
			return Promise.resolve(promiseOrValue).then(function (value) {
				return new Promise(function (resolve) {
					setTimeout(function () {
						resolve(value);
					}, wait);
				});
			});
		}

		return delay;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
