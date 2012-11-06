(function (define) {

	define(function (require) {
		"use strict";

		//TODO: handle as HTML instead of text/plain
		return require('../text/plain');
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
