/*
 * Copyright 2012 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	// derived from dojo.delegate
	define(function (require) {

		var mixin;

		mixin = require('./mixin');

		function Beget() {}

		/**
		 * Creates a new object with the provided object as it's prototype.
		 * Additional properties may be mixed into the new object.
		 *
		 * @param {Object} obj the new object's prototype
		 * @param {Object} [props] additional properties to mixin to the new object
		 * @return {Object} the new object
		 */
		function beget(obj, props) {
			Beget.prototype = obj;
			var tmp = new Beget();
			Beget.prototype = null;
			if (props) {
				mixin(tmp, props);
			}
			return tmp; // Object
		}

		return beget;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
