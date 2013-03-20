# Clients

- Provided Clients
  - [Default Client](#module-rest)
  - [XMLHttpReqest Client](#module-rest/client/xhr)
  - [Node Client](#module-rest/client/node)
  - [JSONP Client](#module-rest/client/jsonp)
  - [IE XDomainRequest Client](#module-rest/client/xdr)


## Overview

A rest.js [client](interfaces.md#interface-client) is simply a function that accepts an argument as the [request](interfaces.md#interface-request) and returns a promise for the [response](interfaces.md#interface-response).

Clients are typically extended by chaining interceptors that wrap the client core behavior providing additional functionality and returning an enriched client.

```javascript
client = rest.chain(interceptor);
assert.same(rest, client.skip());
```

See the [interceptor docs](interceptors.md) for more information on interceptors and chaining.


## Provided Clients

The provided clients are the root of the interceptor chain.  They are responsible for the lowest level mechanics of making requests and handling responses.  In most cases, the developer doesn't need to be concerned with the particulars of the client, as the best client for the available environment will be chosen automatically.


<a name="module-rest"></a>
### Default Client

`rest` ([src](../rest.js))

The default client is also the main module for the rest.js package.  It's not a client implementations, but an alias to the best client for a platform.  When running within a browser, the XHR client is used; when running within Node.js, the Node client is used.  As other JavaScript environments are supported, the default client will continue to map directly to the most appropriate client implementation.


<a name="module-rest/client/xhr"></a>
### XMLHttpReqest Client

`rest/client/xhr` ([src](../client/xhr.js))

The default client for browsers.  The XHR client utilizes the XMLHttpRequest object provided by many browsers.  Most every browser has direct support for XHR today.  The `rest/interceptor/ie/xhr` interceptor can provided fall back support for older IE without native XHR.

**Special Properties**

<table>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Default</th>
  <th>Description</th>
</tr>
<tr>
  <td>request.engine</td>
  <td>optional</td>
  <td>window.XMLHttpRequest</td>
  <td>The XMLHttpRequest instance to use</td>
</tr>
</table>

**Know limitations**

The XHR client has the same security restrictions as the traditional XMLHttpRequest object.  For browsers that support XHR v1, that means that requests may only be made to the same origin as the web page.  The origin being defined by the scheme, host and port.  XHR v2 clients have support for Cross-origin Resource Sharing (CORS).  CORS enabled clients have the ability to make requests to any HTTP based service assuming the server is willing to participate in the [CORS dance](http://www.html5rocks.com/en/tutorials/cors/).


<a name="module-rest/client/node"></a>
### Node Client

`rest/client/node` ([src](../client/node.js))

The default client for Node.js.  The Node client uses the 'http' and 'https' modules.


<a name="module-rest/client/jsonp"></a>
### JSONP Client

`rest/client/jsonp` ([src](../client/jsonp.js))

JSONP client for browsers.  Allows basic cross-origin GETs via script tags.  This client is typically employed via the `rest/interceptor/jsonp` interceptor.  Never used as the default client.

**Special Properties**

<table>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Default</th>
  <th>Description</th>
</tr>
<tr>
  <td>request.callback.param</td>
  <td>optional</td>
  <td>'callback'</td>
  <td>URL parameter that contains the JSONP callback function's name</td>
</tr>
<tr>
  <td>request.callback.prefix</td>
  <td>optional</td>
  <td>'jsonp'</td>
  <td>common prefix for callback function names as they are placed on the window object</td>
</tr>
</table>


<a name="module-rest/client/xdr"></a>
### IE XDomainRequest Client

`rest/client/xdr` ([src](../client/xdr.js))

Cross-origin support available within IE, in particular IE 8 and 9.  This client is typically employed via the `rest/interceptor/ie/xdomain` interceptor.  Never used as the default client.

**Know limitations**

- only GET and POST methods are available
- must use same scheme as origin http-to-http, https-to-https
- no headers, request or response (the response Content-Type is available)
- no response status code

[Limitation details](http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx)
