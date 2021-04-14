// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./interfaces/IERC1155Wrapper.sol";
import "hardhat/console.sol";

contract ERC1155WrapperFactory is UpgradeableBeacon {
    address public conditionalTokensAddress;

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
        address _wrapperProxyAddress;
        bytes memory _creationBytecode =
            abi.encodePacked(
                type(BeaconProxy).creationCode,
                abi.encode(address(this), bytes(""))
            );
        bytes32 _salt = keccak256(abi.encodePacked(_positionId));
        assembly {
            _wrapperProxyAddress := create2(
                0,
                add(_creationBytecode, 0x20),
                mload(_creationBytecode),
                _salt
            )
        }
        require(
            _wrapperProxyAddress != address(0),
            "ERC1155WrapperFactory: could not deploy wrapper"
        );
        IERC1155Wrapper(_wrapperProxyAddress).initialize(
            _name,
            _symbol,
            conditionalTokensAddress,
            _positionId
        );
        emit WrapperCreated(_wrapperProxyAddress);
    }
}
