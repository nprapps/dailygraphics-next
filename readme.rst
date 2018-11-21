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

As resources are loaded, the server will process them according to their type:

* HTML - processed using `Lodash templating <https://lodash.com/docs/4.17.11#template>`_. Sheets data is available as ``COPY``, just as in the classic rig.
* JS - transpiled with Babel to support `newer JS features <https://babeljs.io/docs/en/learn>`_ and bundled with Browserify. You can ``require()`` NPM modules into your scripts--they'll be loaded first from the graphic subfolder, if there's a ``node_modules`` there, and then from any modules installed in the graphics repo itself. Generally, you should use a local ``node_modules`` only in cases where your graphic requires a different library version from other graphics.
* CSS - compiled from LESS files, based on filename (loading ``graphics.css`` will compile and load ``graphics.less`` from disk).

Each graphic should also have a ``manifest.json`` file in its folder, which is used to store configuration data for Sheets and deployment. The "sheets" key in that file tells the server which Google Sheet to use for loading labels and data.

Template creation
-----------------

For the most part, templates are just folders containing files that should be copied into a graphics directory. So building a template is pretty much just building a graphic, then stripping out anything that isn't generic and copying it into your template directory. The process is recursive, and will copy subfolders as well as any filenames that don't start with a dot. 

If your template uses NPM libraries that aren't globally installed in your graphics repo, run ``npm init -y`` in its folder to create a package.json file, then install the desired versions--for example, if an older graphic uses D3 v3 and doesn't already include the dependency, you could ``npm install d3@3`` to create a local ``node_modules`` just for graphic.

You will also need to add a "templateSheet" key to your ``manifest.json`` in the template folder (for existing graphics, you can often just rename the "sheet" key). When the template is instantiated, the server will duplicate that Sheet into a new copy and add the resulting ID to the manifest for the graphic.

Deployment
----------

Deployment should be as simple as configuring the bucket and path prefix in your ``config.json`` file, and then clicking the "deploy" button when previewing a particular graphic. However, understanding the mechanics of a deployment will help you debug new templates and deployment issues.

When the server runs a deployemnt, it loads the ``manifest.json`` file from the graphic folder and uses the "files" array as a set of `minimatch globbing patterns <https://github.com/isaacs/minimatch>`_ to figure out which source files should actually be published. Note that unlike in the browser translation layer, where requests for ``.css`` are turned into ``.less``, the files array should actually specify ``.less`` filenames (they'll be translated back to CSS during the deploy). A typical deployment "files" array may look something like this, which grabs the main files for the graphic and any images or data that's located in the folder (not including the manifest itself):

    "files": [
      "index.html",
      "graphic.less",
      "graphic.js",
      "*.json",
      "*.csv",
      "*.geojson",
      "*.jpg",
      "*.png",
      "!manifest.json"
    ]

These files are run through the same translation steps as when they're sent to the browser, then uploaded to S3. Your ``config.json`` should specify an "s3" object with a bucket, as well as a "prefix" that will be added at the front of the graphics slug. For example, if your bucket and prefix are set to "apps.npr.org" and "dailygraphics/graphics", respectively, a graphic with a slug of "bar-chart-20190101" would be uploaded to ``s3://apps.npr.org/dailygraphics/graphics/bar-chart-20190101``.

Using the CLI
-------------

TK

Migrating from the original dailygraphics rig
---------------------------------------------

TK

Known issues
------------

* There's currently a fair amount of missing feedback when errors occur, such as if you don't have Google API access authorized yet. We're working on it.
* 