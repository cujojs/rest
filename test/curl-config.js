/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (global) {
	'use strict';

	global.curl = {
		packages: [
			{ name: 'rest', location: './', main: 'rest' },
			{ name: 'curl', location: 'node_modules/curl/src/curl', main: 'curl' },
			{ name: 'dojo', location: 'node_modules/dojo', main: 'dojo' },
			{ name: 'poly', location: 'node_modules/poly', main: 'poly' },
			{ name: 'when', location: 'node_modules/when', main: 'when' },
			{ name: 'wire', location: 'node_modules/wire', main: 'wire' }
		],
		// avoid poly/xhr as we need to test the case without it
		preloads: ['poly/object', 'poly/string', 'poly/date', 'poly/array', 'poly/function', 'poly/json']
	};

}(this));
