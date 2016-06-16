/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/*global ActiveXObject */

var interceptor, XHR;

interceptor = require('../../interceptor');

XHR = (function () {
	// derived from https://github.com/cujojs/poly/blob/0.5.1/xhr.js
	if (XMLHttpRequest) {
		return XMLHttpRequest;
	}

	var progIds, xhr;

	progIds = [
		'Msxml2.XMLHTTP',
		'Microsoft.XMLHTTP',
		'Msxml2.XMLHTTP.4.0'
	];

	function tryCtor(progId) {
		try {
			/*jshint nonew:false */
			new ActiveXObject(progId);
			xhr = function () { return new ActiveXObject(progId); };
		}
		catch (ex) {}
	}

	while (!xhr && progIds.length) {
		tryCtor(progIds.shift());
	}

	return xhr;
}());

/**
 * Defaults request.engine to XMLHttpRequest, or an appropriate ActiveX fall
 * back
 *
 * @param {Client} [client] client to wrap
 *
 * @returns {Client}
 */
module.exports = interceptor({
	request: function handleRequest(request) {
		request.engine = request.engine || XHR;
		return request;
	}
});
