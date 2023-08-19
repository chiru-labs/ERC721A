function ignoreComments(path) {
  const node = path.getValue();
  // We ignore anything that is not an object
  if (node === null || typeof node !== 'object') return;

  const keys = Object.keys(node);
  keys.forEach((key) => {
    switch (key) {
      // We ignore `loc` and `range` since these are added by the parser
      case 'loc':
      case 'range':
        break;
      // The key `comments` will contain every comment for this node
      case 'comments':
        path.each((commentPath) => {
          const comment = commentPath.getValue();
          comment.printed = true;
        }, 'comments');
        break;
      default:
        // If the value for that key is an Array or an Object we go deeper.
        if (typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            path.each(ignoreComments, key);
            return;
          }
          path.call(ignoreComments, key);
        }
    }
  });
}

module.exports = ignoreComments;
