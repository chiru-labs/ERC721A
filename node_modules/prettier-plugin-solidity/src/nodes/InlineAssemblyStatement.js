// @TODO: add support for assembly language specifier
const InlineAssemblyStatement = {
  print: ({ path, print }) => ['assembly ', path.call(print, 'body')]
};
module.exports = InlineAssemblyStatement;
