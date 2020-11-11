var path = require("path");
var fs = require("fs").promises;

var s3 = require("./s3");
var expand = require("./expandMatch");

var ls = async function(dir) {
  var matching = await expand(dir, ".", ["*"]);
  // add modification time and size
  var stats = [];
  for (var m of matching) {
    var s = await fs.stat(m.full);
    stats.push({
      // handle Windows paths
      file: m.relative.replace(/\\/g, "/"),
      size: s.size,
      mtime: s.mtime
    });
  }
  return stats;
}

module.exports = async function(config, slug) {
  var { prefix, bucket } = config.deployment;
  var remotePath = path.posix.join(prefix, slug, "synced");
  var localPath = path.join(config.root, slug, "synced");

  var remoteFiles = await s3.ls(bucket, remotePath);
  var localFiles = await ls(localPath);

  // create lists to upload/download
  // default to all files that only exist in one place
  var downloads = remoteFiles.filter(r => localFiles.every(l => l.file != r.file));
  var uploads = localFiles.filter(l => remoteFiles.every(r => r.file != l.file));

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

  if (!downloads.length && !uploads.length) {
    return console.log("No files needing sync");
  }

  // process downloads
  for (var download of downloads) {
    console.log(`Sync (down): ${path.join(slug, "synced", download.file)}`);
    var buffer = await s3.download(bucket, download.key);
    await fs.writeFile(path.join(localPath, download.file), buffer);
  }

  // process uploads
  for (var upload of uploads) {
    console.log(`Sync (up): ${path.join(slug, "synced", upload.file)}`)
    var buffer = await fs.readFile(path.join(localPath, upload.file));
    await s3.upload(bucket, path.posix.join(remotePath, upload.file), buffer);
  }
}