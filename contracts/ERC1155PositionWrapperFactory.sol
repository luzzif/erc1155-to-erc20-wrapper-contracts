pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IERC1155PositionWrapper.sol";

/**
 * @title ERC1155PositionWrapperFactory
 * @dev ERC1155PositionWrapperFactory contract
 * @author Federico Luzzi - <fedeluzzi00@gmail.com>
 * SPDX-License-Identifier: GPL-3.0
 */
contract ERC1155PositionWrapperFactory {
    address public erc1155Address;
    address public implementation;
    mapping(uint256 => bool) public positionWrapped;

    event WrapperCreated(uint256 positionId, address wrapperAddress);

    constructor(address _implementation, address _erc1155Address) {
        erc1155Address = _erc1155Address;
        implementation = _implementation;
    }

    function createWrapper(
        string calldata _name,
        string calldata _symbol,
        uint256 _positionId
    ) external {
        IERC1155PositionWrapper _wrapperProxy =
            IERC1155PositionWrapper(
                Clones.cloneDeterministic(
                    implementation,
                    keccak256(abi.encodePacked(_positionId))
                )
            );
        _wrapperProxy.initialize(_name, _symbol, erc1155Address, _positionId);
        positionWrapped[_positionId] = true;
        emit WrapperCreated(_positionId, address(_wrapperProxy));
    }
}
