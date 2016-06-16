/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

'use strict';

var interceptor;

interceptor = require('../interceptor');

/**
 * Cancels a request if it takes longer then the timeout value.
 *
 * @param {Client} [client] client to wrap
 * @param {number} [config.timeout=0] duration in milliseconds before canceling the request. Non-positive values disable the timeout
 * @param {boolean} [config.transient=false] if true, timed out requests will not be marked as canceled so that it may be retried
 *
 * @returns {Client}
 */
module.exports = interceptor({
	init: function (config) {
		config.timeout = config.timeout || 0;
		config.transient = !!config.transient;
		return config;
	},
	request: function (request, config) {
		var timeout, abort, triggerAbort, transient;
		timeout = 'timeout' in request ? request.timeout : config.timeout;
		transient = 'transient' in request ? request.transient : config.transient;
		if (timeout <= 0) {
			return request;
		}
		abort = new Promise(function (resolve, reject) {
			triggerAbort = reject;
		});
		this.timeout = setTimeout(function () {
			triggerAbort({ request: request, error: 'timeout' });
			if (request.cancel) {
				request.cancel();
				if (transient) {
					// unmark request as canceled for future requests
					request.canceled = false;
				}
			}
			else if (!transient) {
				request.canceled = true;
			}
		}, timeout);
		return new interceptor.ComplexRequest({ request: request, abort: abort });
	},
	response: function (response) {
		if (this.timeout) {
			clearTimeout(this.timeout);
			delete this.timeout;
		}
		return response;
	}
});
