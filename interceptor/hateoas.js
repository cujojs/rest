(function (define) {

	define(function (require) {
		"use strict";

		var interceptor, pathPrefix, defaultClient, hateoas, cycleFlag;

		interceptor = require('../interceptor');
		pathPrefix = require('./pathPrefix');
		defaultClient = require('../../rest');

		cycleFlag = '__rest_hateoas_seen__';

		/**
		 * [Experimental]
		 *
		 * Supports 'Hypertext As The Engine Of Application State' style
		 * services by indexing the 'links' property from the entity to make
		 * accessing links via the 'rel' attribute easier.
		 *
		 * Links are index in two ways:
		 * 1. as link's 'rel' which when accessed issues a request for the
		 *    linked resource. A promise for the related resourse is expected
		 *    to be returned.
		 * 2. as link's 'rel' with 'Link' appended, as a reference to the link
		 *    object
		 *
		 * Also defines a 'clientFor' factory function that creates a new
		 * client configured to communicate with a related resource.
		 *
		 * The client for the resoruce reference and the 'clientFor' function
		 * can be provided by the 'client' config property.
		 *
		 * Index links are exposed by default under the '_links' property, and
		 * may be configed by the 'target' config property.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {String} [config.target='_links'] property to create on the entity and parse links into. If present and falsey, the response entity is used directly.
		 * @param {Client} [config.client] the default parent client to use when creating clients for a linked resources
		 *
		 * @returns {Client}
		 */
		hateoas = interceptor({
			response: function (response, config) {
				var targetName, client;

				client = config.client || defaultClient;
				targetName = 'target' in config ? config.target || '' : '_links';

				function apply(target, links) {
					links.forEach(function (link) {
						Object.defineProperty(target, link.rel + 'Link', {
							enumerable: false,
							value: link
						});
						Object.defineProperty(target, link.rel, {
							enumerable: false,
							get: function () {
								return hateoas(client, config)({ path: link.href });
							}
						});
					});

					// if only Proxy was well supported...
					Object.defineProperty(target, 'clientFor', {
						enumerable: false,
						value: function clientFor(rel, parentClient) {
							return pathPrefix(
								parentClient || client,
								{ prefix: target[rel + 'Link'].href }
							);
						}
					});
				}

				function walk(obj) {
					if (typeof obj !== 'object' || obj === null || cycleFlag in obj) { return; }

					var target, links;

					Object.defineProperty(obj, cycleFlag, { enumerable: false, configurable: true, value: true });

					links = obj.links;
					if (Array.isArray(links)) {
						if (targetName === '') {
							target = obj;
						}
						else {
							target = {};
							Object.defineProperty(obj, targetName, {
								enumerable: false,
								value: target
							});
						}

						apply(target, links);
					}

					Object.keys(obj).forEach(function (prop) {
						walk(obj[prop]);
					});

					// some nodes will be visited twice, but cycles will not be infinite
					delete obj[cycleFlag];
				}

				walk(response);

				return response;
			}
		});

		return hateoas;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
