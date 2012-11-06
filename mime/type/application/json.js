(function (define) {

	define(function (require) {
		"use strict";

		return {

			read: function (str) {
				return JSON.parse(str);
			},

			write: function (obj) {
				return JSON.stringify(obj);
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
