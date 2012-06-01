(function (define) {

	define(['./RestStore', '../wire', '../util/mixin', 'when'], function (RestStore, clientPlugin, mixin, when) {

		/**
		 * If wait === true, waits for dataPromise to complete and resolves
		 * the reference to the resulting concrete data.  If wait !== true,
		 * resolves the reference to dataPromise.
		 *
		 * @param dataPromise
		 * @param resolver
		 * @param wait
		 */
		function resolveData(dataPromise, resolver, wait) {
			if (wait === true) {
				dataPromise.then(
					function (data) {
						resolver.resolve(data);
					},
					function (err) {
						resolver.reject(err);
					}
				);
			}
			else {
				resolver.resolve(dataPromise);
			}
		}

		return {
			wire$plugin: function restPlugin(/* ready, destroyed, options */) {

				var plugin;

				plugin = {
					resolvers: mixin({}, clientPlugin.wire$plugin.apply(clientPlugin, arguments).resolvers)
				};

				/**
				 * Resolves a RestStore client for the specified path and scopes, e.g. resource!url/to/resource
				 *
				 * @param resolver
				 * @param name
				 * @param refObj
				 * @param wire
				 */
				function resolveResource(resolver, name, refObj, wire) {
					var client;

					client = when.defer();
					plugin.resolvers.client(client.resolver, name, refObj, wire);

					when(client, function (client) {
						var args, store;

						args = { client: client };
						if (refObj.idProperty) { args.idProperty = refObj.idProperty; }

						store = new RestStore(args);
						if (refObj.get) {
							// If get was specified, get it, and resolve with the resulting item.
							resolveData(store.get(refObj.get), resolver, refObj.wait);

						}
						else if (refObj.query) {
							// Similarly, query and resolve with the result set.
							resolveData(store.query(refObj.query), resolver, refObj.wait);

						}
						else {
							// Neither get nor query was specified, so resolve with
							// the store itself.
							resolver.resolve(store);
						}
					});
				}

				plugin.resolvers.resource = resolveResource;

				return plugin;
			}

		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
