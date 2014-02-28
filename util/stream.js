/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, process) {
	'use strict';

	// default to Node's built in Streams when available
	if (process && process.versions && process.versions.node) {
		define(function () {
			return require('stream');
		});
	}
	else {
		// fallback to a browserify wrapped Node Stream
		define(function (require) {
			return require('./_stream').stream;
		});
	}

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process !== 'undefined' && process
	// Boilerplate for AMD and Node
));
