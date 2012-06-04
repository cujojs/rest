(function (global, buster, define) {

	var oAuth, rest, pubsub, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/oAuth', {
		setUp: function (done) {
			if (oAuth) { return done(); }
			define('rest/interceptor/oAuth-test', ['rest/interceptor/oAuth', 'rest/util/pubsub', 'rest'], function (oa, ps, r) {
				oAuth = oa;
				pubsub = ps;
				rest = r;
				done();
			});
		},

		'should authenticate the request for a known token': function (done) {
			var client;

			client = oAuth(
				function (request) { return { request: request, status: { code: 200 } }; },
				{ token: 'bearer abcxyz' }
			);

			client({}).then(function (response) {
				assert.equals('bearer abcxyz', response.request.headers.Authorization);
			}).always(done);
		},
		'should use implicit flow to authenticate the request': function (done) {
			var client, windowStrategy, windowStrategyClose, oAuthCallbackName;

			oAuthCallbackName = 'oAuthCallback' + Math.round(Math.random() * 100000);
			windowStrategyClose = this.spy(function () {});
			windowStrategy = function (url) {
				var state;
				assert(url.indexOf('https://www.example.com/auth?response_type=token&redirect_uri=http%3A%2F%2Flocalhost%2FimplicitHandler&client_id=user&scope=openid&state=') === 0);
				state = url.substring(url.lastIndexOf('=') + 1);
				setTimeout(function () {
					global[oAuthCallbackName]('#state=' + state + '&=token_type=bearer&access_token=abcxyz');
				}, 10);
				return windowStrategyClose;
			};

			client = oAuth(
				function (request) {
					return { request: request, status: { code: 200 } };
				},
				{
					clientId: 'user',
					authorizationUrlBase: 'https://www.example.com/auth',
					redirectUrl: 'http://localhost/implicitHandler',
					scope: 'openid',
					windowStrategy: windowStrategy,
					oAuthCallbackName: oAuthCallbackName
				}
			);

			client({}).then(function (response) {
				assert.equals('bearer abcxyz', response.request.headers.Authorization);
				assert.called(windowStrategyClose);
			}).always(done);
		},
		'should have the default client as the parent by default': function () {
			assert.same(rest, oAuth({ token: 'bearer abcxyz' }).skip());
		}
	});

}(
	typeof global === 'undefined' ? this : global,
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../interceptor/oAuth'), require('../../util/pubsub'), require('../../rest'));
	}
	// Boilerplate for AMD and Node
));