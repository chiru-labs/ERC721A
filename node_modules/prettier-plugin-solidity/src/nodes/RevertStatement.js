const RevertStatement = {
  print: ({ path, print }) => ['revert ', path.call(print, 'revertCall'), ';']
};

module.exports = RevertStatement;
