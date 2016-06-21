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
  var refute = buster.assertions.refute

  define('rest-test/client-test', function (require) {
    var client = require('rest/client')
    var rest = require('rest/client/default')
    var interceptor = require('rest/interceptor')

    var defaultClient = client(function (request) {
      return { request: request, id: 'default' }
    })
    var skippableClient = client(function (request) {
      return { request: request, id: 'default' }
    }, rest)
    var defaultInterceptor = interceptor()

    buster.testCase('rest/client', {
      'should wrap the client with an interceptor': function () {
        assert(typeof defaultClient.wrap(defaultInterceptor) === 'function')
      },
      'should continue to support chain as a alias for wrap': function () {
        var config = {}
        this.spy(defaultClient, 'wrap')
        defaultClient.chain(defaultInterceptor, config)
        assert.calledWith(defaultClient.wrap, defaultInterceptor, config)
        defaultClient.wrap.restore()
      },
      'should return the next client in the chain': function () {
        assert.same(rest, skippableClient.skip())
        refute(defaultClient.skip)
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
