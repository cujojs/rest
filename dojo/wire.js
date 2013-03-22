/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var RestStore, clientPlugin, mixin, when;

		RestStore = require('./RestStore');
		clientPlugin = require('../wire');
		mixin = require('../util/mixin');
		when = require('when');

		return {
			wire$plugin: function restPlugin(/* ready, destroyed, options */) {

				var plugin;

				plugin = clientPlugin.wire$plugin.apply(clientPlugin, arguments);
				Object.keys(plugin).forEach(function (key) {
					if (typeof plugin[key] === 'object') {
						plugin[key] = mixin({}, plugin[key]);
					}
				});

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

					when(client.promise, function (client) {
						var args, store;

						args = { client: client };
						if (refObj.idProperty) { args.idProperty = refObj.idProperty; }

						store = new RestStore(args);
						if (refObj.get) {
							store.get(refObj.get).then(resolver.resolve, resolver.reject);

						}
						else if (refObj.query) {
							store.query(refObj.query).then(resolver.resolve, resolver.reject);

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
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
