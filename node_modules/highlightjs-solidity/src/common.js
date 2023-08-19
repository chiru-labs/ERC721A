/**
 * highlight.js Solidity syntax highlighting definition
 *
 * @see https://github.com/isagalaev/highlight.js
 *
 * @package: highlightjs-solidity
 * @author:  Sam Pospischil <sam@changegiving.com>
 * @since:   2016-07-01
 */

function isNegativeLookbehindAvailable() {
    try {
        new RegExp('(?<!.)');
        return true;
    } catch (_) {
        return false;
    }
}

//like a C number, except:
//1. no octal literals (leading zeroes disallowed)
//2. underscores (1 apiece) are allowed between consecutive digits
//(including hex digits)
//also, all instances of \b (word boundary) have been replaced with (?<!\$)\b
//NOTE: we use string rather than regexp in the case where negative lookbehind
//is allowed to avoid Firefox parse errors; sorry about the resulting double backslashes!
var SOL_NUMBER_RE = /-?(\b0[xX]([a-fA-F0-9]_?)*[a-fA-F0-9]|(\b[1-9](_?\d)*(\.((\d_?)*\d)?)?|\.\d(_?\d)*)([eE][-+]?\d(_?\d)*)?|\b0)(?!\w|\$)/;
if (isNegativeLookbehindAvailable()) {
    SOL_NUMBER_RE = SOL_NUMBER_RE.source.replace(/\\b/g, '(?<!\\$)\\b');
}

var SOL_NUMBER = {
    className: 'number',
    begin: SOL_NUMBER_RE,
    relevance: 0,
};

var SOL_ASSEMBLY_KEYWORDS = {
    keyword:
        'assembly ' +
        'let function ' +
        'if switch case default for leave ' +
        'break continue ' +
        'u256 ' + //not in old-style assembly, but in Yul
        //NOTE: We're counting most opcodes as builtins, but the following ones we're
        //treating as keywords because they alter control flow or halt execution
        'jump jumpi ' +
        'stop return revert selfdestruct invalid',
    built_in:
        //NOTE that push1 through push32, as well as jumpdest, are not included
        'add sub mul div sdiv mod smod exp not lt gt slt sgt eq iszero ' +
        'and or xor byte shl shr sar ' +
        'addmod mulmod signextend keccak256 ' +
        'pc pop ' +
        'dup1 dup2 dup3 dup4 dup5 dup6 dup7 dup8 dup9 dup10 dup11 dup12 dup13 dup14 dup15 dup16 ' +
        'swap1 swap2 swap3 swap4 swap5 swap6 swap7 swap8 swap9 swap10 swap11 swap12 swap13 swap14 swap15 swap16 ' +
        'mload mstore mstore8 sload sstore msize ' +
        'gas address balance selfbalance caller callvalue ' +
        'calldataload calldatasize calldatacopy codesize codecopy extcodesize extcodecopy returndatasize returndatacopy extcodehash ' +
        'create create2 call callcode delegatecall staticcall ' +
        'log0 log1 log2 log3 log4 ' +
        'chainid origin gasprice basefee blockhash coinbase timestamp number difficulty gaslimit',
    literal:
        'true false'
};

var HEX_APOS_STRING_MODE = {
    className: 'string',
    begin: /\bhex'(([0-9a-fA-F]{2}_?)*[0-9a-fA-F]{2})?'/, //please also update HEX_QUOTE_STRING_MODE
};

var HEX_QUOTE_STRING_MODE = {
    className: 'string',
    begin: /\bhex"(([0-9a-fA-F]{2}_?)*[0-9a-fA-F]{2})?"/, //please also update HEX_APOS_STRING_MODE
};

//I've set these up exactly like hljs's builtin STRING_MODEs,
//except with the optional initial "unicode" text
function solAposStringMode(hljs) {
    return hljs.inherit(
        hljs.APOS_STRING_MODE, //please also update solQuoteStringMode
        { begin: /(\bunicode)?'/ }
    );
}

function solQuoteStringMode(hljs) {
    return hljs.inherit(
        hljs.QUOTE_STRING_MODE, //please also update solAposStringMode
        { begin: /(\bunicode)?"/ }
    );
}

function baseAssembly(hljs) {
    //this function defines a "basic" assembly environment;
    //we use it several times below with hljs.inherit to provide
    //elaborations upon this basic assembly environment
    var SOL_APOS_STRING_MODE = solAposStringMode(hljs);
    var SOL_QUOTE_STRING_MODE = solQuoteStringMode(hljs);

    //in assembly, identifiers can contain periods (but may not start with them)
    var SOL_ASSEMBLY_LEXEMES_RE = /[A-Za-z_$][A-Za-z_$0-9.]*/;

    var SOL_ASSEMBLY_TITLE_MODE =
        hljs.inherit(hljs.TITLE_MODE, {
            begin: /[A-Za-z$_][0-9A-Za-z$_]*/,
            lexemes: SOL_ASSEMBLY_LEXEMES_RE,
            keywords: SOL_ASSEMBLY_KEYWORDS
        });

    var SOL_ASSEMBLY_FUNC_PARAMS = {
        className: 'params',
        begin: /\(/, end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        lexemes: SOL_ASSEMBLY_LEXEMES_RE,
        keywords: SOL_ASSEMBLY_KEYWORDS,
        contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            SOL_APOS_STRING_MODE,
            SOL_QUOTE_STRING_MODE,
            SOL_NUMBER
        ]
    };

    //note: we always put operators below comments so
    //it won't interfere with comments
    var SOL_ASSEMBLY_OPERATORS = {
        className: 'operator',
        begin: /:=|->/
    };

    return {
        keywords: SOL_ASSEMBLY_KEYWORDS,
        lexemes: SOL_ASSEMBLY_LEXEMES_RE,
        contains: [
            SOL_APOS_STRING_MODE,
            SOL_QUOTE_STRING_MODE,
            HEX_APOS_STRING_MODE,
            HEX_QUOTE_STRING_MODE,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            SOL_NUMBER,
            SOL_ASSEMBLY_OPERATORS,
            { // functions
                className: 'function',
                lexemes: SOL_ASSEMBLY_LEXEMES_RE,
                beginKeywords: 'function', end: '{', excludeEnd: true,
                contains: [
                    SOL_ASSEMBLY_TITLE_MODE,
                    SOL_ASSEMBLY_FUNC_PARAMS,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    SOL_ASSEMBLY_OPERATORS
                ],
            }
        ]
    };
}

module.exports = {
    SOL_ASSEMBLY_KEYWORDS,
    baseAssembly,
    solAposStringMode,
    solQuoteStringMode,
    HEX_APOS_STRING_MODE,
    HEX_QUOTE_STRING_MODE,
    SOL_NUMBER,
    isNegativeLookbehindAvailable
};
