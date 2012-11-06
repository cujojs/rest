(function (define) {

	define(function (require) {
		"use strict";

		return require('../application/html');
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
