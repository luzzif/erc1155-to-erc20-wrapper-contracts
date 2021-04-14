const { expect, use: chaiUse } = require("chai");
const { ethers } = require("hardhat");
const { getExpectedWrapperAddress } = require("./utils");

chaiUse(require("ethereum-waffle").solidity);

describe("Factory", () => {
    let wrapperFactoryInstance, wrapperInstance, erc1155Instance;

    beforeEach(async () => {
        const ERC1155Wrapper = await ethers.getContractFactory(
            "ERC1155Wrapper"
        );
        wrapperInstance = await ERC1155Wrapper.deploy();
        await wrapperInstance.deployed();

        const ERC1155 = await ethers.getContractFactory(
            "ERC1155PresetMinterPauser"
        );
        erc1155Instance = await ERC1155.deploy("");
        await erc1155Instance.deployed();

        const ERC1155WrapperFactory = await ethers.getContractFactory(
            "ERC1155WrapperFactory"
        );
        wrapperFactoryInstance = await ERC1155WrapperFactory.deploy(
            wrapperInstance.address,
            erc1155Instance.address
        );
        await wrapperFactoryInstance.deployed();
    });

    it("should succeed when minting", async () => {
        const positionId = 3;
        const createWrapper = await wrapperFactoryInstance.createWrapper(
            "Name",
            "SYMBOL",
            positionId
        );
        await createWrapper.wait();
        const wrapperAddress = getExpectedWrapperAddress(
            wrapperFactoryInstance.address,
            positionId
        );
        const ERC1155Wrapper = await ethers.getContractFactory(
            "ERC1155Wrapper"
        );
        const wrapperInstance = await ERC1155Wrapper.attach(wrapperAddress);
        const [account] = await ethers.getSigners();
        const mintedAmount = 1;
        const mint = await erc1155Instance.mint(
            account.address,
            positionId,
            mintedAmount,
            ethers.utils.toUtf8Bytes("")
        );
        await mint.wait();
        const safeTransferFrom = await erc1155Instance.safeTransferFrom(
            account.address,
            wrapperAddress,
            positionId,
            mintedAmount,
            ethers.utils.toUtf8Bytes("")
        );
        await safeTransferFrom.wait();
        expect(await wrapperInstance.balanceOf(account.address)).to.equal(
            mintedAmount
        );
    });

    it("should deploy a wrapper at the expected address (create2)", async () => {
        const positionId = 1662653;
        const tx = await wrapperFactoryInstance.createWrapper(
            "Name",
            "SYMBOL",
            positionId
        );
        const receipt = await tx.wait();
        const wrapperCreationEvent = receipt.events.find(
            (event) => event.event === "WrapperCreated"
        );
        expect(wrapperCreationEvent.args.wrapperAddress).to.equal(
            getExpectedWrapperAddress(
                wrapperFactoryInstance.address,
                positionId
            )
        );
    });
});
