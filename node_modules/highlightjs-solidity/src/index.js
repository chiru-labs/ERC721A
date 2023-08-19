/**
 * highlight.js Solidity syntax highlighting definition
 *
 * @see https://github.com/isagalaev/highlight.js
 *
 * @package: highlightjs-solidity
 * @author:  Sam Pospischil <sam@changegiving.com>
 * @since:   2016-07-01
 */

const solidityGrammar = require("./languages/solidity.js");
const yulGrammar = require("./languages/yul.js");

module.exports = function(hljs) {
    hljs.registerLanguage('solidity', solidityGrammar);
    hljs.registerLanguage('yul', yulGrammar);
};

module.exports.solidity = solidityGrammar;
module.exports.yul = yulGrammar;
