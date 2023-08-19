contract Issue289 {
  function f() {
	address[] storage proposalValidators
 = ethProposals[_blockNumber][_proposalId].proposalValidators;
  }
}
