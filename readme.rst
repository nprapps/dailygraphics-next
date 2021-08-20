Dailygraphics-next
==================

Tools for writing and deploying daily interactive news graphics. Based substantially on NPR's `original daily graphics rig <https://github.com/nprapps/dailygraphics>`_. Built on Express, LESS, Browserify and Google Sheets.

What does it do?
----------------

All the good stuff from the classic rig, plus:

* Live reload of JS/CSS/HTML in the preview page
* Build errors shown in the browser console, to minimize context switching
* Create and deploy graphics directly from the web UI, not just the command line
* Modern JS tooling, including Babel for new JS features and source maps for easier debugging
* Improved Sheets integration, including typecasting for numerical/boolean values

Table of contents
-----------------

  - `Quickstart`_
  - `Getting started in more detail`_
  - `Authorizing Google access`_
  - `Creating a graphic`_
  - `Preview graphic workspace`_
  - `Sheets integration`_
  - `Template creation`_
  - `Deployment`_
  - `Using the CLI`_
  - `Synchronizing large files`_
  - `Migrating from the original dailygraphics rig`_
  - `Troubleshooting`_
  - `Known issues`_


Quickstart
----------

To run this project, you'll need Node 10.0 or higher installed. On OS X and Linux, `nvm <https://github.com/creationix/nvm>`_ is a good way to install and update Node.

Once you've done that:

1. Clone this repo, and run ``npm i`` to install its dependencies.
2. Clone the `templates repo <https://github.com/nprapps/dailygraphics-templates>`_ to install a selection of premade graphic types.
3. Clone or create a folder to contain your actual graphic files (by default this is ``graphics-js``, in the same parent folder where you put the rig and template repos).

   a. If you're at NPR, we have a private ``graphics-js`` repo already created--you should clone that repo and run ``npm install`` in that folder to get our current dependencies.
   b. For non-NPR users, you should create a ``package.json`` in the graphics folder and install the common libraries there: ``npm init -y && npm install d3-array d3-axis d3-scale d3-selection d3-shape d3-svg``.

4. You should now have three sibling folders: the rig, the templates and a graphics repo. Configure ``config.json`` in the rig folder so that the paths for the graphics and template folders match the folders from steps 2 and 3.
5. Run ``npm start`` to begin running the server, and open ``localhost:8000`` in your browser to view the admin UI.

Getting started in more detail
------------------------------

Configuration for this project is split between ``config.json`` (an example of which is provided) for values that are organization-specific but not sensitive, and environment variables for values that should be confidential.

We recognize that environment variables are not perfectly secure (since installed packages have access to them from the ``process`` global), but they're also impossible to check into GitHub accidentally. You should have set:

* GOOGLE_OAUTH_CLIENT_ID
* GOOGLE_OAUTH_CONSUMER_SECRET

The Google OAuth variables should match the client ID and secret for an API app that can access your account. `This post <http://blog.apps.npr.org/2015/03/02/app-template-oauth.html>`_ has details on setting that up.

Alternatively, `service account authentication <https://developers.google.com/identity/protocols/OAuth2ServiceAccount>`_ is also supported. To create a service account and JSON key file, visit your project's `GCP web console <https://console.cloud.google.com/iam-admin/serviceaccounts>`_ to get started.

After creating the service account:

1. Grant write access on your Drive folder (``driveFolder`` in ``config.json``) to the service account email address.
2. Set GOOGLE_APPLICATION_CREDENTIALS to the file path of the JSON file containing your credentials.

If you're deploying to S3, which is the default for the rig, you'll also need to set:

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_DEFAULT_REGION

In addition to the directory that contains this app, you'll also need two other directories. One is for the templates that are used to create each graphic (in the legacy rig, these were stored in the ``dailygraphics/graphic_templates`` folder). We provide a repo of templates used at NPR `here <https://github.com/nprapps/dailygraphics-templates>`_, and you should feel free to clone it. In the ``config.json file``, the "templateRoot" value should be the path to this folder.

The other directory is for your graphics themselves, and it should be referenced with the "graphicsPath" key of your ``config.json`` file. This folder is also where you should install any libraries used by your graphics via NPM. For example, if you're using our templates, you'll want to run ``npm install d3-array d3-axis d3-scale d3-selection`` to get the most common D3 packages.

The server supports a number of command-line arguments to customize its behavior:

* ``--port XXXX`` - sets the port that the server will listen on to XXXX.
* ``--live-reload XXXX`` - sets the port for the live reload server.
* ``--force-sheet-cache`` - forces graphics preview pages to cache Google Sheets, so that you must press the "Refresh sheet" button when data is changed instead of simply reloading the page. Good for slow connections.
* ``--no-live-reload`` - Turns off live reload when files are edited.
* ``--no-websockets`` - Turns off the websocket debugging connection. Along with disabling live reload, this may be good in a hosted installation environment.
* ``--disable-headless`` - Show the Chrome window when capturing fallback images, which can help on some computers
* ``--target`` - Choose between "stage" and "live" (default of "live") for deployment to S3
* ``--deployTo`` - Override the ``deployTo`` config.json option (see [Deployment](#deployment), below)

Due to the way NPM scripts work, flags must be passed after a ``--`` separator. For example, running the rig on port 7777 would look like ``npm start -- --port 7777``.

**Terminal shortcut**

Do you use `iTerm2 <https://iterm2.com>`_ as your terminal app? `Here's a sample AppleScript <https://gist.github.com/alykat/31feba18413c8ca481d8b38547469e15>`_ to automatically launch a three-paned terminal window (one for the dailygraphics-next repo, one for the local webserver and another for the graphics repo) and pull the latest code from GitHub. You can save this locally, customize it to match your own configuration and add an alias for it to your `.bash_profile`.

``alias dgnext="osascript ~/PATH-TO-FILE/iterm_dgnext.scpt"``

Authorizing Google access
-------------------------

Similar to the original dailygraphics rig, you need to authorize this app's API access to access and create Drive files (for the spreadsheets that back each page). When the initial list page loads, it should redirect you to a Google log-in screen--just follow the instructions to complete the process. You'll need to create a Google API app, enable Drive access and store its authentication values in the ``GOOGLE_OAUTH_CLIENT_ID`` and ``GOOGLE_OAUTH_CONSUMER_SECRET`` environment variables. Your OAuth tokens are stored in your home directory as ``.google_oauth_tokens``.

To authenticate for the first time, you must run the rig on port 8000 (the default port). After you've done this step, you can run the rig on a different port.

Creating a graphic
------------------

The default view of the rig is a listing of all the graphics in your repository. However, if you're just starting out, there won't be anything in the list. Click the "new()" button in the toolbar, and select an item from the list of templates. You'll also need to provide a slug for the graphic--this will have the current date in YYYYMMDD format appended to it, to prevent collisions.

Once you click through, the rig will create a new folder and copy the template files into it. It will also make a duplicate of the template's assigned Google Sheet, for loading labels and data. Finally, it'll take you to the graphic preview page.

Preview graphic workspace
-------------------------

Each graphic is shown in a preview page, already embedded via Pym.js. The preview adds live reload support--after editing a source file, the embed will reload with your changes, so you don't need to return to the browser to refresh. The toolbar at the top provides access to simulated breakpoints, a link to the Google sheet backing the graphic and a button to refresh data from the source (because of live reload, we don't auto-refresh data). There's also a button to deploy to S3 (more on that later).

As resources are loaded, the server will process them according to their type:

* HTML - processed using `Lodash templating <https://lodash.com/docs/4.17.11#template>`_. 

  * Sheets data is available as ``COPY``, just as in the classic rig, and filter functions are available on the ``t`` utility collection (e.g., ``t.classify(row.name)`` or ``t.comma(row.value)``). 
  * You can import template partials using ``await t.include("filename.html")``, where the filename is relative to the template doing the inclusion. When templating HTML in loops, it's easier to use ``for (var item of list) { ... }`` over other methods, since these structures directly support ``await``.

* JS - transpiled with Babel to support `newer JS features <https://babeljs.io/docs/en/learn>`_ and bundled with Browserify. 
  
  * You can ``require()`` NPM modules into your scripts--they'll be loaded first from the graphic subfolder, if there's a ``node_modules`` there, and then from any modules installed in the graphics repo itself. Generally, you should use a local ``node_modules`` only in cases where your graphic requires a different library version from other graphics.
  * The rig also includes a Browserify transform to allow scripts to import text files as strings. For example, you might load the ``_list.html`` template partial via ``var listTemplate = require("./_list.html");``, where it can be used to dynamically generate content on the client. 

* CSS - compiled from LESS files, based on filename (loading ``graphics.css`` will compile and load ``graphics.less`` from disk).

Errors detected during JS or LESS compilation will be routed to the dev tools console for easy debugging if your browser supports WebSockets.

Each graphic should also have a ``manifest.json`` file in its folder, which is used to store configuration data for Sheets and deployment. The "sheets" key in that file tells the server which Google Sheet to use for loading labels and data. It will also have a snapshot of the Node modules installed when it was created--this isn't used for anything, but is meant as a helpful record when recreating graphics later.

Sheets integration
------------------

For most graphics, the Google Sheet workbook will contain a "labels" sheet (for headline and chatter text), a "metadata" sheet (which populates the copy edit e-mail on the preview page), and "data" (which actually generates the graphics). However, the rig will download any sheet it finds, unless the name starts with an underscore, like "_scratch". You can use this to hide large working sheets from the rig, preventing them from slowing down the initial preview page with data that's not directly relevant to the graphic itself. Likewise, columns that start with an underscore are ignored.

One useful data structure tip: If a Google Sheet has a "key" header, it will be exposed to the template as a key/value store, with each row assigned to the respective key. If it has "key" and "value" columns, the value column will be assigned to the lookup directly, and other columns will be ignored. This can be seen in action in the "labels" sheet. Absent these headers, the data will be an array with each item being each row.

By default, the rig automatically casts values from strings to native JS types (`true`/`false` and numbers) if possible. However, you can also manually specify a type annotation via the column name if you want to force a specific value type. To do so, set your column as `key:type` with one of the following type strings:

* Strings: "text" or "string"
* Numbers: "numeric", "float", or "number" (you can also use "int" to round the value)
* Booleans: "bool" or "boolean" (synonyms like "true", "false", "yes", "no", or empty cells are all recognized)

For example, to make sure that a "rankings" column is treated as a string of comma-separated numbers and not a single numerical value, you can rename it to "rankings:text".

Template creation
-----------------

For the most part, templates are just folders containing files that should be copied into a graphics directory. So building a template is pretty much just building a graphic, then stripping out anything that isn't generic and copying it into your template directory. The process is recursive, and will copy subfolders as well as any filenames that don't start with a dot.

You will also need to add a "templateSheet" key to your ``manifest.json`` in the template folder (for existing graphics, you can often just rename the "sheet" key). When the template is instantiated, the server will duplicate that Sheet into a new copy and add the resulting ID to the manifest for the graphic. Graphics retain the original "templateSheet" key in their manifest when instantiated from a template.

For more details on templates, visit the `templates repo <https://github.com/nprapps/dailygraphics-templates>`_.

Deployment
----------

Deployment should be as simple as configuring the bucket and path prefix in your ``config.json`` file, and then clicking the "deploy" button when previewing a particular graphic. However, understanding the mechanics of a deployment will help you debug new templates and deployment issues.

When the server runs a deployment, it loads the ``manifest.json`` file from the graphic folder and uses the "files" array as a set of `minimatch globbing patterns <https://github.com/isaacs/minimatch>`_ to figure out which source files should actually be published. Note that unlike in the browser translation layer, where requests for ``.css`` are turned into ``.less``, the files array should actually specify ``.less`` filenames (they'll be translated back to CSS during the deploy). A typical deployment "files" array may look something like this, which grabs the main files for the graphic and any images or data that's located in the folder (not including the manifest itself)::

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

In addition to publishing to S3, it's possible to simply deploy to a local folder instead. To do so, add the following items to your config.json::

    "deployTo": "local",
    "exportPath": "../exports"

With this configuration, when you press the deploy button, the rig will create a subfolder in ``../exports`` for your graphic, and write all the files from the graphic into it, including the preview page. Graphics folders created this way can be distributed via FTP, packaged in a ZIP, or synced to network storage, since they're self-contained units.

As a final convenience feature, the rig will automatically spin up a headless browser and capture a "fallback.png" image for you prior to deployment. This happens automatically and can't be disabled at this time. If you prefer hand-crafted fallback images, you may want to save them as a different filename and update the templates to point there instead.

Using the CLI
-------------

It's possible to perform all necessary tasks from the web interface, but if you want to use the command line (say, for scripting multiple deployments), the CLI interface uses the same service code as the web does. From the project root, you can run ``node cli COMMAND`` to perform a given task.

For example, ``node cli create bar_chart testgraphic`` will create a graphic from the "bar_chart" template with the name "testgraphic". ``node cli`` or ``node cli help`` will list available commands and their arguments. Currently, commands exist for creating, copying and deploying graphics, but others will be added as the rig becomes more capable.

Synchronizing large files
-------------------------

In some cases, you may have large files that you want to associate with a graphic and share across the team, but you don't want to check them into GitHub. In this case, the rig is capable of synchronizing files with S3.

Any files placed in a ``synced/`` subfolder in a graphic can be transferred to and from S3 using the CLI command ``node cli sync GRAPHIC_SLUG``. For example, you might keep Illustrator templates for a graphic in ``graphic_slug/synced/illustrator``, so that your team can recreate this graphic if anything changes. You should probably exclude these from source control by adding ``*/synced`` to your ``.gitignore`` file. 

Synchronized files are first compared on size, and then by date. If the sizes don't match, the newer file will be transferred to or from S3. Missing files on either side will also be reconciled. We do not currently support marking something for deletion--once it has been synchronized, it's painful to get rid of things, so be careful. If a file has changed but the size is the same, our comparison code will "see" it as the same on both sides, so in rare cases you may need to add or remove placeholder data from a file to make the system realize that it has changed.

If you know that you want to transfer files one way, and you do not want to auto-resolve (for example, if all files should be uploaded but their size is the same as the remote version), you can use ``--push`` or ``--pull`` to force the sync operation to upload or download files, respectively.

Migrating from the original dailygraphics rig
---------------------------------------------

When moving graphics and templates over from the classic rig, there are three changes you'll need to make:

* Add a ``manifest.json`` with the sheet/template sheet (formerly defined as ``COPY_GOOGLE_DOC_KEY`` in ``graphic_config.py``)
* Copy your child template into a ``_content.html`` file, which is (by default) loaded in the base template's ``index.html``.
* Convert the Jinja2 templating to EJS templates. This is usually pretty straightforward translation of tags:

    - ``{{ key }}`` becomes ``<%= key %>``
    - ``{% if condition %} ... {% endif %}`` becomes ``<% if (condition) { %> ... <% } %>``
    - ``{% for item in list %} ... {% endfor %}`` becomes ``<% list.forEach(item => { %> ... <% }) %>``

* Load scripts using Browserify instead of the ``JS.include`` template helpers:

    - Create a normal script tag that points toward the "base" script, which will load the others. This is usually ``graphic.js``.
    - For scripts that load onto the global object, you can just require their relative path, such as ``require("./lib/pym.js")``
    - Scripts that are module-aware can be imported to a variable, such as ``var d3 = require("./lib/d3.min")``
    - Scripts that relied on global scope, such as ``helpers.js``, will need their functions assigned to the window object (e.g., ``var classify = window.classify = ...``).

Since most classic dailygraphics already bundled their own JS libraries, you shouldn't need to worry about NPM for these.

Troubleshooting
---------------

*My chart doesn't appear, and I see an error like "ERROR:  Cannot find module 'd3-axis' from 'graphics-js/lots-of-dots-20181130'"*

This usually means your graphic requires a library that you don't have installed. In the case above, we're missing ``d3-axis``. To fix it, open a terminal in the graphics folder and install the module from NPM (e.g., ``npm install d3-axis``).

*I updated the rig, and now it's complaining that it can't find a module when it starts up*

Oops! Looks like we added a dependency, and didn't let you know about it. Run ``npm i`` in the ``dailygraphics-next`` directory to install whatever was missing.

*When I try to start the rig, it complains about "EMFILE: too many open files"*

This is a problem that can occur on OS X due to the way it handles watching files. Update to the latest version of the rig and run an ``npm install``, or ``npm i fsevents`` to install a helper module if you're unable to update.

Development
-----------

A README with more in-depth documentation of how the application is structured is available in ``/server``. When working on the application, it's recommended to launch with ``npm run dev``, which will automatically restart the server whenever a change is made to its code.

Known issues
------------

* There's currently a fair amount of missing feedback when errors occur, such as if you don't have Google API access authorized yet. We're working on it.
* There's no current support for falling back to the base template's "index.html" if one doesn't exist in the current graphic, which would be useful for implementing large-scale changes to graphics, but it does make individual graphics a bit more robust.
