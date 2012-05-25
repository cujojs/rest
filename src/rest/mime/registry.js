(function (define, global, process) {

	// include ./type/text/plain and ./type/application/json as hints to a build tool
	define(['when', 'require', './type/text/plain', './type/application/json'], function (when, require) {

		var load, registry;

		registry = {};

		/**
		 * Lookup the converter for a MIME type
		 *
		 * @param {String} mime the MIME type
		 * @return {*} the converter for the MIME type
		 */
		function lookup(mime) {
			// ignore charset if included
			mime = mime.split(';')[0].trim();
			if (!registry[mime]) {
				return register(mime, load(mime));
			}
			return registry[mime];
		}

		/**
		 * Register a custom converter for a MIME type
		 *
		 * @param {String} mime the MIME type
		 * @param {*} converter the converter for the MIME type
		 * @return {*} the converter
		 */
		function register(mime, converter) {
			return registry[mime] = converter;
		}

		function load_amd(mime) {
			var d, timeout;

			d = when.defer();
			timeout = setTimeout(function () {
				// HOPE reject on a local require would be nice
				clearTimeout(timeout);
				timeout = null;
				d.reject();
			}, 1000);

			require(['./type/' + mime], function (m) {
				clearTimeout(timeout);
				timeout = null;
				d.resolve(m);
			});

			return d.promise;
		}

		function load_browser_globals(mime) {
			// TODO remove when buster supports proper amd loading
			var d, name;

			d = when.defer();
			name = 'rest_mime_type_' + mime.replace('/', '_');

			if (name in global) {
				d.resolve(global[name]);
			}
			else {
				d.reject();
			}

			return d.promise;
		}

		function load_node(mime) {
			var d = when.defer();

			try {
				d.resolve(require('./type/' + mime));
			}
			catch (e) {
				d.reject(e);
			}

			return d.promise;
		}

		/**
		 * Attempts to resolve a new converter
		 *
		 * @param {String} mime the MIME type
		 * @return {*} the converter for the MIME type
		 */
		load = (
			typeof require === 'function' && require.amd ?
				load_amd :
				process && process.versions && process.versions.node ?
					load_node :
					load_browser_globals
		);

		return {
			lookup: lookup,
			register: register
		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		return typeof module !== 'undefined' ?
			(module.exports = factory.apply(this, deps.map(function (dep) { return dep === 'require' ? require : require(dep); }))) :
			(this.rest_mime_registry = factory(this.when, this.require));
	},
	typeof global === 'undefined' ? this : global,
	typeof process === 'undefined' ? undefined : process
	// Boilerplate for AMD, Node, and browser global
));
