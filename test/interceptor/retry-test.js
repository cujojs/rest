(function (buster, define) {

	var assert, fail;

	assert = buster.assertions.assert;
	fail = buster.assertions.fail;

	define('rest/interceptor/retry-test', function (require) {

		var interceptor, retry, rest, when, delay, sinon;

		interceptor = require('rest/interceptor');
		retry = require('rest/interceptor/retry');
		rest = require('rest');
		when = require('when');

		buster.testCase('rest/interceptor/retry', {
			'should retry until successful': function (done) {
				var count = 0, client = retry(
					function (request) {
						count += 1;
						if (count === 2) {
							return { request: request, status: { code: 200 } };
						} else {
							return when.reject({ request: request, error: "Thrown by fake client" });
						}
					}
				);
				client({}).then(
					function (response) {
					    assert.equals(200, response.status.code);
					},
					function (response) {
						fail("Error should not propagate to client.");
					}
				).always(done);
			},
			'should accept custom config': function (done) {
				var count = 0, client, start;
				
				client = retry(
					function (request) {
						count += 1;
						if (count === 4) {
							return { request: request, status: { code: 200 } };
						} else {
							return when.reject({ request: request, error: "Thrown by fake client" });
						}
					}, { initial: 10, multiplier: 3, max: 20 }
				);
				
				client = interceptor({
					request: function (request, config) {
						start = new Date();
						return request;
					},
					response: function (response, config) {
						var elapsed = new Date() - start;
						assert.equals(count, 4);
						assert.equals(response.request.retry, Math.pow(3, count - 1) * 10);
						assert(elapsed < 70); // Total paused time should be 50 - this allows padding
											  // for execution time that would be much larger without max
											  // TODO - A more accurate test might be to use a spy on when.delay
						return response;
					}
				})(client);
				
				client({}).then(
					function (response) {
					    assert.equals(200, response.status.code);
					},
					function (response) {
						console.log(response);
						fail("Error should not propagate to client.");
					}
				).always(done);
			},
			'should not make propagate request if marked as canceled': function (done) {
				var parent, client, request;

				parent = this.spy(function (request) {
					return when.reject({ request: request });
				});
				client = retry(parent, { initial: 10 });

				request = {};
				client(request).then(
					function () {
						fail('should not be called');
					},
					function (response) {
						assert(request.canceled);
						assert.equals('precanceled', response.error);
						assert.same(1, parent.callCount);
					}
				).always(done);

				request.canceled = true;
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, retry().skip());
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
