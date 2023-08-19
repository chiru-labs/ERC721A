const {
  doc: {
    builders: { join, line }
  }
} = require('prettier');

const printComments = (node, path, options, filter = () => true) =>
  node.comments
    ? join(
        line,
        path
          .map((commentPath) => {
            const comment = commentPath.getValue();
            if (comment.trailing || comment.leading || comment.printed) {
              return null;
            }
            if (!filter(comment)) {
              return null;
            }
            comment.printed = true;
            return options.printer.printComment(commentPath);
          }, 'comments')
          .filter(Boolean)
      )
    : '';

module.exports = printComments;
