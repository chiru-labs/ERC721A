const AssemblyMemberAccess = {
  print: ({ path, print }) => [
    path.call(print, 'expression'),
    '.',
    path.call(print, 'memberName')
  ]
};

module.exports = AssemblyMemberAccess;
