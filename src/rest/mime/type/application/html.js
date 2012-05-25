(function (define) {

	define(['../text/plain'], function (plain) {
		"use strict";

		//TODO: handle as HTML instead of text/plain
		return plain;
	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		return typeof module !== 'undefined' ?
			(module.exports = factory.apply(this, deps.map(require))) :
			(this.rest_mime_type_application_html = factory(this.rest_mime_type_text_plain));
	}
	// Boilerplate for AMD, Node, and browser global
));
