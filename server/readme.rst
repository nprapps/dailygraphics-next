Dailygraphics server
====================

This directory contains the web GUI for the rig. It's is written on top of Express, and its code is organized as follows:

* ``/handlers`` - middleware callback functions that get registered to routes
* ``/services`` - modules made available via ``app.get()`` application-wide, including aliases for code in ``/lib`` (it's easier to ``get()`` than to do a lengthy ``require()`` up the tree)
* ``/static`` - asset files for the admin UI
* ``/templates`` - server views, such as the graphic listing and the preview page

As noted, the server is mostly just a wrapper for functionality in ``/lib``. Transforms for various files are run on command, when the browser requests them, and cached until the livereload server detects that a change has been made. Caches are partitioned by extension, so editing a LESS file won't also incur a costly JS compilation.