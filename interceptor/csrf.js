/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor;

interceptor = require('../interceptor');

/**
 * Applies a Cross-Site Request Forgery protection header to a request
 *
 * CSRF protection helps a server verify that a request came from a
 * trusted  client and not another client that was able to masquerade
 * as an authorized client. Sites that use cookie based authentication
 * are particularly vulnerable to request forgeries without extra
 * protection.
 *
 * @see http://en.wikipedia.org/wiki/Cross-site_request_forgery
 *
 * @param {Client} [client] client to wrap
 * @param {string} [config.name='X-Csrf-Token'] name of the request
 *   header, may be overridden by `request.csrfTokenName`
 * @param {string} [config.token] CSRF token, may be overridden by
 *   `request.csrfToken`
 *
 * @returns {Client}
 */
module.exports = interceptor({
	init: function (config) {
		config.name = config.name || 'X-Csrf-Token';
		return config;
	},
	request: function handleRequest(request, config) {
		var headers, name, token;

		headers = request.headers || (request.headers = {});
		name = request.csrfTokenName || config.name;
		token = request.csrfToken || config.token;

		if (token) {
			headers[name] = token;
		}

		return request;
	}
});
