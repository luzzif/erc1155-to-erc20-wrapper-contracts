const { task } = require("hardhat/config");

task(
    "deploy",
    "Deploys the fast lane contract and verifies source code on Etherscan"
)
    .addParam("conditionalTokensAddress", "The CTF address")
    .addFlag("verify", "Whether to verify or not the source code on Etherscan")
    .setAction(async (taskArguments, hre) => {
        const { verify, conditionalTokensAddress } = taskArguments;

        await hre.run("clean");
        await hre.run("compile");

        const ERC1155Wrapper = hre.artifacts.require("ERC1155Wrapper");
        const wrapperImplementation = await ERC1155Wrapper.new();

        const ERC1155WrapperFactory = hre.artifacts.require(
            "ERC1155WrapperFactory"
        );
        const factory = await ERC1155WrapperFactory.new(
            wrapperImplementation.address,
            conditionalTokensAddress
        );

        console.log(
            `wrapper implementation deployed at address ${wrapperImplementation.address}`
        );
        console.log(`wrapper factory deployed at address ${factory.address}`);

        if (verify) {
            await new Promise((resolve) => {
                console.log("waiting");
                setTimeout(resolve, 60000);
            });
            await hre.run("verify", {
                address: factory.address,
                constructorArgsParams: [
                    wrapperImplementation.address,
                    conditionalTokensAddress,
                ],
            });
            console.log(`source code verified`);
        }
    });
