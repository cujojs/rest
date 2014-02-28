/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, process) {
	'use strict';

	// default to Node's built in Buffer when available
	if (process && process.versions && process.versions.node) {
		define(function () {
			var buffer = require('buffer');

			// TODO remove once Node 0.6 is no longer supported
			Buffer.concat = Buffer.concat || function (list, length) {
				/*jshint plusplus:false, shadow:true */
				// from https://github.com/joyent/node/blob/v0.8.21/lib/buffer.js
				if (!Array.isArray(list)) {
					throw new Error('Usage: Buffer.concat(list, [length])');
				}

				if (list.length === 0) {
					return new Buffer(0);
				} else if (list.length === 1) {
					return list[0];
				}

				if (typeof length !== 'number') {
					length = 0;
					for (var i = 0; i < list.length; i++) {
						var buf = list[i];
						length += buf.length;
					}
				}

				var buffer = new Buffer(length);
				var pos = 0;
				for (var i = 0; i < list.length; i++) {
					var buf = list[i];
					buf.copy(buffer, pos);
					pos += buf.length;
				}
				return buffer;
			};

			return buffer;
		});
	}
	else {
		// fallback to a browserify wrapped Node Buffer
		define(function (require) {
			return require('./_stream').buffer;
		});
	}

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process !== 'undefined' && process
	// Boilerplate for AMD and Node
));
