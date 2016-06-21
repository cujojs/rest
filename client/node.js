/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

'use strict'

var parser = require('url')
var http = require('http')
var https = require('https')
var mixin = require('../util/mixin')
var normalizeHeaderName = require('../util/normalizeHeaderName')
var responsePromise = require('../util/responsePromise')
var client = require('../client')

var httpsExp = /^https/i

// TODO remove once Node 0.6 is no longer supported
Buffer.concat = Buffer.concat || function (list, length) {
  // from https://github.com/joyent/node/blob/v0.8.21/lib/buffer.js
  if (!Array.isArray(list)) {
    throw new Error('Usage: Buffer.concat(list, [length])')
  }

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i, buf

  if (typeof length !== 'number') {
    length = 0
    for (i = 0; i < list.length; i++) {
      buf = list[i]
      length += buf.length
    }
  }

  var buffer = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    buf = list[i]
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

module.exports = client(function node (request) {
  return responsePromise.promise(function (resolve, reject) {
    request = typeof request === 'string' ? { path: request } : request || {}
    var response = { request: request }

    if (request.canceled) {
      response.error = 'precanceled'
      reject(response)
      return
    }

    var url = response.url = request.path || ''
    var client = url.match(httpsExp) ? https : http

    var options = mixin({}, request.mixin, parser.parse(url))

    var entity = request.entity
    request.method = request.method || (entity ? 'POST' : 'GET')
    options.method = request.method
    var headers = options.headers = {}
    Object.keys(request.headers || {}).forEach(function (name) {
      headers[normalizeHeaderName(name)] = request.headers[name]
    })
    if (!headers['Content-Length']) {
      headers['Content-Length'] = entity ? Buffer.byteLength(entity, 'utf8') : 0
    }

    request.canceled = false
    request.cancel = function cancel () {
      request.canceled = true
      response.error = 'canceled'
      clientRequest.abort()
      reject(response)
    }

    var clientRequest = client.request(options, function (clientResponse) {
      // Array of Buffers to collect response chunks
      var buffers = []

      response.raw = {
        request: clientRequest,
        response: clientResponse
      }
      response.status = {
        code: clientResponse.statusCode
        // node doesn't provide access to the status text
      }
      response.headers = {}
      Object.keys(clientResponse.headers).forEach(function (name) {
        response.headers[normalizeHeaderName(name)] = clientResponse.headers[name]
      })

      clientResponse.on('data', function (data) {
        // Collect the next Buffer chunk
        buffers.push(data)
      })

      clientResponse.on('end', function () {
        // Create the final response entity
        response.entity = buffers.length > 0 ? Buffer.concat(buffers).toString() : ''
        buffers = null

        resolve(response)
      })
    })

    clientRequest.on('error', function (e) {
      response.error = e
      reject(response)
    })

    if (entity) {
      clientRequest.write(entity)
    }
    clientRequest.end()
  }, request)
})
