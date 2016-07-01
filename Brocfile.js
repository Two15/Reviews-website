var SassCompiler = require('broccoli-sass');
var mergeTrees = require('broccoli-merge-trees');

var sassCompiler = new SassCompiler(['src/sass'], 'main.scss', 'main.css');

module.exports = mergeTrees(['public', sassCompiler]);
