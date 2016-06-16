/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, base64;

interceptor = require('../interceptor');
base64 = require('../util/base64');

/**
 * Authenticates the request using HTTP Basic Authentication (rfc2617)
 *
 * @param {Client} [client] client to wrap
 * @param {string} config.username username
 * @param {string} [config.password=''] password for the user
 *
 * @returns {Client}
 */
module.exports = interceptor({
	request: function handleRequest(request, config) {
		var headers, username, password;

		headers = request.headers || (request.headers = {});
		username = request.username || config.username;
		password = request.password || config.password || '';

		if (username) {
			headers.Authorization = 'Basic ' + base64.encode(username + ':' + password);
		}

		return request;
	}
});
