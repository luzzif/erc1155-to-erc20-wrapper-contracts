import { expect, use as chaiUse } from "chai";
import { ethers, waffle } from "hardhat";
import { getExpectedWrapperAddress } from "./utils";
import { fixture } from "./fixtures";
import { BigNumber } from "ethers";
import { ERC1155PositionWrapper } from "../typechain";
import { parseUnits } from "ethers/lib/utils";

const { solidity, loadFixture } = waffle;
chaiUse(solidity);

describe("Factory", () => {
    it("should succeed when minting", async () => {
        const { wrapperFactory, wrapper, erc1155, account } = await loadFixture(
            fixture
        );
        const positionId = BigNumber.from(3);

        // create wrapper
        const createWrapperTransaction = await wrapperFactory.createWrapper(
            "Name",
            "SYMBOL",
            positionId
        );
        await createWrapperTransaction.wait();

        // deterministically calculate expected address
        const wrapperAddress = getExpectedWrapperAddress(
            wrapperFactory.address,
            wrapper.address,
            positionId
        );

        // attaching a wrapper contract instance to the expected address
        const erc1155PositionWrapper = (await ethers.getContractFactory(
            "ERC1155PositionWrapper"
        )) as unknown as ERC1155PositionWrapper;
        const wrapperInstance = await erc1155PositionWrapper.attach(
            wrapperAddress
        );

        // mint some erc1155 position tokens to the user
        const mintedAmount = parseUnits("1", 18);
        await erc1155.mint(
            account.address,
            positionId,
            mintedAmount.toString(),
            ethers.utils.toUtf8Bytes("")
        );

        // transfer the minted tokens to the wrapper and see them being wrapped
        await erc1155.safeTransferFrom(
            account.address,
            wrapperAddress,
            positionId,
            mintedAmount.toString(),
            ethers.utils.toUtf8Bytes("")
        );

        expect(await wrapperInstance.balanceOf(account.address)).to.equal(
            mintedAmount
        );
    });

    it("should deploy a wrapper at the expected address (create2)", async () => {
        const { wrapperFactory, wrapper } = await loadFixture(fixture);

        const positionId = BigNumber.from(1662653);
        const tx = await wrapperFactory.createWrapper(
            "Name",
            "SYMBOL",
            positionId
        );
        const receipt = await tx.wait();
        const wrapperCreationEvent = receipt.events?.find(
            (event) => event.event === "WrapperCreated"
        );
        if (!wrapperCreationEvent || !wrapperCreationEvent.args) {
            throw new Error("no compatible event found");
        }
        expect(wrapperCreationEvent.args.wrapperAddress).to.equal(
            getExpectedWrapperAddress(
                wrapperFactory.address,
                wrapper.address,
                positionId
            )
        );
    });
});
