/*
 * Copyright 2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Dmitry Ananichev
 */

(function (define) {
	'use strict';

	// derived from dojo.mixin
	define(function (/* require */) {

		/**
		 * Small IE detection helper
		 */
		var ie = (function() {

			var undef,
				v = 3,
				div = document.createElement('div'),
				all = div.getElementsByTagName('i');

			do {
				v = v + 1;
				div.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->';
			} while (all[0]);

			return v > 4 ? v : undef;

		}());

		return ie;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
