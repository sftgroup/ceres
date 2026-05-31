// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {CeresDID} from "../src/CeresDID.sol";
import {CeresRegistry} from "../src/CeresRegistry.sol";

contract CeresGasTest is Test {
    CeresDID public did;
    CeresRegistry public registry;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");

    string constant NAME = "Alice";
    string constant BIO = "Web3 builder & NFT enthusiast";
    string constant AVATAR = "ipfs://QmAliceAvatar";
    string[] urls = ["https://alice.eth", "https://twitter.com/alice"];

    function setUp() public {
        did = new CeresDID();
        registry = new CeresRegistry(address(did));
        did.setRegistry(address(registry));
    }

    /// @notice Gas: genesis profile (no inviter)
    function testGas_CreateProfile_Genesis() public {
        vm.prank(alice);
        uint256 tokenId = registry.createProfile(NAME, BIO, AVATAR, urls, 0);
        assertEq(tokenId, 1);
        assertEq(did.ownerOf(1), alice);
    }

    /// @notice Gas: profile with inviter
    function testGas_CreateProfile_WithInviter() public {
        // Alice creates genesis
        vm.prank(alice);
        registry.createProfile(NAME, BIO, AVATAR, urls, 0);

        // Bob is invited by Alice
        string[] memory bobUrls = new string[](1);
        bobUrls[0] = "https://bob.xyz";

        vm.prank(bob);
        uint256 tokenId = registry.createProfile("Bob", "DeFi degen", "ipfs://QmBobAvatar", bobUrls, 1);
        assertEq(tokenId, 2);
        assertEq(registry.getInviter(2), 1);
    }

    /// @notice Gas: profile update
    function testGas_UpdateProfile() public {
        vm.prank(alice);
        registry.createProfile(NAME, BIO, AVATAR, urls, 0);

        string[] memory newUrls = new string[](2);
        newUrls[0] = "https://new.alice.eth";
        newUrls[1] = "https://github.com/alice";

        vm.prank(alice);
        did.updateProfile(1, "Alice v2", "Updated bio", "ipfs://QmNewAvatar", newUrls);

        (string memory name,,, uint256 updatedAt) = did.profiles(1);
        assertEq(name, "Alice v2");
        assertGt(updatedAt, 0);
    }
}
