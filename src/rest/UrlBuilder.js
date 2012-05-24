(function(doc, define) {

define(['./util/beget'], function(beget) {
	"use strict";

	var absoluteUrlRE, urlEncodedBraceOpenRE, urlEncodedBraceCloseRE;

	absoluteUrlRE = /^https?:\/\//i;
	urlEncodedBraceOpenRE = /%7b/i;
	urlEncodedBraceCloseRE = /%7d/i;

	/**
	 * Apply params to the template to create a URL.
	 *
	 * Parameters that are not applied directly to the template, are appended
	 * to the URL as query string parameters.
	 *
	 * @param {String} template the URI template
	 * @param {Object} params parameters to apply to the template
	 * @return {String} the resulting URL
	 */
	function buildUrl(template, params) {
		// internal builder to convert template with params.
		var url = template,
			name = null,
			queryStringParams = {},
			re = null;
		if (params) {
			for (name in params) {
				re = new RegExp("\\{" + name + "\\}");
				if (re.test(url)) {
					url = url.replace(re, encodeURIComponent(params[name]), "g");
				}
				else {
					queryStringParams[name] = params[name];
				}
			}
			for (name in queryStringParams) {
				url += url.indexOf("?") === -1 ? "?" : "&";
				url += encodeURIComponent(name);
				if (queryStringParams[name] != null) {
					url += "=";
					url += encodeURIComponent(queryStringParams[name]);
				}
			}
		}
		return url;
	}

	/**
	 * Create a new URL Builder
	 *
	 * @param {String|UrlBuilder} template the base template to build from, may be another UrlBuilder
	 * @param {Object} [params] base parameters
	 * @constructor
	 */
	function UrlBuilder(template, params) {
		if (template instanceof UrlBuilder) {
			this._template = template.template;
			this._params = beget(this._params, params);
		}
		else {
			this._template = (template || '').toString();
			this._params = params;
		}
	}

	UrlBuilder.prototype = {

		/**
		 * Create a new UrlBuilder instance that extends the current builder.
		 * The current builder is unmodified.
		 *
		 * @param {String} [template] URL template to append to the current template
		 * @param {Object} [params] params to combine with current params.  New params override existing params
		 * @return {UrlBuilder} the new builder
		 */
		append: function(template,  params) {
			// TODO consider query strings and fragments
			return new UrlBuilder(this._template + template, beget(this._params, params));
		},

		/**
		 * Create a new UrlBuilder with a fully qualified URL based on the
		 * window's location or base href and the current templates relative URL.
		 *
		 * Path variables are preserved.
		 *
		 * *Browser only*
		 *
		 * @return {UrlBuilder} the fully qualified URL template
		 */
		absolute: function() {
			if (!doc || absoluteUrlRE.test(this._template)) { return this; }

			var a, template;

			a = doc.createElement('a');
			a.href = this._template;
			template = a.href.replace(urlEncodedBraceOpenRE, '{').replace(urlEncodedBraceCloseRE, '}');

			return new UrlBuilder(template, this._params);
		},

		/**
		 * Expand the template replacing path variables with parameters
		 *
		 * @param {Object} [params] params to combine with current params.  New params override existing params
		 * @return {String} the expanded URL
		 */
		build: function(/*Object*/params){
			return buildUrl(this._template, beget(this._params, params));
		},

		toString: function(){
			//	summary:
			//		Return a String representation of the URL by invoking the build method
			//		with no params.

			return this.build();
		}
	};

	return UrlBuilder;
});

})(this.document, typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_UrlBuilder = factory(this.rest_util_beget));
	}
	// Boilerplate for AMD, Node, and browser global
);
