/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var json, pathPrefix, find, lazyPromise, when;

		json = require('./json');
		pathPrefix = require('../../../interceptor/pathPrefix');
		find = require('../../../util/find');
		lazyPromise = require('../../../util/lazyPromise');
		when = require('when');

		function defineProperty(obj, name, value) {
			Object.defineProperty(obj, name, {
				value: value,
				configurable: true,
				enumerable: false,
				writeable: true
			});
		}

		/**
		 * JSON Hypertext Application Language serializer
		 *
		 * Implemented to http://tools.ietf.org/html/draft-kelly-json-hal-05
		 *
		 * As the spec is still a draft, this implementation will be updated as the
		 * spec evolves
		 *
		 * Objects are read as HAL indexing links and embedded objects on to the
		 * resource. Objects are written as plain JSON.
		 *
		 * Embedded relationships are indexed onto the resource by the relationship
		 * as a promise for the related resource.
		 *
		 * Links are indexed onto the resource as a lazy promise that will GET the
		 * resource when a handler is first registered on the promise.
		 *
		 * A `clientFor` method is added to the entity to get a full Client for a
		 * relationship.
		 *
		 * The `_links` and `_embedded` properties on the resource are made
		 * non-enumerable.
		 */
		return {

			read: function (str, opts) {
				var root, client, console;

				opts = opts || {};
				client = opts.client;
				console = opts.console || console;
				root = json.read.apply(json, arguments);

				function deprecationWarning(relationship, deprecation) {
					if (deprecation && console && console.warn || console.log) {
						(console.warn || console.log).call(console, 'Relationship \'' + relationship + '\' is deprecated, see ' + deprecation);
					}
				}

				find.findProperties(root, '_embedded', function (embedded, resource, name) {
					Object.keys(embedded).forEach(function (relationship) {
						if (relationship in resource) { return; }
						defineProperty(resource, relationship, when(embedded[relationship]));
					});
					defineProperty(resource, name, embedded);
				});
				find.findProperties(root, '_links', function (links, resource, name) {
					Object.keys(links).forEach(function (relationship) {
						var link = links[relationship];
						if (relationship in resource || link.templated === true) { return; }
						defineProperty(resource, relationship, lazyPromise(function () {
							if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
							return client({ path: link.href });
						}));
					});
					defineProperty(resource, name, links);
					defineProperty(resource, 'clientFor', function (relationship, clientOverride) {
						var link = links[relationship];
						if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
						return pathPrefix(
							clientOverride || client,
							{ prefix: link.href }
						);
					});
				});

				return root;
			},

			write: function () {
				return json.write.apply(json, arguments);
			}

		};
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
