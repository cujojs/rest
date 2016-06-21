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
  var refute = buster.assertions.refute
  var fail = buster.assertions.fail

  define('rest-test/interceptor/location-test', function (require) {
    var location = require('rest/interceptor/location')
    var rest = require('rest')

    buster.testCase('rest/interceptor/location', {
      'should follow the location header': function () {
        var spy = this.spy(function (request) {
          var response = { request: request, headers: {} }
          if (spy.callCount < 3) {
            response.headers.Location = '/foo/' + spy.callCount
          }
          return response
        })
        var client = location(spy)
        return client({}).then(function (response) {
          refute(response.headers.Location)
          assert.same(3, spy.callCount)
          assert.same(spy.returnValues[0].headers.Location, '/foo/1')
          assert.same(spy.args[1][0].path, '/foo/1')
          assert.same(spy.args[1][0].method, 'GET')
          assert.same(spy.returnValues[1].headers.Location, '/foo/2')
          assert.same(spy.args[2][0].path, '/foo/2')
          assert.same(spy.args[2][0].method, 'GET')
          refute(spy.returnValues[2].headers.Location)
        })['catch'](fail)
      },
      'should follow the location header when status code is greater or equal to configured status code': function () {
        var spy = this.spy(function (request) {
          var statusCode = 300
          var response = {
            request: request,
            headers: {},
            status: { code: statusCode }
          }
          if (spy.callCount === 1) {
            response.headers.Location = '/foo'
          }
          statusCode = statusCode - 1
          return response
        })
        var client = location(spy, { code: 300 })
        return client({}).then(function () {
          assert.same(2, spy.callCount)
          assert.same(spy.args[1][0].path, '/foo')
        })['catch'](fail)
      },
      'should return the response if there is no location header': function () {
        var spy = this.spy(function () { return { status: { code: 200 } } })
        var client = location(spy)
        return client({}).then(function (response) {
          assert.equals(200, response.status.code)
          assert.same(1, spy.callCount)
        })['catch'](fail)
      },
      'should have the default client as the parent by default': function () {
        assert.same(rest, location().skip())
      },
      'should support interceptor wrapping': function () {
        assert(typeof location().wrap === 'function')
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
