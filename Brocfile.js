/*jshint node:true */
"use strict";

// Modules
var path = require('path');
var util = require('util');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var replaceFiles = require('broccoli-replace');
var SassCompiler = require('broccoli-sass');

// values
var uuid = require('node-uuid')();

var appendRevision = function(tree) {
  return new Funnel(tree, {
    getDestinationPath: function(p) {
      var dir = path.dirname(p);
      var ext = path.extname(p);
      var base = path.basename(p, ext);
      return util.format("%s/%s-%s%s", dir, base, uuid, ext);
    }
  });
};

var sassCompiler = new SassCompiler(
  ['src/sass']
    .concat(require('bourbon-neat').includePaths)
    .concat(require('bourbon').includePaths),
  'main.scss',
  'main.css'
);

var replaceReferences = function(tree) {
  return replaceFiles(tree, {
    files: ['index.html'],
    patterns: [
      { match: 'revision', replacement: uuid },
      { match: 'build_time', replacement: (new Date()).toUTCString() }
    ]
  });
};

var copyToStandardIndex = function(tree) {
  return new Funnel(tree, {
    include: ['index-' + uuid + '.html'],
    getDestinationPath: function() { return 'index.html'; }
  });
};

var treePromise = Promise.resolve('public')
  .then(replaceReferences)
  .then(function(tree) {
    return mergeTrees([ tree, sassCompiler ]);
  })
  .then(appendRevision)
  .then(function(tree) {
    return mergeTrees([tree, copyToStandardIndex(tree)]);
  });

module.exports = {
  read: function(readTree) {
    return treePromise.then(readTree);
  },
  cleanup: function() {}
};
