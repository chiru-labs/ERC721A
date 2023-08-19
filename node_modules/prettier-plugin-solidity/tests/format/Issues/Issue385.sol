contract Issue385 {
  function emptyTryCatch() {
            try
                IService(_THIS_SERVICE).server().assign{value: msg.value}(
                    taskReceipt
                )
             {} catch Error(string memory error) {
                error.revertWithInfo("BService.delegatecall.assign:");
            } catch {
                revert("BService.delegatecall.assign:undefined");
            }
  }
}
