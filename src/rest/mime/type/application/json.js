(function(define) {

define([], function(){
	return {

		read: function(str) {
			return JSON.parse(str);
		},

		write: function(obj) {
			return JSON.stringify(obj);
		}

	};
});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_mime_type_application_json = factory());
	}
	// Boilerplate for AMD, Node, and browser global
);
