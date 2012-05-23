(function(define) {

define(['./_base', 'when'], function(base, when) {

	/**
	 * Rejects the response promise based on the status code.
	 *
	 * Codes greater than or equal to the provided value are rejected.  Default
	 * value 400.
	 *
	 * @param {Client} [client] client to wrap
	 * @param {Number} [config.code=400] code to indicate a rejection
	 *
	 * @returns {Client}
	 */
	return base({
		response: function(response, config) {
			var code = config.code || 400;
			if (response.status && response.status.code >= code) {
				return when.reject(response);
			}
			return response;
		}
	});

});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_interceptor_errorCode = factory(this.rest_interceptor_base, this.when));
	}
	// Boilerplate for AMD, Node, and browser global
);
