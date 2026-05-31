// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @notice Minimal interface for CeresRegistry callbacks.
interface ICeresRegistry {
    function onDIDTransfer(uint256 tokenId, address from, address to) external;
}

/// @title CeresDID
/// @notice ERC-721 DID NFT with on-chain personal profile storage.
///         Minting is gated through the CeresRegistry.
contract CeresDID is ERC721, Ownable {
    using Strings for uint256;
    using Strings for uint8;
    using Strings for address;

    uint256 private _nextTokenId;

    /// @notice Address of the CeresRegistry, the only contract authorized to mint.
    address public registry;

    struct Profile {
        string name;
        string bio;
        string avatar;  // IPFS / URL of profile photo
        string[] urls;  // social links, websites, etc.
        uint256 updatedAt;
    }

    /// @notice tokenId → Profile
    mapping(uint256 => Profile) public profiles;

    // ───── Events ─────
    event ProfileUpdated(uint256 indexed tokenId, string name);
    event RegistrySet(address indexed registry);

    // ───── Constructor ─────
    constructor() ERC721("Ceres DID", "CERES") Ownable(msg.sender) {}

    // ───── Registry ─────
    /// @notice Set the CeresRegistry address (owner-only).
    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "CeresDID: zero address");
        registry = _registry;
        emit RegistrySet(_registry);
    }

    // ───── Mint ─────
    /// @notice Mint a new DID NFT. Callable ONLY by the CeresRegistry.
    /// @param to Recipient address.
    /// @return tokenId The newly minted token ID.
    function mint(address to) external returns (uint256) {
        require(msg.sender == registry, "CeresDID: only registry");
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        return tokenId;
    }

    // ───── Profile ─────
    /// @notice Update on-chain profile. The NFT owner OR the CeresRegistry may call.
    ///         The Registry is authorized to set the initial profile during mint.
    function updateProfile(
        uint256 tokenId,
        string calldata name,
        string calldata bio,
        string calldata avatar,
        string[] calldata urls
    ) external {
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == registry,
            "CeresDID: not owner or registry"
        );
        require(bytes(name).length > 0, "CeresDID: name required");

        // Limit URL count to avoid block-gas issues
        require(urls.length <= 20, "CeresDID: too many URLs");

        profiles[tokenId] = Profile({
            name: name,
            bio: bio,
            avatar: avatar,
            urls: urls,
            updatedAt: block.timestamp
        });

        emit ProfileUpdated(tokenId, name);
    }

    // ───── View helpers ─────
    function getUrls(uint256 tokenId) external view returns (string[] memory) {
        return profiles[tokenId].urls;
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    // ───── tokenURI (dynamic on-chain JSON) ─────
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Profile memory p = profiles[tokenId];

        // Build JSON manually for gas efficiency.
        // Standard ERC-721 metadata + Ceres profile attributes.
        bytes memory json = abi.encodePacked(
            '{"name":"',
            _escapeJSON(p.name),
            '","description":"',
            _escapeJSON(p.bio),
            '","image":"',
            _escapeJSON(p.avatar),
            '","attributes":[',
                '{"trait_type":"Token ID","value":',
                tokenId.toString(),
                '},',
                '{"trait_type":"Updated At","value":',
                p.updatedAt.toString(),
                '},',
                '{"trait_type":"URL Count","value":',
                p.urls.length.toString(),
                '}'
        );

        // Append each URL as an attribute
        for (uint256 i = 0; i < p.urls.length; i++) {
            json = abi.encodePacked(
                json,
                ',{"trait_type":"URL #',
                (i + 1).toString(),
                '","value":"',
                _escapeJSON(p.urls[i]),
                '"}'
            );
        }

        json = abi.encodePacked(json, ']}');

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(json)
            )
        );
    }

    // ───── Internal ─────

    /// @dev Hook that fires on every transfer; notifies the CeresRegistry.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address prevOwner = super._update(to, tokenId, auth);

        if (registry != address(0) && from != to) {
            ICeresRegistry(registry).onDIDTransfer(tokenId, from, to);
        }

        return prevOwner;
    }

    /// @dev Escape a string for safe inclusion in JSON (minimal version).
    ///      Escapes backslash and double-quote.
    function _escapeJSON(string memory s) internal pure returns (string memory) {
        bytes memory input = bytes(s);
        if (input.length == 0) return s;

        // Count how many chars need escaping
        uint256 escapes;
        for (uint256 i = 0; i < input.length; i++) {
            bytes1 c = input[i];
            if (c == '"' || c == '\\') escapes++;
        }
        if (escapes == 0) return s;

        bytes memory output = new bytes(input.length + escapes);
        uint256 j;
        for (uint256 i = 0; i < input.length; i++) {
            bytes1 c = input[i];
            if (c == '\\') {
                output[j++] = '\\';
                output[j++] = '\\';
            } else if (c == '"') {
                output[j++] = '\\';
                output[j++] = '"';
            } else {
                output[j++] = c;
            }
        }
        return string(output);
    }
}
