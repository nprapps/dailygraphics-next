/*

Implements the logic for synchronizing a `/synced` folder inside a given graphic

Currently only available via the CLI

*/

var path = require("path");
var fs = require("fs").promises;

var s3 = require("./s3");
var expand = require("./expandMatch");

var ls = async function(dir) {
  var stats = [];
  try {
    var matching = await expand(dir, ".", ["*"]);
    // add modification time and size
    for (var m of matching) {
      var s = await fs.stat(m.full);
      stats.push({
        // handle Windows paths
        file: m.relative.replace(/\\/g, "/"),
        size: s.size,
        mtime: s.mtime
      });
    }
  } catch (err) {
    // on file failure, return whatever was left
    console.log(`Failed to read some files during sync`);
    console.error(err.message);
  }
  
  return stats;
}

module.exports = async function(config, slug) {
  var { prefix, bucket } = config.deployment;
  var remotePath = path.posix.join(prefix, slug, "synced");
  var localPath = path.join(config.root, slug, "synced");

  var remoteFiles = await s3.ls(bucket, remotePath);
  var localFiles = await ls(localPath);

  var downloads = [];
  var uploads = [];

  // override if the push/pull flags are set
  if (config.argv.push || config.argv.pull) {
    if (config.argv.push) {
      uploads = localFiles;
    } else {
      downloads = remoteFiles;
    }
  } else {
    // create lists to upload/download
    // default to all files that only exist in one place
    downloads = remoteFiles.filter(r => localFiles.every(l => l.file != r.file));
    uploads = localFiles.filter(l => remoteFiles.every(r => r.file != l.file));

    // find files that are in both, and assign to one category or another
    var common = remoteFiles.filter(r => localFiles.find(l => l.file == r.file));
    common.forEach(function(remote) {
      var local = localFiles.find(l => l.file == remote.file);
      // check size first
      if (local.size == remote.size) return;
      // if they're different, sync the newer file across
      if (local.mtime > remote.mtime) {
        uploads.push(local);
      } else {
        downloads.push(remote);
      }
    });
  }

  if (!downloads.length && !uploads.length) {
    return console.log("No files needing sync");
  }

  // process downloads
  var downloadFile = async function(download) {
    var buffer = await s3.download(bucket, download.key);
    var location = path.join(localPath, download.file);
    var dirname = path.dirname(location);
    await fs.mkdir(dirname, { recursive: true });
    await fs.writeFile(path.join(localPath, download.file), buffer);
  };

  // batch the files
  for (var i = 0; i < downloads.length; i += 10) {
    var slice = downloads.slice(i, i + 10);
    await Promise.all(slice.map(downloadFile));
  }

  // process uploads
  var uploadFile = async function(upload) {
    var buffer = await fs.readFile(path.join(localPath, upload.file));
    await s3.upload(bucket, path.posix.join(remotePath, upload.file), buffer);
  }

  for (var i = 0; i < uploads.length; i += 10) {
    var slice = uploads.slice(i, i + 10);
    await Promise.all(slice.map(uploadFile));
  }
}