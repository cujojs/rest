/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

/* eslint-env amd */

(function (buster, define) {
  'use strict'

  var assert = buster.assertions.assert

  define('rest-test/node-test', function (require) {
    var rest = require('rest/node')
    var defaultClient = require('rest/client/default')
    var node = require('rest/client/node')

    buster.testCase('rest/node', {
      'should be the default client': function () {
        assert.same(defaultClient, rest)
      },
      'should wrap the node client': function () {
        assert.same(node, rest.getDefaultClient())
      }
    })
  })
}(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (id, factory) {
    var packageName = id.split(/[\/\-]/)[0]
    var pathToRoot = id.replace(/[^\/]+/g, '..')
    pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot
    factory(function (moduleId) {
      return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId)
    })
  }
  // Boilerplate for AMD and Node
))
