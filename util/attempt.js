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
		 * Attempt to invoke a function capturing the resulting value as a Promise
		 *
		 * If the method throws, the caught value used to reject the Promise.
		 *
		 * @param {function} work function to invoke
		 * @returns {Promise} Promise for the output of the work function
		 */
		function attempt(work) {
			try {
				return Promise.resolve(work());
			}
			catch (e) {
				return Promise.reject(e);
			}
		}

		return attempt;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
