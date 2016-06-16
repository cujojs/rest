/*
 * Copyright 2015-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

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

module.exports = delay;
