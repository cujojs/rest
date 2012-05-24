(function(define) {

define(['./mixin'], function(mixin) {
	"use strict";

	// derived from dojo.delegate

	function _beget(){}

	/**
	 * Creates a new object with the provided object as it's prototype.
	 * Additional properties may be mixed into the new object.
	 *
	 * @param {Object} obj the new object's prototype
	 * @param {Object} [props] additional properties to mixin to the new object
	 * @return {Object} the new object
	 */
	function beget(obj, props) {
		_beget.prototype = obj;
		var tmp = new _beget();
		_beget.prototype = null;
		if(props){
			mixin(tmp, props);
		}
		return tmp; // Object
	}

	return beget;

});

})(typeof define == 'function'
	? define
	: function(deps, factory) { typeof module != 'undefined'
		? (module.exports = factory.apply(this, deps.map(require)))
		: (this.rest_util_beget = factory(this.rest_util_mixin));
	}
	// Boilerplate for AMD, Node, and browser global
);
