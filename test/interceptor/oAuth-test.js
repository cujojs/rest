(function (global, buster, oAuth, pubsub) {

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/oAuth', {
		'should authenticate the request for a known token': function (done) {
			var client;

			client = oAuth(
				function (request) { return { request: request, status: { code: 200 } }; },
				{ token: 'bearer abcxyz' }
			);

			client({}).then(
				function (response) {
					assert.equals('bearer abcxyz', response.request.headers.Authorization);
					done();
				}
			);
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

			client({}).then(
				function (response) {
					assert.equals('bearer abcxyz', response.request.headers.Authorization);
					assert.called(windowStrategyClose);
					done();
				}
			);
		}
	});

}(
	typeof global === 'undefined' ? this : global,
	this.buster || require('buster'),
	this.rest_interceptor_oAuth || require('../../src/rest/interceptor/oAuth'),
	this.rest_util_pubsub || require('../../src/rest/util/pubsub')
));
