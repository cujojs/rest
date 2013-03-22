# Dojo Toolkit

Dojo provides a common [Store API](http://dojotoolkit.org/reference-guide/1.8/dojo/store.html) for data store operations. rest.js provides two implementations of these APIs that use a rest client under the hood. Typical Dojo stores include an in memory `MemoryStore` or the ever popular `JsonRest`. The issue with JsonRest is fundamentally that it presumes the mechanics of the request and response. If your server doesn't fit the convention it expects, you're out of luck. rest.js doesn't presume to force a particular content type, or structure.  Any client can be wrapped to provide the full power and flexibility of rest.js with the Dojo Store API.


<a name="dojo-stores"></a>
## Stores


<a name="module-rest/dojo/SimpleRestStore"></a>
### SimpleRestStore

`rest/dojo/SimpleRestStore` ([src](../dojo/SimpleRestStore.js))

An implementation of the Dojo Store API without a concrete dependency on Dojo.

The constructor accepts one additional argument, a rest.js client. The client is used for all requests and is commonly configured with the `pathPrefix` interceptor for nested paths.

Please see the [Dojo Store API docs](http://dojotoolkit.org/reference-guide/1.8/dojo/store.html) for details.


<a name="module-rest/dojo/RestStore"></a>
### RestStore

`rest/dojo/RestStore` ([src](../dojo/RestStore.js))

Extends `SimpleRestStore` providing enhanced support for queries via [Dojo's QueryResults](http://dojotoolkit.org/reference-guide/1.8/dojo/store/util/QueryResults.html#dojo-store-util-queryresults) `dojo/store/util/QueryResults`. This introduces a hard dependency on Dojo that many users may want to avoid unless they need the enhanced behavior, or already have Dojo loaded in their application.


<a name="module-rest/dojo/wire"></a>
### wire.js

`rest/dojo/wire` ([src](../dojo/wire.js))

Contains the functionality of [`rest/wire`](wire.md) adding an additional reference resolver for 'resource!' modeled after `wire/dojo/store`.  'resource!' supports the same configuration properties as ['client!'](wire.md#wire-client-resolver).
