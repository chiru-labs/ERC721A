contract Issue564 {
    function isAuthorized(
        bytes32 serviceId,
        address client
    ) external view override returns (bool) {
        WhitelistStatus storage whitelistStatus = serviceIdToClientToWhitelistStatus[serviceId][client];
        return true;
    }
}
