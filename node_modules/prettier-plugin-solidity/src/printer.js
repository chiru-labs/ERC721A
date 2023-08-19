const prettier = require('prettier');
const semver = require('semver');
const nodes = require('./nodes');
const { hasNodeIgnoreComment } = require('./prettier-comments/common/util');
const ignoreComments = require('./comments/ignore');

let checked = false;

function prettierVersionCheck() {
  if (checked) return;
  if (!semver.satisfies(prettier.version, '>=2.3.0')) {
    throw new Error(
      'The version of prettier in your node-modules does not satisfy the required ">=2.3.0" constraint. Please update the version of Prettier.'
    );
  }
  checked = true;
}

function genericPrint(path, options, print) {
  prettierVersionCheck();

  const node = path.getValue();
  if (node === null) {
    return '';
  }

  if (!(node.type in nodes)) {
    throw new Error(`Unknown type: ${JSON.stringify(node.type)}`);
  }

  if (hasNodeIgnoreComment(node)) {
    ignoreComments(path);

    return options.originalText.slice(
      options.locStart(node),
      options.locEnd(node) + 1
    );
  }

  return nodes[node.type].print({ node, options, path, print });
}

module.exports = genericPrint;
