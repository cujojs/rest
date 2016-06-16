/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

if (console) {
	(console.warn || console.log).call(console, 'rest.js: The main module has moved, please switch your configuration to use \'rest/browser\' as the main module for browser applications.');
}

module.exports = require('./browser');
