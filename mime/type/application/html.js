(function (define) {

	define(['../text/plain'], function (plain) {
		"use strict";

		//TODO: handle as HTML instead of text/plain
		return plain;
	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
