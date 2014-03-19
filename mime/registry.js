/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var when, registry;

		when = require('when');

		function normalizeMime(mime) {
			// TODO we're dropping info that may be important
			return mime.split(/[;\+]/)[0].trim();
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
			var timeout;

			return when.promise(function (resolve, reject) {

				// HOPE reject on a local require would be nice
				timeout = setTimeout(reject, 1000);
				require(['./type/' + mime], resolve, reject);

			}).otherwise(function (ex) {
				return when.reject(ex || new Error('Timeout while loading mime module: ' + mime));
			}).ensure(function () {
				clearTimeout(timeout);
			});
		}

		function loadNode(mime) {
			return when.promise(function (resolve, reject) {
				try {
					resolve(require('./type/' + mime));
				}
				catch (e) {
					reject(e);
				}
			});
		}

		registry = new Registry(typeof define === 'function' && define.amd ? loadAMD : loadNode);

		// include text/plain and application/json by default
		registry.register('text/plain', require('./type/text/plain'));
		registry.register('application/json', require('./type/application/json'));

		return registry;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
