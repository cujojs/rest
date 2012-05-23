(function(define) {

define(['./_base'], function(base) {

	/**
	 * Returns the response entity as the response, discarding other response
	 * properties.
	 *
	 * @param {Client} [client] client to wrap
	 *
	 * @returns {Client}
	 */
	return base({
		response: function(response) {
			if ('entity' in response) {
				return response.entity;
			}
			return response;
		}
	});

});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_interceptor_entity = factory(this.rest_interceptor_base));
	}
	// Boilerplate for AMD, Node, and browser global
);
