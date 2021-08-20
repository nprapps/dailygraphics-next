Services are modules that may be used across multiple parts of the server. They typically register themselves on the Express ``app`` object, and then routes or other services can use ``app.get()`` to access them instead of having to require their module directly.

Modules in this directory:

* ``browserConsole.js`` - provides an interface for piping log statements up to the browser via a WebSocket, as well as to stdout. Use this just like a regular console.log().
* ``cache.js`` - provides a partitioned cache, which we split by file type (i.e., editing an HTML file will clear the cache for those but won't touch CSS, JS, or Sheets data).
* ``forceAuth.js`` - route middleware that checks to make sure you're still signed in to Google at regular intervals.
* ``google.js`` - a wrapper for ``/lib/sheetOps`` that adds caching to the data
* ``livereload.js`` - originally we used the Node livereload module, but had some issues on MacOS, so this is a custom implementation of the basic protocol. It can be paused and restarted with the ``close()`` and ``reopen()`` methods, if you're doing anything that touches files but shouldn't trigger a reload.
* ``render.js`` - a wrapper for ``/lib/processHTML`` to let it be used as an Express template engine for our admin routes.