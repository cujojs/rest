/*
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (define) {
	'use strict';

	define(function (require) {

		var when, registry;

		when = require('when');

		function normalizeMime(mime) {
			return mime.split(';')[0].trim();
		}

		function Registry(parent) {
			var mimes = {};

			if (typeof parent === 'function') {
				// coerce a lookup function into the registry API
				parent = (function (lookup) {
					return {
						lookup: function (mime) {
							// cache to avoid duplicate lookups
							mimes[mime] = lookup(mime);
							return mimes[mime];
						}
					};
				}(parent));
			}

			/**
			 * Lookup the converter for a MIME type
			 *
			 * @param {string} mime the MIME type
			 * @return a promise for the converter
			 */
			this.lookup = function lookup(mime) {
				mime = normalizeMime(mime);
				return mime in mimes ? mimes[mime] : parent.lookup(mime);
			};

			/**
			 * Register a custom converter for a MIME type
			 *
			 * @param {string} mime the MIME type
			 * @param converter the converter for the MIME type
			 * @return a promise for the converter
			 */
			this.register = function register(mime, converter) {
				mime = normalizeMime(mime);
				mimes[mime] = when.resolve(converter);
				return mimes[mime];
			};

		}

		Registry.prototype = {

			/**
			 * Create a child registry whoes registered converters remain local, while
			 * able to lookup converters from its parent.
			 *
			 * @returns child MIME registry
			 */
			child: function child() {
				return new Registry(this);
			}

		};

		function loadAMD(mime) {
			var d, timeout;

			d = when.defer();
			timeout = setTimeout(function () {
				// HOPE reject on a local require would be nice
				clearTimeout(timeout);
				timeout = null;
				d.reject();
			}, 1000);

			// 'define' is a bit of a hack, but other options are non-standard
			define('rest/mime/type/' + mime + '-' + Math.random(), ['./type/' + mime], function (m) {
				clearTimeout(timeout);
				timeout = null;
				d.resolve(m);
			});

			return d.promise;
		}

		function loadNode(mime) {
			var d = when.defer();

			try {
				d.resolve(require('./type/' + mime));
			}
			catch (e) {
				d.reject(e);
			}

			return d.promise;
		}

		registry = new Registry(typeof require === 'function' && require.amd ? loadAMD : loadNode);

		// include text/plain and application/json by default
		registry.register('text/plain', require('./type/text/plain'));
		registry.register('application/json', require('./type/application/json'));

		return registry;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
