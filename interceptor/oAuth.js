(function (global, define) {

	define(['../../rest', 'when', '../UrlBuilder', '../util/pubsub'], function (defaultClient, when, UrlBuilder, pubsub) {
		"use strict";

		function defaultOAuthCallback(hash) {
			var params, queryString, regex, m;

			queryString = hash.indexOf('#') === 0 ? hash.substring(1) : hash;
			params = {};
			regex = /([^&=]+)=([^&]*)/g;

			m = regex.exec(queryString);
			do {
				params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
				m = regex.exec(queryString);
			} while (m);

			pubsub.publish(params.state, params.token_type + ' ' + params.access_token);
		}

		function defaultWindowStrategy(url) {
			var w = window.open(url, '_blank', 'width=500,height=400');
			return function () {
				w.close();
			};
		}

		/**
		 * OAuth implicit flow support
		 *
		 * Authorizes request with the OAuth authorization token.  Tokens are
		 * requested from the authorization server as needed if there isn't a
		 * token, or the token is expired.
		 *
		 * A custom window strategy can be provided to replace the default popup
		 * window.  The window strategy is a function that must accept a URL as an
		 * argument and returns a function to close and cleanup the window.  A
		 * common custom strategy would be to use an iframe in a dialog.
		 *
		 * The callback function must be invoked when the authorization server
		 * redirects the browser back to the application.
		 *
		 * NOTE: Registering a handler to receive the redirect is required and
		 * outside the scope of this interceptor.  The implementer must collect the
		 * URL fragment and pass it to the callback function on the 'opener', or
		 * 'parent' window.
		 *
		 * @param {Client} [client] client to wrap
		 * @param {String} [config.token] pre-configured authentication token
		 * @param {String} config.clientId OAuth clientId
		 * @param {String} config.scope OAuth scope
		 * @param {String} config.authorizationUrlBase URL of the authorization server
		 * @param {String} [config.redirectUrl] callback URL from the authorization server.  Will be converted to a fully qualified, absolute URL, if needed.  Default's to the window's location or base href.
		 * @param {Function} [config.windowStrategy] strategy for opening the authorization window, defaults to window.open
		 * @param {String} [config.oAuthCallbackName='oAuthCallback'] name to register the callback as in global scope
		 * @param {Function} [config.oAuthCallback] callback function to receive OAuth URL fragment
		 *
		 * @returns {Client}
		 */
		return function (client, config) {
			if (typeof client === 'object') {
				config = client;
			}
			if (typeof client !== 'function') {
				client = defaultClient;
			}

			var interceptor, authorization, clientId, authorizationUrlBase, redirectUrl, scope, windowStrategy;

			authorization = config.token;
			clientId = config.clientId;
			authorizationUrlBase = config.authorizationUrlBase;
			redirectUrl = new UrlBuilder(config.redirectUrl).absolute().build();
			scope = config.scope;
			windowStrategy = config.windowStrategy || defaultWindowStrategy;

			global[config.oAuthCallbackName || 'oAuthCallback'] = config.oAuthCallback || defaultOAuthCallback;

			function reauthorize() {
				var d, state, url, dismissWindow;

				d = when.defer();
				state = Math.random() * new Date().getTime();
				url = new UrlBuilder(authorizationUrlBase).build({
					'response_type': 'token',
					'redirect_uri': redirectUrl,
					'client_id': clientId,
					'scope': scope,
					'state': state
				});

				dismissWindow = windowStrategy(url);

				pubsub.subscribe(state, function (auth) {
					authorization = auth;
					dismissWindow();
					d.resolve(authorization);
				});

				return d.promise;
			}

			interceptor = function (request) {
				var response;

				response = when.defer();

				function doRequest() {
					var headers;

					headers = request.headers || (request.headers = {});
					headers.Authorization = authorization;

					when(
						client(request),
						function (success) {
							if (success.status.code === 401) {
								when(reauthorize(), function () {
									doRequest(request);
								});
							}
							else if (success.status.code === 403) {
								response.reject(success);
							}
							else {
								response.resolve(success);
							}
						},
						function (error) {
							response.reject(error);
						},
						function (progress) {
							response.progress(progress);
						}
					);
				}

				if (!authorization) {
					when(reauthorize(), function () {
						doRequest();
					});
				}
				else {
					doRequest();
				}

				return response.promise;
			};
			interceptor.skip = function () {
				return client;
			};

			return interceptor;
		};

	});

}(
	typeof global === 'undefined' ? this : global,
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
