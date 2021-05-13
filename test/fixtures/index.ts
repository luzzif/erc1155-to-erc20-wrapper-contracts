import {
    ERC1155PositionWrapper,
    ERC1155PositionWrapperFactory,
    ERC1155PresetMinterPauser,
    ERC1155PresetMinterPauser__factory,
    ERC1155PositionWrapperFactory__factory,
    ERC1155PositionWrapper__factory,
} from "../../typechain";
import { Wallet } from "ethers";
import { MockProvider } from "ethereum-waffle";
import { ethers } from "hardhat";

export const fixture = async (_: Wallet[], provider: MockProvider) => {
    const [account] = provider.getWallets();
    const wrapperFactory = (await ethers.getContractFactory(
        "ERC1155PositionWrapper"
    )) as ERC1155PositionWrapper__factory;
    const wrapper = (await wrapperFactory.deploy()) as ERC1155PositionWrapper;

    const erc1155Factory = (await ethers.getContractFactory(
        "ERC1155PresetMinterPauser"
    )) as ERC1155PresetMinterPauser__factory;
    const erc1155 = (await erc1155Factory.deploy(
        ""
    )) as ERC1155PresetMinterPauser;

    const wrapperFactoryFactory = (await ethers.getContractFactory(
        "ERC1155PositionWrapperFactory"
    )) as ERC1155PositionWrapperFactory__factory;
    const factory = (await wrapperFactoryFactory.deploy(
        wrapper.address,
        erc1155.address
    )) as ERC1155PositionWrapperFactory;

    return { wrapperFactory: factory, wrapper, erc1155, account };
};
