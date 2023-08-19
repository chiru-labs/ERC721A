/**
 *  This is logic to instrument ternary conditional assignment statements. Preserving
 *  here for the time being, because instrumentation of these became impossible in
 *  solc >= 0.5.0
 */

function instrumentAssignmentExpression(contract, expression) {

  // This is suspended for 0.5.0 which tries to accomodate the new `emit` keyword.
  // Solc is not allowing us to use the construction `emit SomeEvent()` within the parens :/
  return;
  // --------------------------------------------------------------------------------------------

  // The only time we instrument an assignment expression is if there's a conditional expression on
  // the right
  /*if (expression.right.type === 'ConditionalExpression') {
    if (expression.left.type === 'DeclarativeExpression' || expression.left.type === 'Identifier') {
      // Then we need to go from bytes32 varname = (conditional expression)
      // to             bytes32 varname; (,varname) = (conditional expression)
      createOrAppendInjectionPoint(contract, expression.left.range[1], {
        type: 'literal', string: '; (,' + expression.left.name + ')',
      });
      instrumenter.instrumentConditionalExpression(contract, expression.right);
    } else if (expression.left.type === 'MemberExpression') {
      createOrAppendInjectionPoint(contract, expression.left.range[0], {
        type: 'literal', string: '(,',
      });
      createOrAppendInjectionPoint(contract, expression.left.range[1], {
        type: 'literal', string: ')',
      });
      instrumenter.instrumentConditionalExpression(contract, expression.right);
    } else {
      const err = 'Error instrumenting assignment expression @ solidity-coverage/lib/instrumenter.js';
      console.log(err, contract, expression.left);
      process.exit();
    }
  }*/
};

function instrumentConditionalExpression(contract, expression) {
  // ----------------------------------------------------------------------------------------------
  // This is suspended for 0.5.0 which tries to accomodate the new `emit` keyword.
  // Solc is not allowing us to use the construction `emit SomeEvent()` within the parens :/
  // Very sad, this is the coolest thing in here.
  return;
  // ----------------------------------------------------------------------------------------------

  /*contract.branchId += 1;

  const startline = (contract.instrumented.slice(0, expression.range[0]).match(/\n/g) || []).length + 1;
  const startcol = expression.range[0] - contract.instrumented.slice(0, expression.range[0]).lastIndexOf('\n') - 1;
  const consequentStartCol = startcol + (contract, expression.trueBody.range[0] - expression.range[0]);
  const consequentEndCol = consequentStartCol + (contract, expression.trueBody.range[1] - expression.trueBody.range[0]);
  const alternateStartCol = startcol + (contract, expression.falseBody.range[0] - expression.range[0]);
  const alternateEndCol = alternateStartCol + (contract, expression.falseBody.range[1] - expression.falseBody.range[0]);
  // NB locations for conditional branches in istanbul are length 1 and associated with the : and ?.
  contract.branchMap[contract.branchId] = {
    line: startline,
    type: 'cond-expr',
    locations: [{
      start: {
        line: startline, column: consequentStartCol,
      },
      end: {
        line: startline, column: consequentEndCol,
      },
    }, {
      start: {
        line: startline, column: alternateStartCol,
      },
      end: {
        line: startline, column: alternateEndCol,
      },
    }],
  };
  // Right, this could be being used just by itself or as an assignment. In the case of the latter, because
  // the comma operator doesn't exist, we're going to have to get funky.
  // if we're on a line by ourselves, this is easier
  //
  // Now if we've got to wrap the expression it's being set equal to, do that...


  // Wrap the consequent
  createOrAppendInjectionPoint(contract, expression.trueBody.range[0], {
    type: 'openParen',
  });
  createOrAppendInjectionPoint(contract, expression.trueBody.range[0], {
    type: 'callBranchEvent', comma: true, branchId: contract.branchId, locationIdx: 0,
  });
  createOrAppendInjectionPoint(contract, expression.trueBody.range[1], {
    type: 'closeParen',
  });

  // Wrap the alternate
  createOrAppendInjectionPoint(contract, expression.falseBody.range[0], {
    type: 'openParen',
  });
  createOrAppendInjectionPoint(contract, expression.falseBody.range[0], {
    type: 'callBranchEvent', comma: true, branchId: contract.branchId, locationIdx: 1,
  });
  createOrAppendInjectionPoint(contract, expression.falseBody.range[1], {
    type: 'closeParen',
  });*/
};

// Paren / Literal injectors
/*

injector.openParen = function injectOpenParen(contract, fileName, injectionPoint, injection) {
  contract.instrumented = contract.instrumented.slice(0, injectionPoint) + '(' + contract.instrumented.slice(injectionPoint);
};

injector.closeParen = function injectCloseParen(contract, fileName, injectionPoint, injection) {
  contract.instrumented = contract.instrumented.slice(0, injectionPoint) + ')' + contract.instrumented.slice(injectionPoint);
};

injector.literal = function injectLiteral(contract, fileName, injectionPoint, injection) {
  contract.instrumented = contract.instrumented.slice(0, injectionPoint) + injection.string + contract.instrumented.slice(injectionPoint);
};

*/