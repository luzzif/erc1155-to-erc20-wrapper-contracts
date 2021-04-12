const ERC1155WrapperFactory = artifacts.require("ERC1155WrapperFactory");
const ERC1155Wrapper = artifacts.require("ERC1155Wrapper");

contract("Factory", () => {
    let wrapperFactoryInstance, wrapperInstance;

    beforeEach(async () => {
        wrapperInstance = await ERC1155Wrapper.new();
        wrapperFactoryInstance = await ERC1155WrapperFactory.new(
            wrapperInstance.address,
            "0x0000000000000000000000000000000000000000"
        );
    });

    it("should succeed when creating", async () => {
        await wrapperFactoryInstance.createWrapper("Name", "SYMBOL", 0);
    });
});
