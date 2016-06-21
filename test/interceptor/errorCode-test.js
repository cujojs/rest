/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

/* eslint-env amd */

(function (buster, define) {
  'use strict'

  var assert = buster.assertions.assert
  var fail = buster.assertions.fail
  var failOnThrow = buster.assertions.failOnThrow

  define('rest-test/interceptor/errorCode-test', function (require) {
    var errorCode = require('rest/interceptor/errorCode')
    var rest = require('rest')

    buster.testCase('rest/interceptor/errorCode', {
      'should resolve for less than 400 by default': function () {
        var client = errorCode(
          function () { return { status: { code: 399 } } }
        )
        return client({}).then(function (response) {
          assert.equals(399, response.status.code)
        })['catch'](fail)
      },
      'should reject for 400 or greater by default': function () {
        var client = errorCode(
          function () { return { status: { code: 400 } } }
        )
        return client({}).then(
          fail,
          failOnThrow(function (response) {
            assert.equals(400, response.status.code)
          })
        )
      },
      'should reject lower then 400 with a custom code': function () {
        var client = errorCode(
          function () { return { status: { code: 300 } } },
          { code: 300 }
        )
        return client({}).then(
          fail,
          failOnThrow(function (response) {
            assert.equals(300, response.status.code)
          })
        )
      },
      'should have the default client as the parent by default': function () {
        assert.same(rest, errorCode().skip())
      },
      'should support interceptor warpping': function () {
        assert(typeof errorCode().wrap === 'function')
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
