Handlers are all functions registered to URL routes for the local applications. They're mostly wrappers for ``/lib`` code, but some of them are specific functionality for running the server.

Modules in this directory:

* ``bundle.js`` - transpiles and serves JS files for graphics
* ``captureFallback.js`` - saves a screenshot of the graphic to be saved before deployment, wrapping ``/lib/puppetry``
* ``child.js`` - returns the graphic embed HTML
* ``createGraphics.js`` - wrapper for ``/lib/createGraphic``, usually triggered from the admin page
* ``deploy.js`` - wrapper for ``/lib/deployGraphic``
* ``duplicate.js`` - wrapper for ``/lib/duplicateGraphic``
* ``evictSheet.js`` - explicit route for reloading fresh data from Sheets
* ``files.js`` - serves unprocessed static files, such as images or JSON
* ``googleAuth.js`` - handles the round-trip for Google OAuth login flow
* ``parent.js`` - returns the preview page HTML
* ``root.js`` - shows the listing of all graphics
* ``style.js`` - builds and serves LESS files for graphics