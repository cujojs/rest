(function(define) {

define(['../application/html'], function(html) {
	return html;
});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_mime_type_text_html = factory(this.rest_mime_type_application_html));
	}
	// Boilerplate for AMD, Node, and browser global
);
