(function (define) {

	define(['../rest', './interceptor/errorCode', './interceptor/mime', './interceptor/entity', './interceptor/pathPrefix', 'when'], function (client, errorCode, mime, entity, pathPrefix, when) {

		var plugin;

		function parseConfig(name, refObj) {
			return {
				prefix: name,
				mime: refObj.mime,
				accept: refObj.accept,
				errorCode: refObj.errorCode,
				entity: refObj.entity
			};
		}

		/**
		 * Builds the rest client for the provided config
		 *
		 * @param client the client to wrap
		 * @param config configuration for client interceptors
		 */
		function buildClient(client, config) {
			return when(client, function (client) {
				if (config.errorCode !== false) {
					client = errorCode(client, { code: config.errorCode });
				}
				if (config.mime !== false) {
					client = mime(client, { mime: config.mime || 'application/x-www-form-urlencoded', accept: config.accept });
				}
				if (config.entity !== false) {
					client = entity(client);
				}
				client = pathPrefix(client, { prefix: config.prefix });
				return client;
			});
		}

		/**
		 * Resolves a 'rest' client for the specified path and scopes, e.g. client!url/to/resource
		 *
		 * @param resolver
		 * @param name
		 * @param refObj
		 * @param wire
		 */
		function resolveClient(resolver, name, refObj, wire) {
			var config, client;

			config = parseConfig(name, refObj);
			client = buildClient(refObj.client, config);

			when(client, resolver.resolve, resolver.reject);
		}

		/**
		 * The plugin instance.  Can be the same for all wiring runs
		 */
		plugin = {
			resolvers: {
				client: resolveClient
			}
		};

		return {
			wire$plugin: function restPlugin(/* ready, destroyed, options */) {
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
