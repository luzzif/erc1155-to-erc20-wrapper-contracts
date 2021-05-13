import { HardhatUserConfig } from "hardhat/types/config";
import { config } from "dotenv";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-dependency-compiler";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "./tasks/deploy";

config();

const infuraId = process.env.INFURA_ID;
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const hardhatConfig: HardhatUserConfig = {
    networks: {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${infuraId}`,
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${infuraId}`,
            accounts,
        },
        arbitrumTestnetV3: {
            url: "https://kovan3.arbitrum.io/rpc",
            accounts,
            gasPrice: 0,
        },
        xdai: {
            url: "https://xdai.poanetwork.dev",
            accounts,
            gasPrice: 0,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.GAS_REPORT_ENABLED === "true",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    dependencyCompiler: {
        paths: [
            "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol",
        ],
    },
};

export default hardhatConfig;
