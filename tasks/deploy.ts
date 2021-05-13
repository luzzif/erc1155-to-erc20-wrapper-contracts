import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { task } from "hardhat/config";
import {
    ERC1155PositionWrapperFactory__factory,
    ERC1155PositionWrapper__factory,
} from "../typechain";

interface TaskArguments {
    erc1155Address: string;
    verify: boolean;
}

task(
    "deploy",
    "Deploys the fast lane contract and verifies source code on Etherscan"
)
    .addParam("erc1155Address", "The CTF address")
    .addFlag("verify", "Whether to verify or not the source code on Etherscan")
    .setAction(
        async (
            taskArguments: TaskArguments,
            hre: HardhatRuntimeEnvironment
        ) => {
            const { verify, erc1155Address } = taskArguments;

            await hre.run("clean");
            await hre.run("compile");

            const implementationFactory = (await hre.ethers.getContractFactory(
                "ERC1155PositionWrapper"
            )) as ERC1155PositionWrapper__factory;
            const implementation = await implementationFactory.deploy();
            await implementation.deployed();

            const factoryFactory = (await hre.ethers.getContractFactory(
                "ERC1155PositionWrapperFactory"
            )) as ERC1155PositionWrapperFactory__factory;
            const factory = await factoryFactory.deploy(
                implementation.address,
                erc1155Address
            );
            await factory.deployed();

            console.log(
                `erc1155 wrapper factory deployed at address ${factory.address}`
            );

            if (verify) {
                await new Promise((resolve) => {
                    console.log("waiting");
                    setTimeout(resolve, 60000);
                });
                await hre.run("verify", {
                    address: factory.address,
                    constructorArgsParams: [
                        implementation.address,
                        erc1155Address,
                    ],
                });
                console.log(`source code verified`);
            }
        }
    );
