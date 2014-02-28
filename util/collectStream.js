/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var when = require('when'),
			stream = require('./stream'),
			buffer = require('./buffer');

		function collectStream(str) {
			if (!(str instanceof stream.Readable)) {
				return when(str);
			}
			var d = when.defer(),
				chunks = [];
			str.on('data', function (chunk) {
				chunks.push(chunk);
			});
			str.on('end', function () {
				d.resolve(buffer.Buffer.concat(chunks).toString());
			});
			str.on('error', function (err) {
				d.reject(err);
			});
			return d.promise;
		}

		return collectStream;
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
