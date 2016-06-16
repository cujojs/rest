/*
 * Copyright 2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, UrlBuilder;

interceptor = require('../interceptor');
UrlBuilder = require('../UrlBuilder');

/**
 * Applies request params to the path by token replacement
 *
 * Params not applied as a token are appended to the query string. Params
 * are removed from the request object, as they have been consumed.
 *
 * @deprecated The template interceptor `rest/interceptor/template` is a
 * much richer way to apply paramters to a template. This interceptor is
 * available as a bridge to users who previousled depended on this
 * functionality being available directly on clients.
 *
 * @param {Client} [client] client to wrap
 * @param {Object} [config.params] default param values
 *
 * @returns {Client}
 */
module.exports = interceptor({
	init: function (config) {
		config.params = config.params || {};
		return config;
	},
	request: function (request, config) {
		var path, params;

		path = request.path || '';
		params = request.params || {};

		request.path = new UrlBuilder(path, config.params).append('', params).build();
		delete request.params;

		return request;
	}
});
