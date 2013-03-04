/*
 * Copyright (c) 2013 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail, failOnThrow, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;
	failOnThrow = buster.assertions.failOnThrow;

	define('rest/interceptor-test', function (require) {

		var interceptor, rest, when, delay;

		interceptor = require('rest/interceptor');
		rest = require('rest');
		when = require('when');
		delay = require('when/delay');

		function defaultClient(request) {
			return { request: request, id: 'default' };
		}

		function otherClient(request) {
			return { request: request, id: 'other' };
		}

		function errorClient(request) {
			return when.reject({ request: request, id: 'error' });
		}

		function unresponsiveClient(request) {
			request.id = 'unresponsive';
			return when.defer().promise;
		}

		buster.testCase('rest/interceptor', {
			'should set the originator client on the request for the, but do not overwrite': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor();
				client = theInterceptor(defaultClient).chain(theInterceptor);
				client().then(function (response) {
					assert.same('default', response.id);
					assert.same(client, response.request.originator);
				}).then(undef, fail).always(done);
			},
			'should use the client configured into the interceptor by default': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					client: defaultClient
				});
				client = theInterceptor();
				client().then(function (response) {
					assert.same('default', response.id);
					assert.same(client, response.request.originator);
				}).then(undef, fail).always(done);
			},
			'should override the client configured into the interceptor by default': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					client: defaultClient
				});
				client = theInterceptor(otherClient);
				client().then(function (response) {
					assert.same('other', response.id);
					assert.same(client, response.request.originator);
				}).then(undef, fail).always(done);
			},
			'should intercept the request phase': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						request.phase = 'request';
						return request;
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('request', response.request.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the request phase and handle a promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						return delay(5).then(function () {
							request.phase = 'request';
							return request;
						});
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('default', response.id);
					assert.same('request', response.request.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the request phase and handle a rejected promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						request.phase = 'request';
						return when.reject('rejected request');
					}
				});
				client = theInterceptor(defaultClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						// request never makes it to the root client
						refute(response.id);
						assert.same('request', response.request.phase);
						assert.same('rejected request', response.error);
					})
				).always(done);
			},
			'should intercept the response phase': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('response', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the response phase and handle a promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						return delay(5).then(function () {
							response.phase = 'response';
							return response;
						});
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('response', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the response phase and handle a rejceted promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when.reject(response);
					}
				});
				client = theInterceptor(defaultClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('response', response.phase);
					})
				).always(done);
			},
			'should intercept the response phase for an error': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return response;
					}
				});
				client = theInterceptor(errorClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('response', response.phase);
					})
				).always(done);
			},
			'should intercept the response phase for an error and handle a promise maintaining the error': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when(response);
					}
				});
				client = theInterceptor(errorClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('response', response.phase);
					})
				).always(done);
			},
			'should intercept the response phase for an error and handle a rejected promise maintaining the error': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when.reject(response);
					}
				});
				client = theInterceptor(errorClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('response', response.phase);
					})
				).always(done);
			},
			'should intercept the success phase': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					success: function (response) {
						response.phase = 'success';
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('success', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the success phase and handle a promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					success: function (response) {
						return delay(5).then(function () {
							response.phase = 'success';
							return response;
						});
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same('success', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the success phase and handle a rejceted promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					success: function (response) {
						response.phase = 'success';
						return when.reject(response);
					}
				});
				client = theInterceptor(defaultClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('success', response.phase);
					})
				).always(done);
			},
			'should intercept the error phase': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					error: function (response) {
						response.phase = 'error';
						return response;
					}
				});
				client = theInterceptor(errorClient);
				client().then(function (response) {
					assert.same('error', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the error phase and handle a promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					error: function (response) {
						response.phase = 'error';
						return when(response);
					}
				});
				client = theInterceptor(errorClient);
				client().then(function (response) {
					assert.same('error', response.phase);
				}).then(undef, fail).always(done);
			},
			'should intercept the error phase and handle a rejceted promise': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: fail,
					error: function (response) {
						response.phase = 'error';
						return when.reject(response);
					}
				});
				client = theInterceptor(errorClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('error', response.phase);
					})
				).always(done);
			},
			'should pass interceptor config to handlers': function (done) {
				var theInterceptor, client, theConfig;
				theConfig = { foo: 'bar' };
				theInterceptor = interceptor({
					request: function (request, config) {
						request.phase = 'request';
						refute.same(theConfig, config);
						assert.same(theConfig.foo, config.foo);
						return request;
					},
					response: function (response, config) {
						response.phase = 'response';
						refute.same(theConfig, config);
						assert.same(theConfig.foo, config.foo);
						return response;
					}
				});
				client = theInterceptor(defaultClient, theConfig);
				client().then(function (response) {
					assert.same('request', response.request.phase);
					assert.same('response', response.phase);
				}).then(undef, fail).always(done);
			},
			'should share context between handlers that is unique per request': function (done) {
				var theInterceptor, client, count, counted;
				count = 0;
				counted = [];
				theInterceptor = interceptor({
					request: function (request) {
						count += 1;
						if (count % 2) {
							this.count = count;
						}
						return request;
					},
					response: function (response) {
						counted.push(this.count);
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				when.all([client(), client(), client()]).then(function () {
					assert.same(3, counted.length);
					assert(counted.indexOf(1) >= 0);
					// if 'this' was shared between requests, we'd have 1 twice and no undef
					assert(counted.indexOf(2) === -1);
					assert(counted.indexOf(undef) >= 0);
					assert(counted.indexOf(3) >= 0);
				}).then(undef, fail).always(done);
			},
			'should use the client provided by a ComplexRequest': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						return new interceptor.ComplexRequest({
							request: request,
							client: defaultClient
						});
					}
				});
				client = theInterceptor();
				client().then(function (response) {
					assert.same('default', response.id);
					assert.same(client, response.request.originator);
				}).then(undef, fail).always(done);
			},
			'should cancel requests with the abort trigger provided by a ComplexRequest': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						refute.same('unresponsive', request.id);
						return new interceptor.ComplexRequest({
							request: request,
							abort: when.reject({ request: request, id: 'abort' })
						});
					}
				});
				client = theInterceptor(unresponsiveClient);
				client().then(
					fail,
					failOnThrow(function (response) {
						assert.same('abort', response.id);
						assert.same('unresponsive', response.request.id);
					})
				).always(done);
			},
			'should have access to the client in the response handlers for subsequent requests': function (done) {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response, config, client) {
						response.client = client;
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				client().then(function (response) {
					assert.same(client, response.client);
					assert.same('default', response.id);
				}).then(undef, fail).always(done);
			},
			'should initialize the config object, without modifying the provided object': function (done) {
				var theConfig, theInterceptor, client;
				theConfig = { foo: 'bar' };
				theInterceptor = interceptor({
					init: function (config) {
						refute.same(theConfig, config);
						assert.same('bar', config.foo);
						config.bleep = 'bloop';
						return config;
					},
					request: function (request, config) {
						refute.same(theConfig, config);
						assert.same('bar', config.foo);
						config.foo = 'not-bar';
						assert.same('bar', theConfig.foo);
						request.phase = 'request';
						return request;
					},
					response: function (response, config) {
						assert.same('not-bar', config.foo);
						assert.same('bar', theConfig.foo);
						response.phase = 'response';
						return response;
					}
				});
				client = theInterceptor(defaultClient, theConfig);
				client().then(function (response) {
					assert.same('request', response.request.phase);
					assert.same('response', response.phase);
					assert.same('default', response.id);
				}).then(undef, fail).always(done);
			},
			'should have the default client as the parent by default': function () {
				var theInterceptor = interceptor();
				assert.same(rest, theInterceptor().skip());
			},
			'should support interceptor chaining': function () {
				var theInterceptor = interceptor();
				assert(typeof theInterceptor().chain === 'function');
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
