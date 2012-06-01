(function (define) {

	define(['../application/html'], function (html) {
		"use strict";

		return html;
	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
