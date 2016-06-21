/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/*jshint latedef: nofunc */

var normalizeHeaderName = require('./normalizeHeaderName');

function property(promise, name) {
  return promise.then(
    function (value) {
      return value && value[name];
    },
    function (value) {
      return Promise.reject(value && value[name]);
    }
  );
}

/**
 * Obtain the response entity
 *
 * @returns {Promise} for the response entity
 */
function entity() {
  /*jshint validthis:true */
  return property(this, 'entity');
}

/**
 * Obtain the response status
 *
 * @returns {Promise} for the response status
 */
function status() {
  /*jshint validthis:true */
  return property(property(this, 'status'), 'code');
}

/**
 * Obtain the response headers map
 *
 * @returns {Promise} for the response headers map
 */
function headers() {
  /*jshint validthis:true */
  return property(this, 'headers');
}

/**
 * Obtain a specific response header
 *
 * @param {String} headerName the header to retrieve
 * @returns {Promise} for the response header's value
 */
function header(headerName) {
  /*jshint validthis:true */
  headerName = normalizeHeaderName(headerName);
  return property(this.headers(), headerName);
}

/**
 * Follow a related resource
 *
 * The relationship to follow may be define as a plain string, an object
 * with the rel and params, or an array containing one or more entries
 * with the previous forms.
 *
 * Examples:
 *   response.follow('next')
 *
 *   response.follow({ rel: 'next', params: { pageSize: 100 } })
 *
 *   response.follow([
 *       { rel: 'items', params: { projection: 'noImages' } },
 *       'search',
 *       { rel: 'findByGalleryIsNull', params: { projection: 'noImages' } },
 *       'items'
 *   ])
 *
 * @param {String|Object|Array} rels one, or more, relationships to follow
 * @returns ResponsePromise<Response> related resource
 */
function follow(rels) {
  /*jshint validthis:true */
  rels = [].concat(rels);

  return make(rels.reduce(function (response, rel) {
    return response.then(function (response) {
      if (typeof rel === 'string') {
        rel = { rel: rel };
      }
      if (typeof response.entity.clientFor !== 'function') {
        throw new Error('Hypermedia response expected');
      }
      var client = response.entity.clientFor(rel.rel);
      return client({ params: rel.params });
    });
  }, this));
}

/**
 * Wrap a Promise as an ResponsePromise
 *
 * @param {Promise<Response>} promise the promise for an HTTP Response
 * @param {Request} request the HTTP Request
 * @returns {ResponsePromise<Response>} wrapped promise for Response with additional helper methods
 */
function make(promise, request) {
  promise.status = status;
  promise.headers = headers;
  promise.header = header;
  promise.entity = entity;
  promise.follow = follow;
  promise.cancel = function () {
    if (!request) { return; }
    if (request.cancel) {
      request.cancel();
    } else {
      request.canceled = true;
    }
    return this;
  };
  return promise;
}

function responsePromise(obj, callback, errback, request) {
  return make(Promise.resolve(obj).then(callback, errback), request);
}

responsePromise.make = make;
responsePromise.reject = function (val, request) {
  return make(Promise.reject(val), request);
};
responsePromise.promise = function (func, request) {
  return make(new Promise(func), request);
};

module.exports = responsePromise;
