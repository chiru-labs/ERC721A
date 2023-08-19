const IndexRangeAccess = {
  print: ({ node, path, print }) => [
    path.call(print, 'base'),
    '[',
    node.indexStart ? path.call(print, 'indexStart') : '',
    ':',
    node.indexEnd ? path.call(print, 'indexEnd') : '',
    ']'
  ]
};

module.exports = IndexRangeAccess;
