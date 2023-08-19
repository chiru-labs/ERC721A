pragma solidity ^0.7.0;

/**
 * - if options.compiler is undefined we won't break the ImportDirective.
 * - if options.compiler is lower than 0.7.4 we won't break the ImportDirective.
 * - if options.compiler is greater than or equal to 0.7.4 we will break the
 *   ImportDirective if the line length exceeds the printWidth.
 */
import {symbol1 as alias1, symbol2 as alias2, symbol3 as alias3, symbol4} from "File2.sol";
