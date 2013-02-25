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

/**
 * Distributed in browser testing with Sauce Labs
 */
(function () {
	'use strict';

	var webdriver, sauceConnect, when, sequence,
		failed, host, port, username, accessKey,
		projectName, travisJobNumber, travisCommit,
		environments, passFailInterceptor, buster;

	webdriver = require('wd');
	sauceConnect = require('sauce-connect-launcher');
	when = require('when');
	sequence = require('when/sequence');

	// we don't really care about the platform, but without it the browser may fail to resolve
	environments = [
		{ browserName: 'chrome',                            platform: 'Windows 2008' },
		{ browserName: 'firefox',                           platform: 'Windows 2008' },
		{ browserName: 'firefox',           version: '17',  platform: 'Windows 2003' },
		{ browserName: 'firefox',           version: '10',  platform: 'Windows 2003' },
		{ browserName: 'firefox',           version: '3.6', platform: 'Windows 2003' },
		{ browserName: 'internet explorer', version: '10',  platform: 'Windows 2012' },
		{ browserName: 'internet explorer', version: '9',   platform: 'Windows 2008' },
		{ browserName: 'internet explorer', version: '8',   platform: 'Windows 2003' },
		{ browserName: 'internet explorer', version: '7',   platform: 'Windows 2003' },
		{ browserName: 'internet explorer', version: '6',   platform: 'Windows 2003' },
		{ browserName: 'safari',            version: '6',   platform: 'Mac 10.8'     },
		{ browserName: 'safari',            version: '5',   platform: 'Mac 10.6'     },
		{ browserName: 'opera',             version: '12',  platform: 'Windows 2008' },
		{ browserName: 'opera',             version: '11',  platform: 'Windows 2008' },
		{ browserName: 'ipad',              version: '6',   platform: 'Mac 10.8'     },
		{ browserName: 'ipad',              version: '5.1', platform: 'Mac 10.8'     },
		{ browserName: 'ipad',              version: '5',   platform: 'Mac 10.6'     },
		{ browserName: 'ipad',              version: '4.3', platform: 'Mac 10.6'     }
	];

	failed = false;

	host = process.env.SELENIUM_HOST || 'localhost';
	port = process.env.SELENIUM_PORT || 4444;
	username = process.env.SELENIUM_USERNAME;
	accessKey = process.env.SELENIUM_PASSWORD;

	projectName = require('../package.json').name;
	travisJobNumber = process.env.TRAVIS_JOB_NUMBER || '';
	travisCommit = process.env.TRAVIS_COMMIT || '';

	if (travisCommit && !accessKey || !/\.1$/.test(travisJobNumber)) {
		// give up if we either don't have an accessKey or this is not the primary job for the build
		return;
	}

	passFailInterceptor = (function (username, password) {
		var interceptor, basicAuth, mime;

		interceptor = require('../interceptor');
		basicAuth = require('../interceptor/basicAuth');
		mime = require('../interceptor/mime');

		return interceptor({
			request: function (passed, config) {
				return {
					method: 'put',
					path: 'http://saucelabs.com/rest/v1/{username}/jobs/{jobId}',
					params: {
						username: username,
						jobId: config.jobId
					},
					entity: {
						passed: passed
					}
				};
			},
			client: basicAuth(mime({ mime: 'application/json' }), { username: username, password: password })
		});
	}(username, accessKey));

	function launchBuster(port) {
		var buster;

		buster = require('buster-static').create(process.stdout, process.stderr, {
		    extensions: [ require('../node_modules/buster/lib/buster/framework-extension') ]
		});
		buster.run(['-p', port, '-e', 'browser']);
		buster.exit = function () {
			buster.httpServer.close();
		};

		return buster;
	}

	function testWith(browser, environment) {
		var d, passFail;

		d = when.defer();

		environment.name = projectName + ' - ' +
			(travisJobNumber ? travisJobNumber + ' - ' : '') +
			environment.browserName + ' ' + (environment.version || 'latest') +
			' on ' + (environment.platform || 'any platform');
		environment.build = travisJobNumber ? travisJobNumber + ' - ' + travisCommit : 'manual';
		environment['max-duration'] = 300; // 5 minutes

		// most info is below the fold, so images are not helpful, html source is
		environment['record-video'] = false;
		environment['record-screenshots'] = false;
		environment['capture-html'] = true;

		try {
			browser.init(environment, function (err, sessionID) {
				console.log('Testing ' + environment.name);
				passFail = passFailInterceptor({ jobId: sessionID });
				browser.get('http://localhost:8080/', function (err) {
					if (err) {
						throw err;
					}
					browser.waitForElementByCssSelector('.stats > h2', 3e5, function (/* err */) {
						browser.elementByCssSelector('.stats > h2', function (err, stats) {
							browser.text(stats, function (err, text) {
								browser.quit(function () {
									var passed = text === 'Tests OK';
									console.log((passed ? 'PASS' : 'FAIL') + ' ' + environment.name);
									if (!passed) {
										failed = true;
									}
									passFail(passed).always(d.resolve);
								});
							});
						});
					});
				});
			});
		}
		catch (e) {
			console.log('FAIL ' + environment.name);
			console.error(e.message);
			failed = true;
			if (passFail) {
				passFail(false);
			}
			d.reject(e);
		}

		return d.promise;
	}

	// must use a port that sauce connect will tunnel
	buster = launchBuster('8080');

	console.log('Opening tunnel to Sauce Labs');
	sauceConnect({ username: username, accessKey: accessKey, 'no_progress': true }, function (err, tunnel) {

		if (err) {
			// errors are expected for some tests, like jsonp error handling
			return;
		}

		var browser, tasks;

		browser = webdriver.remote(host, port, username, accessKey);

		browser.on('status', function (info) {
			console.log('\x1b[36m%s\x1b[0m', info);
		});
		browser.on('command', function (meth, path) {
			console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
		});

		tasks = environments.map(function (environment) {
			return function () {
				return testWith(browser, environment);
			};
		});

		sequence(tasks).always(function () {
			console.log('Stopping buster');
			buster.exit();

			console.log('Closing tunnel to Sauce Labs');
			tunnel.close();

			setTimeout(function () {
				// should exit cleanly, but sometimes the tunnel is stuck open
				process.exit(failed ? 1 : 0);
			}, 500);
		});

	});

}());
