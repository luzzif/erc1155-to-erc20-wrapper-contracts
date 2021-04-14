// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

contract ERC1155Wrapper is ERC20Upgradeable, IERC1155ReceiverUpgradeable {
    bool private initialized;
    uint256 public positionId;
    address public wrappedERC1155Address;

    event Initialized(
        string name,
        string symbol,
        address wrappedERC1155Address,
        uint256 positionId
    );
    event Deposited(address account, uint256 amount);
    event Withdrawn(address account, uint256 amount);

    function initialize(
        string calldata _name,
        string calldata _symbol,
        address _wrappedERC1155Address,
        uint256 _positionId
    ) external {
        require(!initialized, "ERC1155Wrapper: already initialized");
        __ERC20_init(_name, _symbol);
        positionId = _positionId;
        wrappedERC1155Address = _wrappedERC1155Address;
        initialized = true;
        emit Initialized(_name, _symbol, _wrappedERC1155Address, _positionId);
    }

    function supportsInterface(bytes4 interfaceId)
        external
        pure
        override
        returns (bool)
    {
        return interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId;
    }

    function onERC1155Received(
        address,
        address _from,
        uint256 _id,
        uint256 _amount,
        bytes calldata
    ) external override returns (bytes4) {
        require(
            msg.sender == wrappedERC1155Address,
            "ERC1155Wrapper: forbidden"
        );
        require(_id == positionId, "ERC1155Wrapper: wrong position id");
        _mint(_from, _amount);
        emit Deposited(_from, _amount);
        return bytes4(0xf23a6e61);
    }

    // no batch wrapping is allowed
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return bytes4("");
    }

    function withdraw(uint256 _amount) external {
        require(
            balanceOf(msg.sender) >= _amount,
            "ERC1155Wrapper: not enough balance"
        );
        _burn(msg.sender, _amount);
        IERC1155Upgradeable(wrappedERC1155Address).safeTransferFrom(
            address(this),
            msg.sender,
            positionId,
            _amount,
            bytes("")
        );
        emit Withdrawn(msg.sender, _amount);
    }
}
