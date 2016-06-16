/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, xdrClient, UrlBuilder, hasXdr, hasXhrCors;

interceptor = require('../../interceptor');
xdrClient = require('../../client/xdr');
UrlBuilder = require('../../UrlBuilder');

hasXdr = typeof XDomainRequest !== 'undefined';
hasXhrCors = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();

/**
 * Apply IE 8 and 9's cross domain support if needed and available.
 *
 * XDR enabled cross-origin requests, but with sever restrictions. Please
 * understand these restrictions before using this interceptor. For example:
 * only GET and POST are supported, there is no response status code, there
 * are no request or response headers except for the response Content-Type,
 * the remote server must use the same scheme as the origin http-to-http
 * https-to-https.
 *
 * http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
 *
 * If needed, this interceptor should be installed as close to the
 * interceptor chain root as possible. When the XDR client is needed, any
 * other interceptors in the primary chain are skipped. It is possible to
 * mimick the primary interceptor chain, by wrapping the XDR client in the
 * same interceptors and providing the resulting client as the 'xdrClient'
 * config property.
 *
 * @param {Client} [client] client to wrap
 * @param {Client} [config.xdrClient] the client to use when XDR is needed, defaults to 'rest/client/xdr'
 *
 * @returns {Client}
 */
module.exports = interceptor({
	request: function handleRequest(request, config) {
		if (hasXdr && !hasXhrCors && new UrlBuilder(request.path, request.params).isCrossOrigin()) {
			return new interceptor.ComplexRequest({ request: request, client: config.xdrClient || xdrClient });
		}
		return request;
	}
});
