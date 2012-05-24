(function(define) {

define([], function(){
	"use strict";

	return {

		read: function(str) {
			return str;
		},

		write: function(obj) {
			return obj.toString();
		}

	};
});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_mime_type_text_plain = factory());
	}
	// Boilerplate for AMD, Node, and browser global
);
