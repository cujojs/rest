/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

window.curl = {
	packages: [
		{ name: 'rest', location: './', main: 'browser', config: { moduleLoader: 'curl/loader/cjsm11' } },
		{ name: 'curl', location: 'node_modules/curl/src/curl', main: 'curl' },
		{ name: 'poly', location: 'node_modules/poly', main: 'poly' },
		{ name: 'when', location: 'node_modules/when', main: 'when' },
		{ name: 'wire', location: 'node_modules/wire', main: 'wire' }
	],
	// avoid poly/xhr as we need to test the case without it
	preloads: ['poly/object', 'poly/string', 'poly/date', 'poly/array', 'poly/function', 'poly/json']
};
