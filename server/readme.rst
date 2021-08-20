Dailygraphics server
====================

This directory contains the web GUI for the rig. It's is written on top of Express, and its code is organized as follows:

* ``/handlers`` - middleware callback functions that get registered to URL routes
* ``/services`` - modules made available via ``app.get()`` application-wide
* ``/static`` - asset files for the admin UI
* ``/templates`` - admin UI views, such as the graphic listing and the preview page

There are additional README files in each directory providing details for the code inside.

As far as graphics are concerned, the server is mostly just a wrapper for functionality in ``/lib``. Transforms for various files are run on command, when the browser requests them, and cached until the livereload server detects that a change has been made. Caches are partitioned by extension, so editing a LESS file won't also incur a costly JS compilation.