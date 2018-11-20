DailyGraphics-next
==================

Tools for writing and deploying daily interactive news graphics. Based substantially on NPR's `original daily graphics rig <https://github.com/nprapps/dailygraphics>`_. Built on Express, LESS, Browserify, and Google Sheets.

Getting started
---------------

To run this project, you'll need Node 8.0 or higher installed. On OS X and Linux, `nvm <https://github.com/creationix/nvm>`_ is a good way to install and update Node. Clone this repo, and run ``npm i`` to install its dependencies.

Configuration for this project is split between ``config.json`` (an example of which is provided) for values that are organization-specific but not sensitive, and environment variables for values that should be confidential. 

We recognize that environment variables are not perfectly secure (since installed packages have access to them from the ``process`` global), but they're also impossible to check into GitHub accidentally. You should have set:

* GOOGLE_OAUTH_CLIENT_ID
* GOOGLE_OAUTH_CONSUMER_SECRET
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_DEFAULT_REGION

In addition to the directory that contains this app, you'll also need two other directories: one for graphic templates, and the other for the actual daily work product. The paths to these from the ``dailygraphics-next`` repo should be set in your ``config.json`` file as ``templatePath`` and ``graphicsPath``, respectively. We provide a repo of templates used at NPR `here <https://github.com/nprapps/templates-next>`_.

To start the web UI, run ``npm start`` to kick off the server, and visit ``localhost:8000`` in your browser.

Authorizing Google access
-------------------------

Similar to the original dailygraphics rig, you need to authorize this app's API access to access and create Drive files (for the spreadsheets that back each page). Visit ``localhost:8000/authorize`` to start the process--it will route you to a Google sign-in page, then back to the app if it was successful.

Creating a graphic
------------------

The default view of the rig is a listing of all the graphics in your repository. However, if you're just starting out, there won't be anything in the list. Click the "new()" button in the toolbar, and select an item from the list of templates. You'll also need to provide a slug for the graphic--this will have the current date in YYYYMMDD format appended to it, to prevent collisions.

Once you click through, the rig will create a new folder and copy the template files into it. It will also make a duplicate of the template's assigned Google Sheet, for loading labels and data. Finally, it'll take you to the graphic preview page.

Preview graphic workspace
-------------------------

Each graphic is shown in a preview page, already embedded via Pym.js. The preview adds live reload support--after editing a source file, the embed will reload with your changes, so you don't need to return to the browser to refresh. The toolbar at the top provides access to simulated breakpoints, a link to the Google sheet backing the graphic and a button to refresh data from the source (because of live reload, we don't auto-refresh data). There's also a button to deploy to S3 (more on that later).

HTML files are processed using EJS, with sheets data available as the ``COPY`` variable. JavaScript files will be compiled with Browserify and Babel, allowing you to ``require()`` or ``import`` files from NPM if they were installed to the graphics repo. Any CSS file requested from the page will actually load a corresponding LESS file from the folder.

Template creation
-----------------

TK

Deployment
----------

TK

Migrating from the original dailygraphics rig
---------------------------------------------

TK

Known issues
------------

* Graphics currently share dependencies via ``node_modules``. Browserify supports resolving modules from multiple locations, so it should be possible to have a local ``node_modules`` for each template, but this isn't yet enabled.
* There's currently a lot of missing feedback when errors occur, such as if you don't have Google API access authorized yet. We're working on it.