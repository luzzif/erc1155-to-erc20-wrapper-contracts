// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ERC1155WrapperFactory is UpgradeableBeacon {
    address public conditionalTokensAddress;
    mapping(uint256 => address) public wrapperForPosition;

    event WrapperCreated(address wrapperAddress);

    constructor(address _implementation, address _conditionalTokens)
        UpgradeableBeacon(_implementation)
    {
        conditionalTokensAddress = _conditionalTokens;
    }

    function createWrapper(
        string calldata _name,
        string calldata _symbol,
        uint256 _positionId
    ) external {
        address _wrapperProxyAddress =
            address(
                new BeaconProxy(
                    address(this),
                    abi.encodeWithSignature(
                        "initialize(string,string,address,uint256)",
                        _name,
                        _symbol,
                        conditionalTokensAddress,
                        _positionId
                    )
                )
            );
        wrapperForPosition[_positionId] = _wrapperProxyAddress;
        emit WrapperCreated(_wrapperProxyAddress);
    }
}
