// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CeresDID} from "../src/CeresDID.sol";
import {CeresRegistry} from "../src/CeresRegistry.sol";

/// @title DeployScript
/// @notice Deploys CeresDID and CeresRegistry, then wires them together.
contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // 1. Deploy CeresDID
        CeresDID did = new CeresDID();

        // 2. Deploy CeresRegistry, pointing to the DID contract
        CeresRegistry registry = new CeresRegistry(address(did));

        // 3. Wire: set registry on DID so mint() gate works
        did.setRegistry(address(registry));

        vm.stopBroadcast();

        console.log("=== Ceres Deploy ===");
        console.log("CeresDID:     ", address(did));
        console.log("CeresRegistry:", address(registry));
        console.log("====================");
    }
}
