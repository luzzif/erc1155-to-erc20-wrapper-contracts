pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title ERC1155PositionWrapper
 * @dev ERC1155PositionWrapper contract
 * @author Federico Luzzi - <fedeluzzi00@gmail.com>
 * SPDX-License-Identifier: GPL-3.0
 *
 * Error messages:
 *   EW01: the contract is already initialized.
 *   EW02: the received tokens are not sent by the supported ERC1155 instance, forbidden.
 *   EW03: the received tokens do not have the right position id to be wrapped.
 *   EW04: the user tried to withdraw/unwrap more tokens than what they hold.
 */
contract ERC1155PositionWrapper is
    ERC20Upgradeable,
    IERC1155ReceiverUpgradeable
{
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
    ) external initializer {
        require(!initialized, "EW01");
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
        address, // not needed
        address _from,
        uint256 _id,
        uint256 _amount,
        bytes calldata // not needed
    ) external override returns (bytes4) {
        require(msg.sender == wrappedERC1155Address, "EW02");
        require(_id == positionId, "EW03");
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
        require(balanceOf(msg.sender) >= _amount, "EW04");
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
