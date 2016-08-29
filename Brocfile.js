/*jshint node:true */
"use strict";

// Modules
var path = require('path');
var util = require('util');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var replaceFiles = require('broccoli-replace');
var SassCompiler = require('broccoli-sass');

// Helpers
function pad(str) {
  return ('0' + str).slice(-2);
}

// values
var today = new Date();
var uuid = [
  today.getFullYear(),
  pad(today.getMonth() + 1),
  pad(today.getDate()),
  require('node-uuid')()
].join('-');

var appendRevision = function(tree) {
  var indexes = new Funnel(tree, {
    include: ['index.html', '404.html'],
    getDestinationPath: function(p) {
      var dir = path.dirname(p);
      var ext = path.extname(p);
      var base = path.basename(p, ext);
      return util.format("%s/%s-%s%s", dir, base, uuid, ext);
    }
  });
  return mergeTrees([tree, indexes], { overwrite: true });
};

var sassCompiler = new SassCompiler(
  ['src/sass']
    .concat(require('bourbon-neat').includePaths)
    .concat(require('bourbon').includePaths),
  'main.scss',
  `assets/main-${uuid}.css`
);

var replaceReferences = function(tree) {
  return mergeTrees([tree, replaceFiles(tree, {
    files: ['*.html'],
    patterns: [
      { match: 'revision', replacement: uuid },
      { match: 'build_time', replacement: (new Date()).toUTCString() },
      { match: 'login_url', replacement: 'https://admin.review.two15.co/login?auto' }
    ]
  })], { overwrite: true });
};

var treePromise = Promise.resolve('public')
  .then(replaceReferences)
  .then(function(tree) {
    return mergeTrees([ tree, sassCompiler ]);
  })
  .then(appendRevision);

module.exports = {
  read: function(readTree) {
    return treePromise.then(readTree);
  },
  cleanup: function() {}
};
