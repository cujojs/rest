(function (define) {

	define(['../../rest', '../util/mixin', 'dojo/store/util/QueryResults'], function (defaultClient, mixin, queryResults) {

		/**
		 * A REST based object store.
		 *
		 * The base path for requests is commonly provided by the `rest/interceptor/prefix` interceptor.
		 *
		 * @param {RestStore} [options] configuration information that will be mixed into the store
		 */
		function RestStore(options) {
			mixin(this, options);
			this.client = this.client || defaultClient;
		}

		RestStore.prototype = {

			/**
			 * @field {Client} client rest client for this store
			 */
			client: null,

			/**
			 * @field {String} [idProperty='id'] property to use as the identity property. The values of this property should be unique.
			 */
			idProperty: 'id',

			/**
			 * @field {Boolean} [ignoreId=false] if true, add() will always do a POST even if the data item already has an id
			 */
			ignoreId: false,

			/**
			 * Retrieves an object by its identity. This will trigger a GET request to the server using the url `id`.
			 *
			 * @param {String|Number} id identity to use to lookup the object
			 * @param {Object} [options] reserved for future use
			 *
			 * @returns {Object} record in the store that matches the given id
			 */
			get: function (id, options) {
				return this.client({
					path: id
				});
			},

			/**
			 * Resolves a records identity using the configured idProperty
			 *
			 * @param object to get the identity for
			 *
			 * @returns {String|Number} the identity
			 */
			getIdentity: function (object) {
				return object[this.idProperty];
			},

			/**
			 * Stores a record.
			 *
			 * Will trigger a PUT request to the server if the object has an id, otherwise it will trigger a POST request.  Unless ignoreId is configured true, in which case POST will always be used.
			 *
			 * @param {Object} object record to store
			 * @param {String|Number} [options.id] explicit ID for the record
			 * @param {Boolean} [options.ignoreId] treat the record as if it does not have an ID property
			 * @param {Boolean} [options.overwrite] adds If-Match or If-None-Match header to the request
			 * @param {Boolean} [options.incremental=false] uses POST intead of PUT for a record with an ID
			 *
			 * @returns {Promise<Response>} promissed response
			 */
			put: function (object, options) {
				var id, hasId, headers, ignoreId;

				options = options || {};

				ignoreId = ('ignoreId' in options) ? options.ignoreId : this.ignoreId;
				id = ('id' in options) ? options.id : this.getIdentity(object);

				hasId = !ignoreId && typeof id !== 'undefined';
				headers = {};

				if ('overwrite' in options) {
					headers[options.overwrite ? 'If-Match' : 'If-None-Match'] = '*';
				}

				return this.client({
					method: hasId && !options.incremental ? 'put' : 'post',
					path: hasId ? id : '',
					entity: object,
					headers: headers
				});
			},

			/**
			 * Stores a new record.
			 *
			 * Will trigger a PUT request to the server if the object has an id, otherwise it will trigger a POST request.  Unless ignoreId is configured true, in which case POST will always be used.
			 *
			 * @param {Object} object record to add
			 * @param {String|Number} [options.id] explicit ID for the record
			 * @param {Boolean} [options.ignoreId] treat the record as if it does not have an ID property
			 * @param {Boolean} [options.incremental=false] uses POST intead of PUT for a record with an ID
			 *
			 * @returns {Promise<Response>} promissed response
			 */
			add: function (object, options) {
				options = options || {};
				options.overwrite = false;
				return this.put(object, options);
			},

			/**
			 * Deletes a record by its identity. This will trigger a DELETE request to the server.
			 *
			 * @param {String|Number} id identity of the record to delete
			 *
			 * @returns {Promise<Response>} promissed response
			 */
			remove: function (id) {
				return this.client({
					method: 'delete',
					path: id
				});
			},

			/**
			 * Queries the store for objects. This will trigger a GET request to the server, with the query added as a query string.
			 *
			 * @param {Object} query params used for the query string
			 * @param {Object} [options] reserved for future use
			 *
			 * @returns {QueryResult} query results
			 */
			query: function (query, options) {
				return queryResults(this.client({ params: query }));
			}
		};

		return RestStore;

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
