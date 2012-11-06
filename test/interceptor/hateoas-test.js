(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest/interceptor/hateoas-test', function (require) {

		var hateoas, rest, when;

		hateoas = require('rest/interceptor/hateoas');
		rest = require('rest');
		when = require('when');

		buster.testCase('rest/interceptor/hateoas', {
			requiresSupportFor: {
				'Object.defineProperty': function () {
					try {
						var obj = {};
						Object.defineProperty(obj, 'test', { enumerable: false, configurable: true, value: true });
						return obj.test;
					}
					catch (e) {
						return false;
					}
				}
			},

			'should parse links in the entity': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; });

				client().then(function (response) {
					assert.same(parent, response.entity._links.parentLink);
					assert.same(self, response.entity._links.selfLink);
				}).always(done);
			},
			'should parse links in the entity into the entity': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; }, { target: '' });

				client().then(function (response) {
					assert.same(parent, response.entity.parentLink);
					assert.same(self, response.entity.selfLink);
				}).always(done);
			},
			'should create a client for the related resource': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; });

				client().then(function (response) {
					var parentClient = response.entity._links.clientFor('parent', function (request) { return { request: request }; });
					parentClient().then(function (response) {
						assert.same(parent.href, response.request.path);
					}).always(done);
				});
			},
			'should fetch a related resource': function (done) {
				// NOTE this functionality requires a native implementation of Object.defineProperty
				var client, parentClient, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				parentClient = function (request) { return { request: request, entity: { links: [ parent, self ] } }; };
				client = hateoas(function () { return { entity: body }; }, { client: parentClient });

				client().then(function (response) {
					when(response.entity._links.parent, function (response) {
						assert.same(parent.href, response.request.path);
						assert.same(self, response.entity._links.selfLink);
					}).always(done);
				});
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, hateoas().skip());
			}
		});

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
