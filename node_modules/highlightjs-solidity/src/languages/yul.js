/**
 * highlight.js Solidity syntax highlighting definition
 *
 * @see https://github.com/isagalaev/highlight.js
 *
 * @package: highlightjs-solidity
 * @author:  Sam Pospischil <sam@changegiving.com>
 * @since:   2016-07-01
 */

const {
    SOL_ASSEMBLY_KEYWORDS,
    baseAssembly,
    isNegativeLookbehindAvailable
} = require("../common.js");

function hljsDefineYul(hljs) {

    var YUL_KEYWORDS = {
        keyword: SOL_ASSEMBLY_KEYWORDS.keyword + ' ' +
            'object code data',
        built_in: SOL_ASSEMBLY_KEYWORDS.built_in + ' ' +
            'datasize dataoffset datacopy ' +
            'setimmutable loadimmutable ' +
            'linkersymbol memoryguard',
        literal: SOL_ASSEMBLY_KEYWORDS.literal
    };

    var YUL_VERBATIM_RE = /\bverbatim_[1-9]?[0-9]i_[1-9]?[0-9]o\b(?!\$)/;
    if (isNegativeLookbehindAvailable()) {
        //replace just first \b
        YUL_VERBATIM_RE = YUL_VERBATIM_RE.source.replace(/\\b/, '(?<!\\$)\\b');
    }

    //highlights the "verbatim" builtin. making a separate mode for this due to
    //its variability.
    var YUL_VERBATIM_MODE = {
        className: "built_in",
        begin: YUL_VERBATIM_RE
    };

    var BASE_ASSEMBLY_ENVIRONMENT = baseAssembly(hljs);

    return hljs.inherit(
        BASE_ASSEMBLY_ENVIRONMENT,
        {
            keywords: YUL_KEYWORDS,
            contains: BASE_ASSEMBLY_ENVIRONMENT.contains.concat([
                YUL_VERBATIM_MODE
            ])
        }
    );
}

module.exports = hljsDefineYul;
