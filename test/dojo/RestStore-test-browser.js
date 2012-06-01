(function (buster, define) {

	var RestStore, when, client, assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	client = function (request) { return { request: request }; };

	buster.testCase('rest/dojo/RestStore', {
		setUp: function (done) {
			if (RestStore) { return done(); }
			define('rest/dojo/RestStore-test', ['rest/dojo/RestStore', 'when'], function (RS, w) {
				RestStore = RS;
				when = w;
				done();
			});
		},

		'should use "id" as the default idProperty': function () {
			var store = new RestStore();
			assert.equals('id', store.idProperty);
			assert.equals(42, store.getIdentity({ id: 42 }));
		},
		'should work with custom idProperty': function () {
			var store = new RestStore({ idProperty: 'key'});
			assert.equals('key', store.idProperty);
			assert.equals(42, store.getIdentity({ key: 42 }));
		},
		'should apply query params to the query string': function (done) {
			var store = new RestStore({ client: client });
			when(store.query({ q: 'what is the meaning of life?' }), function (response) {
				assert.equals('what is the meaning of life?', response.request.params.q);
				done();
			});
		},
		'should get based on the id': function (done) {
			var store = new RestStore({ client: client });
			when(store.get(42), function (response) {
				assert.equals('42', response.request.path);
				refute(response.request.method);
				done();
			});
		},
		'should remove based on the id': function (done) {
			var store = new RestStore({ client: client });
			when(store.remove(42), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('delete', response.request.method);
				done();
			});
		},
		'should add a record without an ID': function (done) {
			var store = new RestStore({ client: client });
			when(store.add({ foo: 'bar' }), function (response) {
				assert.equals('', response.request.path);
				assert.equals('post', response.request.method);
				assert.equals('*', response.request.headers['If-None-Match']);
				assert.equals('bar', response.request.entity.foo);
				done();
			});
		},
		'should add a record with an explicit ID': function (done) {
			var store = new RestStore({ client: client });
			when(store.add({ foo: 'bar' }, { id: 42 }), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('put', response.request.method);
				assert.equals('*', response.request.headers['If-None-Match']);
				assert.equals('bar', response.request.entity.foo);
				refute.equals('42', response.request.entity.id);
				done();
			});
		},
		'should add a record with an implicit ID': function (done) {
			var store = new RestStore({ client: client });
			when(store.add({ foo: 'bar', id: 42 }), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('put', response.request.method);
				assert.equals('*', response.request.headers['If-None-Match']);
				assert.equals('bar', response.request.entity.foo);
				assert.equals('42', response.request.entity.id);
				done();
			});
		},
		'should add a record ignoring the ID': function (done) {
			var store = new RestStore({ client: client, ignoreId: true });
			when(store.add({ foo: 'bar', id: 42 }), function (response) {
				assert.equals('', response.request.path);
				assert.equals('post', response.request.method);
				assert.equals('*', response.request.headers['If-None-Match']);
				assert.equals('bar', response.request.entity.foo);
				assert.equals('42', response.request.entity.id);
				done();
			});
		},
		'should put overwriting target': function (done) {
			var store = new RestStore({ client: client });
			when(store.put({ foo: 'bar', id: 42 }, { overwrite: true }), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('put', response.request.method);
				assert.equals('*', response.request.headers['If-Match']);
				done();
			});
		},
		'should put without overwriting target': function (done) {
			var store = new RestStore({ client: client });
			when(store.put({ foo: 'bar', id: 42 }, { overwrite: false }), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('put', response.request.method);
				assert.equals('*', response.request.headers['If-None-Match']);
				done();
			});
		},
		'should put with default config': function (done) {
			var store = new RestStore({ client: client });
			when(store.put({ foo: 'bar', id: 42 }), function (response) {
				assert.equals('42', response.request.path);
				assert.equals('put', response.request.method);
				refute(response.request.headers['If-None-Match']);
				refute(response.request.headers['If-Match']);
				done();
			});
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../rest/dojo/RestStore'));
	}
	// Boilerplate for AMD and Node
));
