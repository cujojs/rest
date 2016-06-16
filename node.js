/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var rest = require('./client/default'),
    node = require('./client/node');

rest.setPlatformDefaultClient(node);

module.exports = rest;
