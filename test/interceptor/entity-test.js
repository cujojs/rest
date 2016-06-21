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

  define('rest-test/interceptor/entity-test', function (require) {
    var entity = require('rest/interceptor/entity')
    var rest = require('rest')

    buster.testCase('rest/interceptor/entity', {
      'should return the response entity': function () {
        var body = {}
        var client = entity(function () { return { entity: body } })

        return client().then(function (response) {
          assert.same(body, response)
        })['catch'](fail)
      },
      'should return the whole response if there is no entity': function () {
        var response = {}
        var client = entity(function () { return response })

        return client().then(function (r) {
          assert.same(response, r)
        })['catch'](fail)
      },
      'should have the default client as the parent by default': function () {
        assert.same(rest, entity().skip())
      },
      'should support interceptor wrapping': function () {
        assert(typeof entity().wrap === 'function')
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
