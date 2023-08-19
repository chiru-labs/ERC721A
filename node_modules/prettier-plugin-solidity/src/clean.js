// eslint-disable-next-line no-unused-vars
function clean(ast, newObj, parent) {
  ['code', 'codeStart', 'loc', 'range', 'raw'].forEach((name) => {
    delete newObj[name]; // eslint-disable-line no-param-reassign
  });
}

module.exports = clean;
