import { BigNumber } from "ethers";
import {
    solidityKeccak256,
    getCreate2Address,
    solidityPack,
} from "ethers/lib/utils";

export const getExpectedWrapperAddress = (
    factoryAddress: string,
    implementationAddress: string,
    positionId: BigNumber
) => {
    const initCodeHash = solidityKeccak256(
        ["bytes"],
        [
            `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${implementationAddress.replace(
                "0x",
                ""
            )}5af43d82803e903d91602b57fd5bf3`,
        ]
    );
    return getCreate2Address(
        factoryAddress,
        solidityKeccak256(["bytes"], [solidityPack(["uint256"], [positionId])]),
        initCodeHash
    );
};
